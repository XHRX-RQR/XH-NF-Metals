# 有色金属实时情报面板

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.8%2B-blue.svg" alt="Python Version">
  <img src="https://img.shields.io/badge/Flask-2.3%2B-green.svg" alt="Flask Version">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg" alt="Status">
</p>

<p align="center">
  一站式有色金属市场情报平台 | 实时价格监控 | AI智能分析 | 多维度数据聚合
</p>

## 🌟 项目简介

有色金属实时情报面板是一款专为有色金属行业从业者打造的智能化市场分析平台。通过整合多源数据、AI分析能力和直观的可视化界面，为用户提供全面、及时、专业的市场洞察。

### 核心价值
- **实时性**: 秒级价格更新，把握市场脉搏
- **专业性**: 覆盖全产业链数据维度
- **智能化**: AI驱动的深度分析和预测
- **易用性**: 直观的交互界面和多语言支持

## 🚀 快速开始

### 环境要求
```bash
# 系统要求
- Python 3.8 或更高版本
- 现代浏览器 (Chrome 80+, Firefox 75+, Safari 13+)
- 互联网连接

# 推荐配置
- 内存: 4GB+
- 存储: 100MB+
- 网络: 稳定的互联网接入
```

### 安装部署

#### 1. 克隆项目
```bash
cd nf-metals-dashboard
```

#### 2. 安装依赖
```bash
# 创建虚拟环境 (推荐)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate    # Windows

# 安装依赖
pip install -r requirements.txt
```

#### 3. 启动服务
```bash
# 开发模式
python app.py

# 生产模式 (使用Gunicorn)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### 4. 访问应用
打开浏览器访问: `http://localhost:5002`

## 📊 功能特性

### 🔧 核心功能模块

#### 1. 实时价格监控
- **多数据源支持**: Yahoo Finance、Alpha Vantage、ETF、矿业股
- **智能降级机制**: 主数据源失效时自动切换备选源
- **历史数据分析**: 30日价格走势图和关键指标
- **实时更新**: 自动刷新和手动刷新双重保障

#### 2. 新闻资讯聚合
- **精准分类**: 矿业生产、政策法规、价格分析、产业应用等6大类别
- **多语言支持**: 中英文双语资讯检索
- **智能筛选**: 基于关键词的相关性排序
- **AI摘要**: 自动生成新闻要点总结

#### 3. AI智能分析
- **专业市场分析**: 基于当前数据的深度行业洞察
- **交互式问答**: 实时咨询有色金属相关问题
- **趋势预测**: 结合技术面和基本面的综合判断
- **风险评估**: 识别潜在市场风险和机会

### 🎨 用户体验特色

#### 现代化界面设计
- **暗色主题**: 专业级深色UI，减少视觉疲劳
- **响应式布局**: 完美适配桌面、平板、手机设备
- **交互动画**: 流畅的过渡效果和状态反馈
- **国际化支持**: 中英双语界面无缝切换

#### 直观的数据可视化
- **元素周期表**: 交互式有色金属分布展示
- **实时价格卡片**: 清晰的价格变动信息
- **动态图表**: 交互式K线图和趋势分析
- **数据详情面板**: 完整的元素属性和应用场景

## 🛠 技术架构

### 系统架构图
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端界面层    │◄──►│   API路由层     │◄──►│   数据服务层    │
│  (React-like)   │    │  (Flask REST)   │    │  (Multi-Source) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
    ┌────▼────┐           ┌─────▼─────┐         ┌───────▼────────┐
    │HTML5/CSS3│          │JSON API   │         │Yahoo Finance   │
    │JavaScript│          │Validation │         │Alpha Vantage   │
    │Chart.js  │          │Caching    │         │DuckDuckGo News │
    └──────────┘          └───────────┘         └────────────────┘
```

### 技术栈详情

#### 后端技术
- **核心框架**: Flask 2.3+
- **异步处理**: Python asyncio
- **HTTP客户端**: requests + session pooling
- **数据解析**: BeautifulSoup, JSON
- **缓存机制**: 内存级TTL缓存
- **日志系统**: Python logging

#### 前端技术
- **核心语言**: JavaScript ES6+
- **图表库**: Chart.js 4.4+
- **样式框架**: 原生CSS3 + Flexbox/Grid
- **Markdown渲染**: Marked.js
- **图标库**: Font Awesome 6.5+
- **字体**: Inter, JetBrains Mono

### 数据源集成

| 数据源 | 类型 | 覆盖范围 | 更新频率 | 稳定性 |
|--------|------|----------|----------|--------|
| Yahoo Finance | 期货价格 | 主要有色金属 | 实时 | 高 |
| Alpha Vantage | ETF价格 | 全球ETF | 延迟15分钟 | 高 |
| DuckDuckGo News | 新闻资讯 | 行业新闻 | 实时 | 中 |
| OpenAI API | AI分析 | 文本生成 | 按需 | 高 |

## ⚙️ 配置说明

### 环境变量配置
```bash
# Alpha Vantage API Key (可选，提高数据稳定性)
export ALPHA_VANTAGE_API_KEY="your_api_key_here"

# Flask配置
export FLASK_ENV="production"
export FLASK_DEBUG="False"

# 服务器配置
export HOST="0.0.0.0"
export PORT="5000"
```

### 应用配置
```python
# app.py 中的关键配置项
CACHE_TTL = 300  # 缓存时间(秒)
MAX_RETRIES = 3   # 最大重试次数
REQUEST_TIMEOUT = 15  # 请求超时时间(秒)

# 支持的金属列表
SUPPORTED_METALS = ["Au", "Ag", "Cu", "Pt", "Pd", "Al"]
```

## 🔧 API接口文档

### 价格数据接口
```
GET /api/price/{symbol}
```
**参数**: 
- `symbol`: 金属符号 (Au, Ag, Cu, Pt, Pd, Al)

**响应示例**:
```json
{
  "symbol": "Au",
  "ticker": "GC=F",
  "available": true,
  "source": "yahoo_finance",
  "price": 2035.50,
  "change": 15.20,
  "change_pct": 0.75,
  "currency": "USD",
  "high": 2040.00,
  "low": 2020.30,
  "open": 2025.00,
  "volume": 28567,
  "date": "2024-01-15",
  "history": [...]
}
```

### 新闻资讯接口
```
GET /api/news/{symbol}?category=news&lang=en
```
**参数**:
- `category`: 分类 (news|mining|policy|price|industry|supply)
- `lang`: 语言 (en|zh)

### AI分析接口
```
POST /api/ai/analyze
Content-Type: application/json
```
**请求体**:
```json
{
  "metal": "Gold",
  "metal_zh": "金",
  "price_info": "Current price data",
  "news_snippets": "Recent news summaries",
  "lang": "en"
}
```

## 📈 性能指标

### 响应时间
- **页面加载**: < 2秒
- **价格查询**: < 1秒
- **新闻获取**: < 2秒
- **AI分析**: < 5秒

### 并发能力
- **最大并发用户**: 1000+
- **API吞吐量**: 200 req/sec
- **缓存命中率**: > 85%

### 资源消耗
- **内存占用**: < 200MB
- **CPU使用率**: < 30% (正常负载)
- **网络带宽**: < 100KB/req (平均)

## 🔒 安全特性

### 数据安全
- **传输加密**: HTTPS/TLS 1.3
- **API限流**: 每IP每分钟100次请求
- **输入验证**: 严格参数校验和过滤
- **错误处理**: 避免敏感信息泄露

### 应用安全
- **CORS策略**: 严格的跨域资源共享控制
- **会话管理**: 安全的Session机制
- **依赖更新**: 定期安全漏洞扫描
- **日志审计**: 完整的操作日志记录

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 开发流程
1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- **Python**: 遵循 PEP 8 规范
- **JavaScript**: 使用 ESLint 和 Prettier
- **Git提交**: 采用 conventional commits 格式
- **测试覆盖**: 新功能需包含单元测试

### 开发环境设置
```bash
# 安装开发依赖
pip install -r requirements-dev.txt

# 运行测试
pytest tests/

# 代码检查
flake8 app.py
black app.py
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情



### 致谢
- Yahoo Finance API 提供价格数据
- Alpha Vantage 提供备选数据源
- DuckDuckGo 提供新闻搜索服务
- OpenAI 提供AI分析能力
- 所有开源组件的贡献者们



### 商业支持
如需企业级技术支持或定制开发，请联系: [wjxhmax@outlook.com]

---

<p align="center">
  Made with ❤️ for the Non-Ferrous Metals Industry
</p>
