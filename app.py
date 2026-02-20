"""
Non-Ferrous Metals Real-Time Intelligence Dashboard
Backend: Flask + yfinance + DuckDuckGo Search + OpenAI-compatible LLM
"""

import json
import logging
import os
import time
from datetime import datetime, timedelta

import requests
from bs4 import BeautifulSoup
from ddgs import DDGS
from flask import Flask, Response, jsonify, render_template, request, stream_with_context
from openai import OpenAI

app = Flask(__name__)
app.config["SECRET_KEY"] = os.urandom(24).hex()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# LLM settings (stored in memory; persisted per session)
# ---------------------------------------------------------------------------
llm_settings = {
    "api_key": "",
    "base_url": "https://api.openai.com/v1",
    "model": "gpt-4o",
    "temperature": 0.7,
}

# ---------------------------------------------------------------------------
# Commodity ticker mappings for different data sources
# ---------------------------------------------------------------------------

# Yahoo Finance futures symbols
YAHOO_TICKERS = {
    "Au": "GC=F",      # Gold Futures
    "Ag": "SI=F",      # Silver Futures
    "Cu": "HG=F",      # Copper Futures
    "Pt": "PL=F",      # Platinum Futures
    "Pd": "PA=F",      # Palladium Futures
    "Al": "ALI=F",     # Aluminum Futures
}

# Alternative: Metal ETF symbols for spot prices
ETF_TICKERS = {
    "Au": "GLD",       # SPDR Gold Shares
    "Ag": "SLV",       # iShares Silver Trust
    "Cu": "CPER",      # Copper ETF
    "Pt": "PPLT",      # Platinum ETF
    "Pd": "PALL",      # Palladium ETF
    "Al": "JJUB",      # Aluminum ETF (Invesco DB)
}

# Fallback: Stock ticker symbols for mining companies
STOCK_TICKERS = {
    "Au": "NEM",       # Newmont Corporation
    "Ag": "SLW",       # Silver Wheaton
    "Cu": "FCX",       # Freeport-McMoRan
    "Pt": "SIBN.L",    # Sibanye-Stillwater
    "Pd": "SIBN.L",    # Sibanye-Stillwater
    "Al": "ACH",       # Aluminum Corp of China
}

# ---------------------------------------------------------------------------
# Metal metadata – search keywords per news category
# ---------------------------------------------------------------------------
METAL_SEARCH_TEMPLATES = {
    "news":       "{metal} metal market news today",
    "mining":     "{metal} mining production output supply",
    "policy":     "{metal} trade policy tariff regulation export ban",
    "price":      "{metal} price forecast market analysis",
    "industry":   "{metal} demand industry application downstream",
    "supply":     "{metal} supply chain smelting refinery inventory",
}

# Simple in-memory cache:  key -> (timestamp, data)
_cache: dict[str, tuple[float, object]] = {}
CACHE_TTL = 300  # 5 minutes

# Alpha Vantage API key (free tier: 5 requests per minute, 500 per day)
# 用户需要自己申请免费 API Key: https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY = os.environ.get("ALPHA_VANTAGE_API_KEY", "")

# 数据源优先级顺序
PRICE_SOURCES = [
    "yahoo_finance",    # 首选: Yahoo Finance (期货价格)
    "alpha_vantage",    # 备选1: Alpha Vantage (需要API key)
    "metal_etf",        # 备选2: Metal ETF价格
    "mining_stock",     # 备选3: 矿业公司股价
]

# Persistent HTTP session for Yahoo Finance
_yf_session = requests.Session()
_yf_session.headers["User-Agent"] = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
# Warm cookie
try:
    _yf_session.get("https://fc.yahoo.com", timeout=5)
except Exception:
    pass


def _cache_get(key: str):
    if key in _cache:
        ts, data = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return data
    return None


def _cache_set(key: str, data):
    _cache[key] = (time.time(), data)


def _format_error(symbol: str, source: str, error_msg: str) -> dict:
    """格式化错误响应"""
    return {
        "symbol": symbol,
        "available": False,
        "source": source,
        "message": error_msg
    }


# ---------------------------------------------------------------------------
#  Routes – Pages
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html")


# ---------------------------------------------------------------------------
#  Price Data Sources
# ---------------------------------------------------------------------------

def _fetch_yahoo_finance(symbol: str, ticker: str) -> dict:
    """从 Yahoo Finance 获取期货价格"""
    logger.info(f"[Yahoo Finance] Fetching {symbol} ({ticker})")
    
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
    params = {"range": "1mo", "interval": "1d"}
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            resp = _yf_session.get(url, params=params, timeout=15)
            if resp.status_code == 200 and resp.text:
                data = resp.json()
                
                chart = data.get("chart", {})
                if chart.get("error"):
                    error_desc = chart["error"].get("description", "Unknown API error")
                    raise Exception(f"API Error: {error_desc}")
                
                result_data = chart.get("result", [{}])[0]
                if not result_data:
                    raise Exception("No data returned from API")
                    
                meta = result_data.get("meta", {})
                timestamps = result_data.get("timestamp", [])
                indicators = result_data.get("indicators", {})
                quotes = indicators.get("quote", [{}])[0]

                if not timestamps or not quotes.get("close"):
                    raise Exception("Missing required data fields")

                closes = quotes["close"]
                opens = quotes.get("open", closes)
                highs = quotes.get("high", closes)
                lows = quotes.get("low", closes)
                volumes = quotes.get("volume", [0] * len(closes))

                # Filter out None values
                valid = [(i, c) for i, c in enumerate(closes) if c is not None]
                if len(valid) < 1:
                    raise Exception("No valid price data available")

                last_idx = valid[-1][0]
                prev_idx = valid[-2][0] if len(valid) > 1 else last_idx

                price = closes[last_idx]
                prev_price = closes[prev_idx]
                change = price - prev_price
                change_pct = (change / prev_price) * 100 if prev_price else 0

                history = []
                for i, ts in enumerate(timestamps):
                    if closes[i] is None:
                        continue
                    dt = datetime.utcfromtimestamp(ts)
                    history.append({
                        "date": dt.strftime("%Y-%m-%d"),
                        "open": round(opens[i] or 0, 2),
                        "high": round(highs[i] or 0, 2),
                        "low": round(lows[i] or 0, 2),
                        "close": round(closes[i], 2),
                        "volume": int(volumes[i] or 0),
                    })

                return {
                    "symbol": symbol,
                    "ticker": ticker,
                    "available": True,
                    "source": "yahoo_finance",
                    "price": round(price, 2),
                    "change": round(change, 2),
                    "change_pct": round(change_pct, 2),
                    "currency": meta.get("currency", "USD"),
                    "high": round(highs[last_idx] or price, 2),
                    "low": round(lows[last_idx] or price, 2),
                    "open": round(opens[last_idx] or price, 2),
                    "volume": int(volumes[last_idx] or 0),
                    "date": datetime.utcfromtimestamp(timestamps[last_idx]).strftime("%Y-%m-%d"),
                    "history": history,
                }
            elif attempt < max_retries - 1:
                logger.warning(f"[Yahoo Finance] Attempt {attempt + 1} failed for {symbol}: Status {resp.status_code}, retrying...")
                time.sleep(1)
            else:
                raise Exception(f"Failed after {max_retries} attempts. Status: {resp.status_code}")
                
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                logger.warning(f"[Yahoo Finance] Attempt {attempt + 1} timed out for {symbol}, retrying...")
                time.sleep(1)
            else:
                raise Exception(f"Request timeout after {max_retries} attempts")
        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(f"[Yahoo Finance] Attempt {attempt + 1} failed with error for {symbol}: {str(e)}, retrying...")
                time.sleep(1)
            else:
                raise Exception(f"Network error after {max_retries} attempts: {str(e)}")
    
    raise Exception("All retry attempts exhausted")


def _fetch_alpha_vantage(symbol: str, ticker: str) -> dict:
    """从 Alpha Vantage 获取价格 (需要API Key)"""
    if not ALPHA_VANTAGE_API_KEY:
        raise Exception("Alpha Vantage API key not configured")
    
    logger.info(f"[Alpha Vantage] Fetching {symbol} ({ticker})")
    
    url = "https://www.alphavantage.co/query"
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": ticker,
        "apikey": ALPHA_VANTAGE_API_KEY,
        "outputsize": "compact"  # 最近100个交易日
    }
    
    resp = requests.get(url, params=params, timeout=15)
    if resp.status_code != 200:
        raise Exception(f"HTTP {resp.status_code}")
    
    data = resp.json()
    
    if "Error Message" in data:
        raise Exception(data["Error Message"])
    
    if "Note" in data:
        raise Exception("API call frequency limit reached")
    
    time_series = data.get("Time Series (Daily)")
    if not time_series:
        raise Exception("No time series data returned")
    
    # 获取最近的两个交易日
    dates = sorted(time_series.keys(), reverse=True)[:2]
    if len(dates) < 2:
        raise Exception("Insufficient historical data")
    
    latest_date = dates[0]
    prev_date = dates[1]
    
    latest_data = time_series[latest_date]
    prev_data = time_series[prev_date]
    
    price = float(latest_data["4. close"])
    prev_price = float(prev_data["4. close"])
    change = price - prev_price
    change_pct = (change / prev_price) * 100
    
    # 构建历史数据 (最近30天)
    history = []
    for date_str in dates[:30]:
        day_data = time_series[date_str]
        history.append({
            "date": date_str,
            "open": round(float(day_data["1. open"]), 2),
            "high": round(float(day_data["2. high"]), 2),
            "low": round(float(day_data["3. low"]), 2),
            "close": round(float(day_data["4. close"]), 2),
            "volume": int(day_data["5. volume"]),
        })
    
    return {
        "symbol": symbol,
        "ticker": ticker,
        "available": True,
        "source": "alpha_vantage",
        "price": round(price, 2),
        "change": round(change, 2),
        "change_pct": round(change_pct, 2),
        "currency": "USD",
        "high": round(float(latest_data["2. high"]), 2),
        "low": round(float(latest_data["3. low"]), 2),
        "open": round(float(latest_data["1. open"]), 2),
        "volume": int(latest_data["5. volume"]),
        "date": latest_date,
        "history": history,
    }


def _fetch_generic_yahoo(symbol: str, ticker: str, source_name: str) -> dict:
    """通用 Yahoo Finance 数据获取 (用于ETF和股票)"""
    logger.info(f"[{source_name}] Fetching {symbol} ({ticker})")
    
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
    params = {"range": "1mo", "interval": "1d"}
    
    resp = _yf_session.get(url, params=params, timeout=15)
    if resp.status_code != 200:
        raise Exception(f"HTTP {resp.status_code}")
    
    data = resp.json()
    chart = data.get("chart", {})
    if chart.get("error"):
        raise Exception(chart["error"].get("description", "API error"))
    
    result_data = chart.get("result", [{}])[0]
    if not result_data:
        raise Exception("No data returned")
    
    meta = result_data.get("meta", {})
    timestamps = result_data.get("timestamp", [])
    indicators = result_data.get("indicators", {})
    quotes = indicators.get("quote", [{}])[0]
    
    if not timestamps or not quotes.get("close"):
        raise Exception("Missing data fields")
    
    closes = quotes["close"]
    valid = [(i, c) for i, c in enumerate(closes) if c is not None]
    if len(valid) < 2:
        raise Exception("Insufficient data points")
    
    last_idx = valid[-1][0]
    prev_idx = valid[-2][0]
    
    price = closes[last_idx]
    prev_price = closes[prev_idx]
    change = price - prev_price
    change_pct = (change / prev_price) * 100
    
    # 简化的5天历史数据
    history = []
    for i in range(min(5, len(valid))):
        idx = valid[-(i+1)][0]
        ts = timestamps[idx]
        dt = datetime.utcfromtimestamp(ts)
        history.append({
            "date": dt.strftime("%Y-%m-%d"),
            "open": round(quotes.get("open", [0]*len(closes))[idx] or price, 2),
            "high": round(quotes.get("high", [0]*len(closes))[idx] or price, 2),
            "low": round(quotes.get("low", [0]*len(closes))[idx] or price, 2),
            "close": round(closes[idx], 2),
            "volume": int(quotes.get("volume", [0]*len(closes))[idx] or 0),
        })
    
    return {
        "symbol": symbol,
        "ticker": ticker,
        "available": True,
        "source": source_name.lower().replace(" ", "_"),
        "price": round(price, 2),
        "change": round(change, 2),
        "change_pct": round(change_pct, 2),
        "currency": meta.get("currency", "USD"),
        "high": round(quotes.get("high", [0]*len(closes))[last_idx] or price, 2),
        "low": round(quotes.get("low", [0]*len(closes))[last_idx] or price, 2),
        "open": round(quotes.get("open", [0]*len(closes))[last_idx] or price, 2),
        "volume": int(quotes.get("volume", [0]*len(closes))[last_idx] or 0),
        "date": datetime.utcfromtimestamp(timestamps[last_idx]).strftime("%Y-%m-%d"),
        "history": history,
    }


def get_price_multi_source(symbol: str) -> dict:
    """多数据源价格获取 - 自动尝试不同数据源直到成功"""
    errors = []
    
    for source in PRICE_SOURCES:
        try:
            if source == "yahoo_finance":
                ticker = YAHOO_TICKERS.get(symbol)
                if not ticker:
                    errors.append((source, "No ticker symbol configured"))
                    continue
                return _fetch_yahoo_finance(symbol, ticker)
                
            elif source == "alpha_vantage":
                ticker = ETF_TICKERS.get(symbol, YAHOO_TICKERS.get(symbol))
                if not ticker:
                    errors.append((source, "No ticker symbol configured"))
                    continue
                return _fetch_alpha_vantage(symbol, ticker)
                
            elif source == "metal_etf":
                ticker = ETF_TICKERS.get(symbol)
                if not ticker:
                    errors.append((source, "No ETF ticker symbol configured"))
                    continue
                return _fetch_generic_yahoo(symbol, ticker, "Metal ETF")
                
            elif source == "mining_stock":
                ticker = STOCK_TICKERS.get(symbol)
                if not ticker:
                    errors.append((source, "No stock ticker symbol configured"))
                    continue
                return _fetch_generic_yahoo(symbol, ticker, "Mining Stock")
                
        except Exception as e:
            error_msg = str(e)
            logger.warning(f"Source {source} failed for {symbol}: {error_msg}")
            errors.append((source, error_msg))
            continue
    
    # 所有数据源都失败
    error_details = "\n".join([f"- {src}: {msg}" for src, msg in errors])
    return _format_error(
        symbol, 
        "all_sources", 
        f"All data sources failed:\n{error_details}\n\nAvailable metals: {', '.join(YAHOO_TICKERS.keys())}"
    )
@app.route("/api/price/<symbol>")
def get_price(symbol: str):
    """Return latest price data for a metal element symbol (e.g. Cu, Au)."""
    symbol = symbol.strip()
    cache_key = f"price:{symbol}"
    cached = _cache_get(cache_key)
    if cached is not None:
        # 如果缓存中的数据是成功的，直接返回
        if isinstance(cached, dict) and cached.get("available", False):
            return jsonify(cached)
        # 如果缓存中的数据是失败的，允许重新尝试
        
    # 使用多数据源方法获取价格
    try:
        result = get_price_multi_source(symbol)
        if result.get("available", False):
            _cache_set(cache_key, result)
            logger.info(f"Successfully fetched price for {symbol} from {result.get('source', 'unknown')} source: ${result['price']}")
        else:
            logger.warning(f"Failed to fetch price for {symbol}: {result.get('message', 'Unknown error')}")
        return jsonify(result)
    except Exception as e:
        logger.exception(f"Unexpected error in get_price for {symbol}")
        return jsonify(_format_error(symbol, "exception", str(e)))


# ---------------------------------------------------------------------------
#  Routes – News / Information
# ---------------------------------------------------------------------------
@app.route("/api/news/<symbol>")
def get_news(symbol: str):
    """Fetch categorised news for a metal element."""
    category = request.args.get("category", "news")
    lang = request.args.get("lang", "en")
    metal_name = request.args.get("name", symbol)

    cache_key = f"news:{symbol}:{category}:{lang}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return jsonify(cached)

    template = METAL_SEARCH_TEMPLATES.get(category, METAL_SEARCH_TEMPLATES["news"])
    query = template.format(metal=metal_name)
    if lang == "zh":
        query = query + " 中文"

    articles = []
    try:
        with DDGS() as ddgs:
            results = list(ddgs.news(query, max_results=12))
            for r in results:
                articles.append({
                    "title": r.get("title", ""),
                    "url": r.get("url", r.get("link", "")),
                    "body": r.get("body", ""),
                    "date": r.get("date", ""),
                    "source": r.get("source", ""),
                    "image": r.get("image", ""),
                })
    except Exception as e:
        logger.warning("DuckDuckGo news error: %s – falling back to text search", e)
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=12))
                for r in results:
                    articles.append({
                        "title": r.get("title", ""),
                        "url": r.get("href", ""),
                        "body": r.get("body", ""),
                        "date": "",
                        "source": "",
                        "image": "",
                    })
        except Exception as e2:
            logger.error("Text search also failed: %s", e2)

    result = {"symbol": symbol, "category": category, "articles": articles}
    _cache_set(cache_key, result)
    return jsonify(result)


# ---------------------------------------------------------------------------
#  Helpers – LLM client
# ---------------------------------------------------------------------------
def _get_llm_client() -> OpenAI | None:
    if not llm_settings.get("api_key"):
        return None
    return OpenAI(
        api_key=llm_settings["api_key"],
        base_url=llm_settings.get("base_url", "https://api.openai.com/v1"),
    )


SYSTEM_PROMPT_ZH = (
    "你是一位资深有色金属行业分析师，拥有丰富的矿业、冶炼、贸易政策和市场分析经验。"
    "请用专业、简练的语言回答问题。输出使用 Markdown 格式。"
)

SYSTEM_PROMPT_EN = (
    "You are a senior non-ferrous metals industry analyst with deep expertise in mining, "
    "smelting, trade policies, and market analysis. Respond professionally and concisely. "
    "Use Markdown formatting."
)


# ---------------------------------------------------------------------------
#  Routes – AI Summarize
# ---------------------------------------------------------------------------
@app.route("/api/ai/summarize", methods=["POST"])
def ai_summarize():
    """Use LLM to summarize a list of news articles."""
    client = _get_llm_client()
    if client is None:
        return jsonify({"error": "LLM API not configured. Please set your API key in Settings."}), 400

    data = request.json or {}
    articles = data.get("articles", [])
    metal = data.get("metal", "unknown metal")
    lang = data.get("lang", "en")

    if not articles:
        return jsonify({"error": "No articles provided."}), 400

    articles_text = "\n\n".join(
        f"**{a.get('title', '')}**\n{a.get('body', '')}" for a in articles[:10]
    )
    sys_prompt = SYSTEM_PROMPT_ZH if lang == "zh" else SYSTEM_PROMPT_EN
    user_prompt = (
        f"以下是关于 **{metal}** 的最新资讯，请提取核心要点并生成一份专业摘要，"
        f"涵盖价格走势、供需动态、政策变化和行业影响。\n\n{articles_text}"
    ) if lang == "zh" else (
        f"Below are the latest articles about **{metal}**. Extract key points and generate "
        f"a professional summary covering price trends, supply-demand dynamics, policy changes, "
        f"and industry impact.\n\n{articles_text}"
    )

    try:
        resp = client.chat.completions.create(
            model=llm_settings["model"],
            temperature=llm_settings["temperature"],
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        return jsonify({"summary": resp.choices[0].message.content})
    except Exception as e:
        logger.error("AI summarize error: %s", e)
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
#  Routes – AI Analyze
# ---------------------------------------------------------------------------
@app.route("/api/ai/analyze", methods=["POST"])
def ai_analyze():
    """Generate a comprehensive professional analysis via LLM (streaming)."""
    client = _get_llm_client()
    if client is None:
        return jsonify({"error": "LLM API not configured. Please set your API key in Settings."}), 400

    data = request.json or {}
    metal = data.get("metal", "unknown metal")
    metal_zh = data.get("metal_zh", metal)
    price_info = data.get("price_info", "N/A")
    news_snippets = data.get("news_snippets", "")
    lang = data.get("lang", "en")

    sys_prompt = SYSTEM_PROMPT_ZH if lang == "zh" else SYSTEM_PROMPT_EN

    if lang == "zh":
        user_prompt = (
            f"请对 **{metal_zh}（{metal}）** 进行全面的专业市场分析。\n\n"
            f"## 当前价格信息\n{price_info}\n\n"
            f"## 近期资讯摘要\n{news_snippets}\n\n"
            f"请从以下角度展开分析：\n"
            f"1. **市场概况与价格走势**\n"
            f"2. **供给侧分析**（矿山产能、冶炼产能、库存变化）\n"
            f"3. **需求侧分析**（下游行业、新兴应用、替代风险）\n"
            f"4. **政策与贸易环境**（关税、出口管制、环保法规）\n"
            f"5. **风险因素与关注要点**\n"
            f"6. **短期展望**\n"
        )
    else:
        user_prompt = (
            f"Provide a comprehensive professional market analysis for **{metal}**.\n\n"
            f"## Current Price Info\n{price_info}\n\n"
            f"## Recent News Summary\n{news_snippets}\n\n"
            f"Analyze from the following perspectives:\n"
            f"1. **Market Overview & Price Trend**\n"
            f"2. **Supply Side** (mine capacity, smelter capacity, inventory)\n"
            f"3. **Demand Side** (downstream industries, emerging applications, substitution risk)\n"
            f"4. **Policy & Trade Environment** (tariffs, export controls, environmental regulations)\n"
            f"5. **Risk Factors & Key Watchpoints**\n"
            f"6. **Short-Term Outlook**\n"
        )

    def generate():
        try:
            stream = client.chat.completions.create(
                model=llm_settings["model"],
                temperature=llm_settings["temperature"],
                messages=[
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta if chunk.choices else None
                if delta and delta.content:
                    yield f"data: {json.dumps({'content': delta.content})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error("AI analyze stream error: %s", e)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return Response(stream_with_context(generate()), mimetype="text/event-stream")


# ---------------------------------------------------------------------------
#  Routes – AI Chat
# ---------------------------------------------------------------------------
@app.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    """Interactive AI chat with streaming response."""
    client = _get_llm_client()
    if client is None:
        return jsonify({"error": "LLM API not configured. Please set your API key in Settings."}), 400

    data = request.json or {}
    messages = data.get("messages", [])
    metal = data.get("metal", "")
    metal_zh = data.get("metal_zh", metal)
    context = data.get("context", "")
    lang = data.get("lang", "en")

    sys_prompt = SYSTEM_PROMPT_ZH if lang == "zh" else SYSTEM_PROMPT_EN
    if metal:
        if lang == "zh":
            sys_prompt += f"\n\n当前用户正在查看 **{metal_zh}（{metal}）** 的信息面板。"
        else:
            sys_prompt += f"\n\nThe user is currently viewing the info panel for **{metal}**."
    if context:
        sys_prompt += f"\n\nContext data:\n{context}"

    full_messages = [{"role": "system", "content": sys_prompt}] + messages

    def generate():
        try:
            stream = client.chat.completions.create(
                model=llm_settings["model"],
                temperature=llm_settings["temperature"],
                messages=full_messages,
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta if chunk.choices else None
                if delta and delta.content:
                    yield f"data: {json.dumps({'content': delta.content})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error("AI chat stream error: %s", e)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return Response(stream_with_context(generate()), mimetype="text/event-stream")


# ---------------------------------------------------------------------------
#  Routes – Settings
# ---------------------------------------------------------------------------
@app.route("/api/settings", methods=["GET", "POST"])
def settings():
    if request.method == "GET":
        safe = {k: ("***" if k == "api_key" and v else v) for k, v in llm_settings.items()}
        return jsonify(safe)

    data = request.json or {}
    if "api_key" in data and data["api_key"] and data["api_key"] != "***":
        llm_settings["api_key"] = data["api_key"]
    if "base_url" in data and data["base_url"]:
        llm_settings["base_url"] = data["base_url"]
    if "model" in data and data["model"]:
        llm_settings["model"] = data["model"]
    if "temperature" in data:
        llm_settings["temperature"] = float(data["temperature"])

    return jsonify({"status": "ok"})


# ---------------------------------------------------------------------------
#  Routes – Cache clear
# ---------------------------------------------------------------------------
@app.route("/api/cache/clear", methods=["POST"])
def clear_cache():
    symbol = (request.json or {}).get("symbol")
    if symbol:
        keys_to_del = [k for k in _cache if k.split(":")[1] == symbol]
        for k in keys_to_del:
            del _cache[k]
    else:
        _cache.clear()
    return jsonify({"status": "ok"})


# ---------------------------------------------------------------------------
#  Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5003)
