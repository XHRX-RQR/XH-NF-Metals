/* ================================================================
   NF-Metals Dashboard – Frontend Application
   ================================================================ */

// ---------------------------------------------------------------------------
//  i18n – Bilingual Support
// ---------------------------------------------------------------------------
const I18N = {
    en: {
        subtitle: "Real-Time Intelligence Dashboard",
        llm_offline: "LLM Offline",
        llm_online: "LLM Online",
        periodic_table: "Periodic Table of Elements",
        refresh: "Refresh",
        tab_overview: "Overview",
        tab_news: "News & Intel",
        tab_analysis: "AI Analysis",
        tab_chat: "AI Chat",
        market_price: "Market Price",
        price_chart: "Price Chart (30D)",
        element_props: "Element Properties",
        key_apps: "Key Applications",
        cat_all: "All News",
        cat_mining: "Mining",
        cat_policy: "Policy",
        cat_price: "Price",
        cat_industry: "Industry",
        cat_supply: "Supply Chain",
        ai_summary: "AI Summary",
        analysis_desc: "Generate a comprehensive AI-powered market analysis for the selected metal based on current data and news.",
        generate_analysis: "Generate Analysis",
        chat_welcome: "Ask me anything about this metal — market trends, technical properties, supply chain, trade policies, and more.",
        chat_placeholder: "Ask a question...",
        settings_title: "LLM API Settings",
        cancel: "Cancel",
        save: "Save",
        no_price: "No live price data available for this metal.",
        loading: "Loading...",
        error_llm: "LLM API not configured. Please go to Settings.",
        open: "Open",
        high: "High",
        low: "Low",
        volume: "Volume",
        date: "Date",
        atomic_mass: "Atomic Mass",
        density: "Density",
        melting_pt: "Melting Pt.",
        boiling_pt: "Boiling Pt.",
        category_label: "Category",
        legend_base: "Base Metal",
        legend_precious: "Precious",
        legend_light: "Light Metal",
        legend_rare: "Rare Metal",
        legend_rare_earth: "Rare Earth",
        legend_scattered: "Scattered",
        legend_ferrous: "Ferrous",
        legend_nonmetal: "Non-Metal",
    },
    zh: {
        subtitle: "有色金属实时情报面板",
        llm_offline: "LLM 离线",
        llm_online: "LLM 在线",
        periodic_table: "元素周期表",
        refresh: "刷新",
        tab_overview: "概览",
        tab_news: "资讯情报",
        tab_analysis: "AI 分析",
        tab_chat: "AI 对话",
        market_price: "市场价格",
        price_chart: "价格走势 (30天)",
        element_props: "元素属性",
        key_apps: "主要应用",
        cat_all: "全部资讯",
        cat_mining: "开采生产",
        cat_policy: "政策法规",
        cat_price: "价格行情",
        cat_industry: "下游产业",
        cat_supply: "供应链",
        ai_summary: "AI 摘要",
        analysis_desc: "基于当前市场数据和资讯，为所选金属生成全面的AI专业分析报告。",
        generate_analysis: "生成分析报告",
        chat_welcome: "请随时提问 —— 市场走势、技术属性、供应链、贸易政策等。",
        chat_placeholder: "输入问题...",
        settings_title: "LLM API 设置",
        cancel: "取消",
        save: "保存",
        no_price: "该金属暂无实时期货价格数据。",
        loading: "加载中...",
        error_llm: "LLM API 未配置，请前往设置。",
        open: "开盘",
        high: "最高",
        low: "最低",
        volume: "成交量",
        date: "日期",
        atomic_mass: "原子质量",
        density: "密度",
        melting_pt: "熔点",
        boiling_pt: "沸点",
        category_label: "类别",
        legend_base: "基本有色",
        legend_precious: "贵金属",
        legend_light: "轻金属",
        legend_rare: "稀有金属",
        legend_rare_earth: "稀土",
        legend_scattered: "稀散金属",
        legend_ferrous: "黑色金属",
        legend_nonmetal: "非金属",
    },
};

let currentLang = "en";

function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || (I18N.en[key]) || key;
}

function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });
}

// ---------------------------------------------------------------------------
//  Element Data  [number, symbol, name_en, name_zh, mass, row, col, category, nfCategory]
//  category: visual/chemical category
//  nfCategory: non-ferrous sub-category (null = not NF metal, 'ferrous' = Fe/Cr/Mn)
// ---------------------------------------------------------------------------
// Categories: base, precious, light, rare, rare_earth, scattered, ferrous, nonmetal, noble_gas, metalloid, halogen, actinide, unknown
const ELEMENTS_RAW = [
    [1,"H","Hydrogen","氢",1.008,1,1,"nonmetal",null],
    [2,"He","Helium","氦",4.003,1,18,"noble_gas",null],
    [3,"Li","Lithium","锂",6.941,2,1,"light","light"],
    [4,"Be","Beryllium","铍",9.012,2,2,"light","light"],
    [5,"B","Boron","硼",10.81,2,13,"metalloid",null],
    [6,"C","Carbon","碳",12.01,2,14,"nonmetal",null],
    [7,"N","Nitrogen","氮",14.01,2,15,"nonmetal",null],
    [8,"O","Oxygen","氧",16.00,2,16,"nonmetal",null],
    [9,"F","Fluorine","氟",19.00,2,17,"halogen",null],
    [10,"Ne","Neon","氖",20.18,2,18,"noble_gas",null],
    [11,"Na","Sodium","钠",22.99,3,1,"light","light"],
    [12,"Mg","Magnesium","镁",24.31,3,2,"light","light"],
    [13,"Al","Aluminium","铝",26.98,3,13,"base","base"],
    [14,"Si","Silicon","硅",28.09,3,14,"metalloid",null],
    [15,"P","Phosphorus","磷",30.97,3,15,"nonmetal",null],
    [16,"S","Sulfur","硫",32.07,3,16,"nonmetal",null],
    [17,"Cl","Chlorine","氯",35.45,3,17,"halogen",null],
    [18,"Ar","Argon","氩",39.95,3,18,"noble_gas",null],
    [19,"K","Potassium","钾",39.10,4,1,"light","light"],
    [20,"Ca","Calcium","钙",40.08,4,2,"light","light"],
    [21,"Sc","Scandium","钪",21,4,3,"rare_earth","rare_earth"],
    [22,"Ti","Titanium","钛",47.87,4,4,"rare","rare"],
    [23,"V","Vanadium","钒",50.94,4,5,"rare","rare"],
    [24,"Cr","Chromium","铬",52.00,4,6,"ferrous","ferrous"],
    [25,"Mn","Manganese","锰",54.94,4,7,"ferrous","ferrous"],
    [26,"Fe","Iron","铁",55.85,4,8,"ferrous","ferrous"],
    [27,"Co","Cobalt","钴",58.93,4,9,"base","base"],
    [28,"Ni","Nickel","镍",58.69,4,10,"base","base"],
    [29,"Cu","Copper","铜",63.55,4,11,"base","base"],
    [30,"Zn","Zinc","锌",65.38,4,12,"base","base"],
    [31,"Ga","Gallium","镓",69.72,4,13,"scattered","scattered"],
    [32,"Ge","Germanium","锗",72.63,4,14,"scattered","scattered"],
    [33,"As","Arsenic","砷",74.92,4,15,"metalloid",null],
    [34,"Se","Selenium","硒",78.97,4,16,"scattered","scattered"],
    [35,"Br","Bromine","溴",79.90,4,17,"halogen",null],
    [36,"Kr","Krypton","氪",83.80,4,18,"noble_gas",null],
    [37,"Rb","Rubidium","铷",85.47,5,1,"light","light"],
    [38,"Sr","Strontium","锶",87.62,5,2,"light","light"],
    [39,"Y","Yttrium","钇",88.91,5,3,"rare_earth","rare_earth"],
    [40,"Zr","Zirconium","锆",91.22,5,4,"rare","rare"],
    [41,"Nb","Niobium","铌",92.91,5,5,"rare","rare"],
    [42,"Mo","Molybdenum","钼",95.95,5,6,"rare","rare"],
    [43,"Tc","Technetium","锝",98,5,7,"unknown",null],
    [44,"Ru","Ruthenium","钌",101.1,5,8,"precious","precious"],
    [45,"Rh","Rhodium","铑",102.9,5,9,"precious","precious"],
    [46,"Pd","Palladium","钯",106.4,5,10,"precious","precious"],
    [47,"Ag","Silver","银",107.9,5,11,"precious","precious"],
    [48,"Cd","Cadmium","镉",112.4,5,12,"scattered","scattered"],
    [49,"In","Indium","铟",114.8,5,13,"scattered","scattered"],
    [50,"Sn","Tin","锡",118.7,5,14,"base","base"],
    [51,"Sb","Antimony","锑",121.8,5,15,"scattered","scattered"],
    [52,"Te","Tellurium","碲",127.6,5,16,"scattered","scattered"],
    [53,"I","Iodine","碘",126.9,5,17,"halogen",null],
    [54,"Xe","Xenon","氙",131.3,5,18,"noble_gas",null],
    [55,"Cs","Cesium","铯",132.9,6,1,"light","light"],
    [56,"Ba","Barium","钡",137.3,6,2,"light","light"],
    // Lanthanides placeholder at 6,3 – actual lanthanides in rows 9
    [57,"La","Lanthanum","镧",138.9,9,3,"rare_earth","rare_earth"],
    [58,"Ce","Cerium","铈",140.1,9,4,"rare_earth","rare_earth"],
    [59,"Pr","Praseodymium","镨",140.9,9,5,"rare_earth","rare_earth"],
    [60,"Nd","Neodymium","钕",144.2,9,6,"rare_earth","rare_earth"],
    [61,"Pm","Promethium","钷",145,9,7,"rare_earth","rare_earth"],
    [62,"Sm","Samarium","钐",150.4,9,8,"rare_earth","rare_earth"],
    [63,"Eu","Europium","铕",152.0,9,9,"rare_earth","rare_earth"],
    [64,"Gd","Gadolinium","钆",157.3,9,10,"rare_earth","rare_earth"],
    [65,"Tb","Terbium","铽",158.9,9,11,"rare_earth","rare_earth"],
    [66,"Dy","Dysprosium","镝",162.5,9,12,"rare_earth","rare_earth"],
    [67,"Ho","Holmium","钬",164.9,9,13,"rare_earth","rare_earth"],
    [68,"Er","Erbium","铒",167.3,9,14,"rare_earth","rare_earth"],
    [69,"Tm","Thulium","铥",168.9,9,15,"rare_earth","rare_earth"],
    [70,"Yb","Ytterbium","镱",173.0,9,16,"rare_earth","rare_earth"],
    [71,"Lu","Lutetium","镥",175.0,9,17,"rare_earth","rare_earth"],
    [72,"Hf","Hafnium","铪",178.5,6,4,"rare","rare"],
    [73,"Ta","Tantalum","钽",180.9,6,5,"rare","rare"],
    [74,"W","Tungsten","钨",183.8,6,6,"rare","rare"],
    [75,"Re","Rhenium","铼",186.2,6,7,"rare","rare"],
    [76,"Os","Osmium","锇",190.2,6,8,"precious","precious"],
    [77,"Ir","Iridium","铱",192.2,6,9,"precious","precious"],
    [78,"Pt","Platinum","铂",195.1,6,10,"precious","precious"],
    [79,"Au","Gold","金",197.0,6,11,"precious","precious"],
    [80,"Hg","Mercury","汞",200.6,6,12,"scattered","scattered"],
    [81,"Tl","Thallium","铊",204.4,6,13,"scattered","scattered"],
    [82,"Pb","Lead","铅",207.2,6,14,"base","base"],
    [83,"Bi","Bismuth","铋",209.0,6,15,"scattered","scattered"],
    [84,"Po","Polonium","钋",209,6,16,"unknown",null],
    [85,"At","Astatine","砹",210,6,17,"halogen",null],
    [86,"Rn","Radon","氡",222,6,18,"noble_gas",null],
    [87,"Fr","Francium","钫",223,7,1,"light","light"],
    [88,"Ra","Radium","镭",226,7,2,"light","light"],
    // Actinides placeholder at 7,3 – actual actinides in rows 10
    [89,"Ac","Actinium","锕",227,10,3,"actinide","actinide"],
    [90,"Th","Thorium","钍",232.0,10,4,"actinide","actinide"],
    [91,"Pa","Protactinium","镤",231.0,10,5,"actinide","actinide"],
    [92,"U","Uranium","铀",238.0,10,6,"actinide","actinide"],
    [93,"Np","Neptunium","镎",237,10,7,"actinide","actinide"],
    [94,"Pu","Plutonium","钚",244,10,8,"actinide","actinide"],
    [95,"Am","Americium","镅",243,10,9,"actinide","actinide"],
    [96,"Cm","Curium","锔",247,10,10,"actinide","actinide"],
    [97,"Bk","Berkelium","锫",247,10,11,"actinide","actinide"],
    [98,"Cf","Californium","锎",251,10,12,"actinide","actinide"],
    [99,"Es","Einsteinium","锿",252,10,13,"actinide","actinide"],
    [100,"Fm","Fermium","镄",257,10,14,"actinide","actinide"],
    [101,"Md","Mendelevium","钔",258,10,15,"actinide","actinide"],
    [102,"No","Nobelium","锘",259,10,16,"actinide","actinide"],
    [103,"Lr","Lawrencium","铹",266,10,17,"actinide","actinide"],
    [104,"Rf","Rutherfordium","𬬻",267,7,4,"unknown",null],
    [105,"Db","Dubnium","𬭊",268,7,5,"unknown",null],
    [106,"Sg","Seaborgium","𬭳",269,7,6,"unknown",null],
    [107,"Bh","Bohrium","𬭛",270,7,7,"unknown",null],
    [108,"Hs","Hassium","𬭶",277,7,8,"unknown",null],
    [109,"Mt","Meitnerium","鿏",278,7,9,"unknown",null],
    [110,"Ds","Darmstadtium","𫟼",281,7,10,"unknown",null],
    [111,"Rg","Roentgenium","𬬭",282,7,11,"unknown",null],
    [112,"Cn","Copernicium","鿔",285,7,12,"unknown",null],
    [113,"Nh","Nihonium","鿭",286,7,13,"unknown",null],
    [114,"Fl","Flerovium","𫓧",289,7,14,"unknown",null],
    [115,"Mc","Moscovium","镆",290,7,15,"unknown",null],
    [116,"Lv","Livermorium","𫟷",293,7,16,"unknown",null],
    [117,"Ts","Tennessine","鿬",294,7,17,"unknown",null],
    [118,"Og","Oganesson","鿫",294,7,18,"noble_gas",null],
];

// Parse raw data into objects
const ELEMENTS = ELEMENTS_RAW.map(e => ({
    number: e[0], symbol: e[1], name_en: e[2], name_zh: e[3],
    mass: e[4], row: e[5], col: e[6], category: e[7], nfCategory: e[8],
}));

// Map by symbol for quick lookup
const ELEMENT_MAP = {};
ELEMENTS.forEach(e => { ELEMENT_MAP[e.symbol] = e; });

// Additional element properties (for the overview card)
const ELEMENT_PROPS = {
    Li: { density: 0.534, melt: 180.5, boil: 1342, apps_en: ["Batteries","Ceramics","Lubricants","Pharmaceuticals","Nuclear"], apps_zh: ["电池","陶瓷","润滑剂","医药","核工业"] },
    Be: { density: 1.85, melt: 1287, boil: 2469, apps_en: ["Aerospace alloys","X-ray windows","Nuclear","Electronics"], apps_zh: ["航空合金","X射线窗","核工业","电子"] },
    Na: { density: 0.971, melt: 97.8, boil: 883, apps_en: ["Chemical synthesis","Sodium lamps","Nuclear coolant"], apps_zh: ["化学合成","钠灯","核反应堆冷却"] },
    Mg: { density: 1.738, melt: 650, boil: 1091, apps_en: ["Lightweight alloys","Automotive","Aerospace","Fireworks"], apps_zh: ["轻合金","汽车","航空航天","烟火"] },
    Al: { density: 2.70, melt: 660.3, boil: 2519, apps_en: ["Construction","Packaging","Automotive","Aerospace","Electrical"], apps_zh: ["建筑","包装","汽车","航空航天","电气"] },
    K: { density: 0.862, melt: 63.4, boil: 759, apps_en: ["Fertilizer","Chemical synthesis","Potassium salts"], apps_zh: ["肥料","化学合成","钾盐"] },
    Ca: { density: 1.55, melt: 842, boil: 1484, apps_en: ["Steel alloys","Cement","Biological systems"], apps_zh: ["钢铁合金","水泥","生物系统"] },
    Sc: { density: 2.99, melt: 1541, boil: 2836, apps_en: ["Aerospace alloys","Sports equipment","Lighting"], apps_zh: ["航空合金","体育器材","照明"] },
    Ti: { density: 4.506, melt: 1668, boil: 3287, apps_en: ["Aerospace","Medical implants","Marine","Pigments"], apps_zh: ["航空航天","医疗植入","船舶","颜料"] },
    V: { density: 6.11, melt: 1910, boil: 3407, apps_en: ["Steel alloys","Vanadium flow batteries","Chemical catalyst"], apps_zh: ["钢铁合金","钒液流电池","化学催化"] },
    Co: { density: 8.90, melt: 1495, boil: 2927, apps_en: ["Li-ion batteries","Superalloys","Catalysts","Pigments"], apps_zh: ["锂离子电池","高温合金","催化剂","颜料"] },
    Ni: { density: 8.908, melt: 1455, boil: 2913, apps_en: ["Stainless steel","EV batteries","Plating","Superalloys"], apps_zh: ["不锈钢","电动汽车电池","电镀","高温合金"] },
    Cu: { density: 8.96, melt: 1084.6, boil: 2562, apps_en: ["Electrical wiring","Electronics","Construction","EV motors"], apps_zh: ["电线电缆","电子","建筑","电动汽车电机"] },
    Zn: { density: 7.134, melt: 419.5, boil: 907, apps_en: ["Galvanizing","Alloys (Brass)","Batteries","Die-casting"], apps_zh: ["镀锌","合金(黄铜)","电池","压铸"] },
    Ga: { density: 5.91, melt: 29.8, boil: 2204, apps_en: ["Semiconductors","LEDs","GaAs chips","Solar cells"], apps_zh: ["半导体","LED","砷化镓芯片","太阳能电池"] },
    Ge: { density: 5.323, melt: 938.3, boil: 2833, apps_en: ["Fiber optics","Infrared optics","Semiconductors","PET catalysts"], apps_zh: ["光纤","红外光学","半导体","PET催化剂"] },
    Se: { density: 4.809, melt: 221, boil: 685, apps_en: ["Electronics","Glass decolorizing","Solar cells","Pigments"], apps_zh: ["电子","玻璃脱色","太阳能电池","颜料"] },
    Rb: { density: 1.532, melt: 39.3, boil: 688, apps_en: ["Research","Atomic clocks","Medical imaging"], apps_zh: ["科研","原子钟","医学成像"] },
    Sr: { density: 2.64, melt: 777, boil: 1382, apps_en: ["Fireworks","Ferrite magnets","Medical tracers"], apps_zh: ["烟花","铁氧体磁铁","医学示踪"] },
    Y: { density: 4.469, melt: 1526, boil: 3336, apps_en: ["Superconductors","Laser crystals","LED phosphors"], apps_zh: ["超导体","激光晶体","LED荧光粉"] },
    Zr: { density: 6.506, melt: 1855, boil: 4409, apps_en: ["Nuclear fuel cladding","Ceramics","Foundry","Chemical processing"], apps_zh: ["核燃料包壳","陶瓷","铸造","化工"] },
    Nb: { density: 8.57, melt: 2477, boil: 4744, apps_en: ["Superconducting magnets","HSLA steel","Superalloys"], apps_zh: ["超导磁体","高强度低合金钢","高温合金"] },
    Mo: { density: 10.22, melt: 2623, boil: 4639, apps_en: ["Steel alloys","Chemical catalyst","Lubricants","Electronics"], apps_zh: ["钢铁合金","化学催化","润滑剂","电子"] },
    Ru: { density: 12.37, melt: 2334, boil: 4150, apps_en: ["Electronics","Chemical catalysts","Wear-resistant contacts"], apps_zh: ["电子","化学催化","耐磨触点"] },
    Rh: { density: 12.41, melt: 1964, boil: 3695, apps_en: ["Catalytic converters","Jewelry","Chemical catalysts"], apps_zh: ["催化转化器","珠宝","化学催化"] },
    Pd: { density: 12.02, melt: 1554.9, boil: 2963, apps_en: ["Catalytic converters","Electronics","Hydrogen purification","Dentistry"], apps_zh: ["催化转化器","电子","氢气净化","牙科"] },
    Ag: { density: 10.49, melt: 961.8, boil: 2162, apps_en: ["Electronics","Solar panels","Photography","Jewelry","Antimicrobial"], apps_zh: ["电子","光伏","摄影","珠宝","抗菌"] },
    Cd: { density: 8.69, melt: 321.1, boil: 767, apps_en: ["NiCd batteries","Pigments","Coatings","Nuclear control rods"], apps_zh: ["镍镉电池","颜料","镀层","核控制棒"] },
    In: { density: 7.31, melt: 156.6, boil: 2072, apps_en: ["ITO displays","Semiconductors","Solders","Thermal interface"], apps_zh: ["ITO显示屏","半导体","焊料","导热材料"] },
    Sn: { density: 7.287, melt: 231.9, boil: 2602, apps_en: ["Solder","Tin plating","Alloys (Bronze)","Chemicals"], apps_zh: ["焊锡","镀锡","合金(青铜)","化工"] },
    Sb: { density: 6.685, melt: 630.6, boil: 1587, apps_en: ["Flame retardants","Lead-acid batteries","Semiconductors"], apps_zh: ["阻燃剂","铅酸电池","半导体"] },
    Te: { density: 6.232, melt: 449.5, boil: 988, apps_en: ["Thermoelectric devices","Solar cells (CdTe)","Alloys"], apps_zh: ["热电器件","太阳能电池(CdTe)","合金"] },
    Cs: { density: 1.873, melt: 28.4, boil: 671, apps_en: ["Atomic clocks","Drilling fluids","Medical"], apps_zh: ["原子钟","钻井液","医疗"] },
    Ba: { density: 3.594, melt: 727, boil: 1845, apps_en: ["Drilling fluids","Barium meals","Glass","Fireworks"], apps_zh: ["钻井液","钡餐","玻璃","烟花"] },
    Hf: { density: 13.31, melt: 2233, boil: 4603, apps_en: ["Nuclear control rods","Superalloys","Plasma cutting"], apps_zh: ["核控制棒","高温合金","等离子切割"] },
    Ta: { density: 16.69, melt: 3017, boil: 5458, apps_en: ["Capacitors","Surgical instruments","Chemical processing","Superalloys"], apps_zh: ["电容器","手术器械","化工设备","高温合金"] },
    W: { density: 19.25, melt: 3422, boil: 5555, apps_en: ["Cutting tools","Filaments","Military","Mining drills"], apps_zh: ["切削工具","灯丝","军工","采矿钻头"] },
    Re: { density: 21.02, melt: 3186, boil: 5596, apps_en: ["Jet engine superalloys","Catalysts","Thermocouples"], apps_zh: ["喷气发动机高温合金","催化剂","热电偶"] },
    Os: { density: 22.59, melt: 3033, boil: 5012, apps_en: ["Pen tips","Electrical contacts","Catalysts"], apps_zh: ["笔尖","电触点","催化剂"] },
    Ir: { density: 22.56, melt: 2446, boil: 4428, apps_en: ["Spark plugs","Crucibles","Electrodes","Standards"], apps_zh: ["火花塞","坩埚","电极","度量标准"] },
    Pt: { density: 21.45, melt: 1768.3, boil: 3825, apps_en: ["Catalytic converters","Jewelry","Fuel cells","Medical"], apps_zh: ["催化转化器","珠宝","燃料电池","医疗"] },
    Au: { density: 19.32, melt: 1064.2, boil: 2856, apps_en: ["Jewelry","Electronics","Central bank reserves","Medical","Aerospace"], apps_zh: ["珠宝","电子","央行储备","医疗","航空航天"] },
    Hg: { density: 13.534, melt: -38.8, boil: 356.7, apps_en: ["Thermometers (legacy)","Dental amalgam","Fluorescent lamps"], apps_zh: ["温度计(传统)","牙科汞合金","荧光灯"] },
    Tl: { density: 11.85, melt: 304, boil: 1473, apps_en: ["Semiconductor research","Superconductors","Medical imaging"], apps_zh: ["半导体研究","超导体","医学成像"] },
    Pb: { density: 11.34, melt: 327.5, boil: 1749, apps_en: ["Lead-acid batteries","Radiation shielding","Ammunition","Cable sheathing"], apps_zh: ["铅酸电池","辐射屏蔽","弹药","电缆护套"] },
    Bi: { density: 9.78, melt: 271.4, boil: 1564, apps_en: ["Pharmaceuticals","Alloys","Pigments","Lead-free solder"], apps_zh: ["医药","合金","颜料","无铅焊料"] },
    La: { density: 6.15, melt: 920, boil: 3464, apps_en: ["Optical glass","Catalysts","Hydrogen storage","Battery alloys"], apps_zh: ["光学玻璃","催化剂","储氢","电池合金"] },
    Ce: { density: 6.77, melt: 798, boil: 3443, apps_en: ["Catalytic converters","Glass polishing","Lighter flints","Steel alloys"], apps_zh: ["催化转化器","玻璃抛光","打火石","钢合金"] },
    Nd: { density: 7.01, melt: 1024, boil: 3074, apps_en: ["NdFeB permanent magnets","Lasers","Glass coloring","EV motors"], apps_zh: ["钕铁硼永磁体","激光","玻璃着色","电动汽车电机"] },
    Sm: { density: 7.52, melt: 1072, boil: 1900, apps_en: ["SmCo magnets","Nuclear reactor","Carbon-arc lighting"], apps_zh: ["钐钴磁铁","核反应堆","碳弧灯"] },
    Eu: { density: 5.24, melt: 822, boil: 1529, apps_en: ["Red phosphors","Euro banknote security","Nuclear control"], apps_zh: ["红色荧光粉","欧元防伪","核控制"] },
    Gd: { density: 7.90, melt: 1313, boil: 3273, apps_en: ["MRI contrast agents","Nuclear shielding","Magneto-optical"], apps_zh: ["MRI对比剂","核屏蔽","磁光材料"] },
    Dy: { density: 8.55, melt: 1412, boil: 2567, apps_en: ["NdFeB magnet additive","Nuclear control rods","Lasers"], apps_zh: ["钕铁硼磁铁添加","核控制棒","激光"] },
    Tb: { density: 8.23, melt: 1356, boil: 3230, apps_en: ["Green phosphors","Magneto-optical media","Fuel cells"], apps_zh: ["绿色荧光粉","磁光介质","燃料电池"] },
    Er: { density: 9.07, melt: 1529, boil: 2868, apps_en: ["Fiber optic amplifiers","Laser","Nuclear","Glass coloring"], apps_zh: ["光纤放大器","激光","核工业","玻璃着色"] },
    Yb: { density: 6.90, melt: 824, boil: 1196, apps_en: ["Stress gauges","Lasers","Metallurgy"], apps_zh: ["应力计","激光","冶金"] },
    Lu: { density: 9.84, melt: 1663, boil: 3402, apps_en: ["PET scan catalysts","Tantalite processing","LED phosphors"], apps_zh: ["PET扫描催化","钽铁矿加工","LED荧光粉"] },
    Pr: { density: 6.77, melt: 931, boil: 3520, apps_en: ["Permanent magnets","Aircraft engines","Glass coloring","Lighter flints"], apps_zh: ["永磁材料","航空发动机","玻璃着色","打火石"] },
    Ho: { density: 8.80, melt: 1474, boil: 2700, apps_en: ["Nuclear control","Magnets","Lasers","Spectral calibration"], apps_zh: ["核控制","磁铁","激光","光谱校准"] },
    Tm: { density: 9.32, melt: 1545, boil: 1950, apps_en: ["Portable X-ray devices","Laser","Nuclear"], apps_zh: ["便携X射线","激光","核工业"] },
    Pm: { density: 7.26, melt: 1042, boil: 3000, apps_en: ["Nuclear batteries","Luminous paint","Research"], apps_zh: ["核电池","夜光涂料","科研"] },
    Fr: { density: 2.48, melt: 27, boil: 677, apps_en: ["Research only"], apps_zh: ["仅科研"] },
    Ra: { density: 5.5, melt: 700, boil: 1737, apps_en: ["Historical medical use","Research"], apps_zh: ["历史医疗","科研"] },
};

// NF Category Chinese names
const NF_CAT_NAMES = {
    base: { en: "Base Metal", zh: "基本有色金属" },
    precious: { en: "Precious Metal", zh: "贵金属" },
    light: { en: "Light Metal", zh: "轻金属" },
    rare: { en: "Rare Metal", zh: "稀有金属" },
    rare_earth: { en: "Rare Earth", zh: "稀土金属" },
    scattered: { en: "Scattered Metal", zh: "稀散金属" },
    ferrous: { en: "Ferrous Metal", zh: "黑色金属" },
    actinide: { en: "Actinide", zh: "锕系元素" },
};

// ---------------------------------------------------------------------------
//  State
// ---------------------------------------------------------------------------
let selectedElement = null;
let currentNewsCategory = "news";
let chatHistory = [];
let priceChart = null;
let currentNewsArticles = [];

// ---------------------------------------------------------------------------
//  Periodic Table Rendering
// ---------------------------------------------------------------------------
function renderPeriodicTable() {
    const container = document.getElementById("periodic-table");
    container.innerHTML = "";

    // We need to place elements in a grid.
    // Rows 1-7 for main table, row 8 = gap, row 9 = lanthanides, row 10 = actinides
    // Total rows: 10,  Columns: 18

    // Create a map of grid positions
    const gridMap = {};
    ELEMENTS.forEach(el => {
        const key = `${el.row}-${el.col}`;
        gridMap[key] = el;
    });

    // Add lanthanide/actinide placeholders in the main table
    // Position 6,3 = La-Lu indicator
    // Position 7,3 = Ac-Lr indicator

    // Render rows 1-7
    for (let row = 1; row <= 7; row++) {
        for (let col = 1; col <= 18; col++) {
            const key = `${row}-${col}`;
            const el = gridMap[key];

            if ((row === 6 && col === 3) || (row === 7 && col === 3)) {
                // Lanthanide / Actinide indicator
                const indicator = document.createElement("div");
                indicator.className = "element-cell non-interactive";
                indicator.style.background = row === 6 ? "rgba(20,184,166,0.15)" : "rgba(76,29,149,0.15)";
                indicator.style.fontSize = "9px";
                indicator.style.color = "var(--text-muted)";
                indicator.innerHTML = row === 6
                    ? '<span style="font-size:8px">57-71</span>'
                    : '<span style="font-size:8px">89-103</span>';
                container.appendChild(indicator);
                continue;
            }

            if (el) {
                container.appendChild(createElementCell(el));
            } else {
                // Empty cell
                const empty = document.createElement("div");
                empty.style.gridRow = row;
                empty.style.gridColumn = col;
                container.appendChild(empty);
            }
        }
    }

    // Gap row
    const gap = document.createElement("div");
    gap.className = "pt-gap";
    container.appendChild(gap);

    // Lanthanides (row 9, cols 3-17)
    // Spacer for cols 1-2
    const lnSpacer = document.createElement("div");
    lnSpacer.className = "pt-spacer";
    lnSpacer.textContent = currentLang === "zh" ? "镧系 ▸" : "Ln ▸";
    container.appendChild(lnSpacer);
    for (let col = 3; col <= 17; col++) {
        const key = `9-${col}`;
        const el = gridMap[key];
        if (el) {
            container.appendChild(createElementCell(el));
        } else {
            container.appendChild(document.createElement("div"));
        }
    }
    // Fill remaining col
    container.appendChild(document.createElement("div"));

    // Actinides (row 10, cols 3-17)
    const acSpacer = document.createElement("div");
    acSpacer.className = "pt-spacer";
    acSpacer.textContent = currentLang === "zh" ? "锕系 ▸" : "Ac ▸";
    container.appendChild(acSpacer);
    for (let col = 3; col <= 17; col++) {
        const key = `10-${col}`;
        const el = gridMap[key];
        if (el) {
            container.appendChild(createElementCell(el));
        } else {
            container.appendChild(document.createElement("div"));
        }
    }
    container.appendChild(document.createElement("div"));

    // Legend
    renderLegend();
}

function createElementCell(el) {
    const cell = document.createElement("div");
    const isNF = el.nfCategory && el.nfCategory !== "ferrous";
    const catClass = `cat-${el.category.replace("_", "-")}`;

    cell.className = `element-cell ${catClass}`;
    if (isNF) {
        cell.classList.add("nf-metal");
    } else if (el.nfCategory === "ferrous") {
        cell.classList.add("nf-metal");
    } else {
        cell.classList.add("non-interactive");
    }

    if (selectedElement && selectedElement.symbol === el.symbol) {
        cell.classList.add("selected");
    }

    const name = currentLang === "zh" ? el.name_zh : el.name_en;
    cell.innerHTML = `
        <span class="el-number">${el.number}</span>
        <span class="el-symbol">${el.symbol}</span>
        <span class="el-name">${name}</span>
    `;

    if (isNF || el.nfCategory === "ferrous") {
        cell.addEventListener("click", () => selectElement(el));
    }

    return cell;
}

function renderLegend() {
    const legend = document.getElementById("legend");
    const cats = [
        ["base", "cat-base"],
        ["precious", "cat-precious"],
        ["light", "cat-light"],
        ["rare", "cat-rare"],
        ["rare_earth", "cat-rare-earth"],
        ["scattered", "cat-scattered"],
        ["ferrous", "cat-ferrous"],
        ["nonmetal", "cat-nonmetal"],
    ];
    legend.innerHTML = cats.map(([key, cls]) => {
        const label = t(`legend_${key.replace("_", "_")}`);
        return `<div class="legend-item"><div class="legend-dot ${cls}" style="background:var(--cat-${key.replace("_","-")})"></div><span>${label}</span></div>`;
    }).join("");
}

// ---------------------------------------------------------------------------
//  Element Selection & Dashboard
// ---------------------------------------------------------------------------
function selectElement(el) {
    selectedElement = el;
    chatHistory = [];
    currentNewsArticles = [];

    // Update periodic table selection
    document.querySelectorAll(".element-cell.selected").forEach(c => c.classList.remove("selected"));
    // Re-render would be heavy, just mark the selected one
    renderPeriodicTable();

    // Show dashboard
    const dash = document.getElementById("element-dashboard");
    dash.classList.remove("hidden");

    // Update badge
    document.getElementById("dash-number").textContent = el.number;
    document.getElementById("dash-symbol").textContent = el.symbol;
    const name = currentLang === "zh" ? `${el.name_zh} (${el.name_en})` : `${el.name_en} (${el.name_zh})`;
    document.getElementById("dash-name").textContent = name;

    const catName = NF_CAT_NAMES[el.nfCategory];
    document.getElementById("dash-meta").textContent = catName
        ? (currentLang === "zh" ? catName.zh : catName.en)
        : "";

    // Set active tab to overview
    switchTab("overview");

    // Load data
    loadOverview(el);
    loadNews(el, "news");

    // Reset analysis and chat
    document.getElementById("analysis-content").innerHTML = "";
    document.getElementById("chat-messages").innerHTML = `
        <div class="chat-welcome">
            <i class="fas fa-robot"></i>
            <p>${t("chat_welcome")}</p>
        </div>
    `;

    // Scroll to dashboard
    dash.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------------------------------------------------------------------------
//  Tabs
// ---------------------------------------------------------------------------
function switchTab(tabName) {
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tabName));
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.toggle("active", p.id === `pane-${tabName}`));
}

// ---------------------------------------------------------------------------
//  Overview
// ---------------------------------------------------------------------------
function loadOverview(el) {
    loadPrice(el);
    renderElementProps(el);
    renderApps(el);
}

async function loadPrice(el) {
    const body = document.getElementById("price-body");
    body.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
    document.getElementById("price-source").textContent = "";

    try {
        const resp = await fetch(`/api/price/${el.symbol}`);
        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }
        const data = await resp.json();

        if (data.available) {
            const changeClass = data.change >= 0 ? "up" : "down";
            const arrow = data.change >= 0 ? "▲" : "▼";
            
            // 显示数据来源
            let sourceInfo = data.ticker || data.source || "Unknown";
            if (data.source) {
                const sourceNames = {
                    "yahoo_finance": "Yahoo Finance",
                    "alpha_vantage": "Alpha Vantage",
                    "metal_etf": "Metal ETF",
                    "mining_stock": "Mining Stock"
                };
                sourceInfo = sourceNames[data.source] || data.source;
                if (data.ticker) {
                    sourceInfo += ` (${data.ticker})`;
                }
            }
            
            body.innerHTML = `
                <div class="price-display">
                    <div class="price-main">$${data.price.toLocaleString()}</div>
                    <div class="price-change ${changeClass}">
                        <span>${arrow} ${data.change >= 0 ? "+" : ""}${data.change.toFixed(2)} (${data.change_pct >= 0 ? "+" : ""}${data.change_pct.toFixed(2)}%)</span>
                    </div>
                    <div class="price-detail">
                        <div class="price-detail-item">
                            <span class="price-detail-label">${t("open")}</span>
                            <span class="price-detail-value">$${data.open.toLocaleString()}</span>
                        </div>
                        <div class="price-detail-item">
                            <span class="price-detail-label">${t("high")}</span>
                            <span class="price-detail-value">$${data.high.toLocaleString()}</span>
                        </div>
                        <div class="price-detail-item">
                            <span class="price-detail-label">${t("low")}</span>
                            <span class="price-detail-value">$${data.low.toLocaleString()}</span>
                        </div>
                        <div class="price-detail-item">
                            <span class="price-detail-label">${t("date")}</span>
                            <span class="price-detail-value">${data.date}</span>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById("price-source").textContent = sourceInfo;
            renderPriceChart(data.history);
        } else {
            // 显示详细的错误信息
            let errorMessage = t("no_price");
            if (data.message) {
                errorMessage += `<br><small style="color: var(--text-muted); font-size: 11px;">Details: ${escapeHtml(data.message)}</small>`;
            }
            body.innerHTML = `<div class="no-data"><i class="fas fa-chart-bar"></i>${errorMessage}</div>`;
            clearPriceChart();
        }
    } catch (err) {
        console.error("Price loading error:", err);
        const errorMessage = `<i class="fas fa-exclamation-triangle"></i>Network error: ${escapeHtml(err.message)}<br><small style="color: var(--text-muted); font-size: 11px;">Try refreshing the page or check your connection.</small>`;
        body.innerHTML = `<div class="no-data">${errorMessage}</div>`;
        clearPriceChart();
    }
}

function renderPriceChart(history) {
    const canvas = document.getElementById("price-chart");
    if (priceChart) { priceChart.destroy(); }

    const labels = history.map(h => h.date.slice(5)); // MM-DD
    const prices = history.map(h => h.close);
    const isUp = prices.length >= 2 && prices[prices.length-1] >= prices[0];
    const color = isUp ? "#22c55e" : "#ef4444";

    priceChart = new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [{
                data: prices,
                borderColor: color,
                backgroundColor: color + "15",
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#1a2332",
                    titleColor: "#e2e8f0",
                    bodyColor: "#94a3b8",
                    borderColor: "#1e293b",
                    borderWidth: 1,
                    callbacks: {
                        label: ctx => `$${ctx.parsed.y.toLocaleString()}`,
                    },
                },
            },
            scales: {
                x: {
                    grid: { color: "rgba(30,41,59,0.5)" },
                    ticks: { color: "#64748b", font: { size: 10, family: "'JetBrains Mono'" }, maxTicksLimit: 8 },
                },
                y: {
                    grid: { color: "rgba(30,41,59,0.5)" },
                    ticks: {
                        color: "#64748b",
                        font: { size: 10, family: "'JetBrains Mono'" },
                        callback: v => "$" + v.toLocaleString(),
                    },
                },
            },
            interaction: { intersect: false, mode: "index" },
        },
    });
}

function clearPriceChart() {
    if (priceChart) { priceChart.destroy(); priceChart = null; }
}

function renderElementProps(el) {
    const body = document.getElementById("info-body");
    const props = ELEMENT_PROPS[el.symbol];

    let html = `<div class="prop-grid">`;
    html += `<div class="prop-item"><span class="prop-label">${t("atomic_mass")}</span><span class="prop-value">${el.mass}</span></div>`;
    if (props) {
        if (props.density) html += `<div class="prop-item"><span class="prop-label">${t("density")}</span><span class="prop-value">${props.density} g/cm³</span></div>`;
        if (props.melt !== undefined) html += `<div class="prop-item"><span class="prop-label">${t("melting_pt")}</span><span class="prop-value">${props.melt} °C</span></div>`;
        if (props.boil !== undefined) html += `<div class="prop-item"><span class="prop-label">${t("boiling_pt")}</span><span class="prop-value">${props.boil} °C</span></div>`;
    }
    const catName = NF_CAT_NAMES[el.nfCategory];
    if (catName) {
        html += `<div class="prop-item"><span class="prop-label">${t("category_label")}</span><span class="prop-value">${currentLang === "zh" ? catName.zh : catName.en}</span></div>`;
    }
    html += `</div>`;
    body.innerHTML = html;
}

function renderApps(el) {
    const body = document.getElementById("apps-body");
    const props = ELEMENT_PROPS[el.symbol];
    if (!props) {
        body.innerHTML = `<div class="no-data"><i class="fas fa-info-circle"></i>No detailed data available.</div>`;
        return;
    }
    const apps = currentLang === "zh" ? props.apps_zh : props.apps_en;
    body.innerHTML = apps.map(a => `<span class="app-tag">${a}</span>`).join("");
}

// ---------------------------------------------------------------------------
//  News
// ---------------------------------------------------------------------------
async function loadNews(el, category) {
    currentNewsCategory = category;
    const list = document.getElementById("news-list");
    list.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

    // Update category buttons
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.toggle("active", b.dataset.cat === category));

    // Hide summary
    document.getElementById("news-summary").classList.add("hidden");

    const metalName = el.name_en;
    try {
        const resp = await fetch(`/api/news/${el.symbol}?category=${category}&lang=${currentLang}&name=${encodeURIComponent(metalName)}`);
        const data = await resp.json();
        currentNewsArticles = data.articles || [];

        if (currentNewsArticles.length === 0) {
            list.innerHTML = `<div class="no-data"><i class="fas fa-newspaper"></i>${currentLang === "zh" ? "暂无相关资讯" : "No articles found."}</div>`;
            return;
        }

        list.innerHTML = currentNewsArticles.map(a => `
            <div class="news-item">
                <div class="news-item-title"><a href="${escapeHtml(a.url)}" target="_blank" rel="noopener">${escapeHtml(a.title)}</a></div>
                <div class="news-item-body">${escapeHtml(a.body)}</div>
                <div class="news-item-meta">
                    ${a.source ? `<span><i class="fas fa-link"></i> ${escapeHtml(a.source)}</span>` : ""}
                    ${a.date ? `<span><i class="fas fa-clock"></i> ${escapeHtml(a.date)}</span>` : ""}
                </div>
            </div>
        `).join("");
    } catch (err) {
        list.innerHTML = `<div class="no-data"><i class="fas fa-exclamation-triangle"></i>${err.message}</div>`;
    }
}

// ---------------------------------------------------------------------------
//  AI Summary
// ---------------------------------------------------------------------------
async function aiSummarize() {
    if (!selectedElement || currentNewsArticles.length === 0) return;

    const btn = document.getElementById("summarize-btn");
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t("loading")}`;

    const summaryDiv = document.getElementById("news-summary");
    summaryDiv.classList.remove("hidden");
    summaryDiv.innerHTML = `<div class="loader"><div class="spinner"></div></div>`;

    try {
        const resp = await fetch("/api/ai/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                articles: currentNewsArticles.slice(0, 10),
                metal: selectedElement.name_en,
                lang: currentLang,
            }),
        });
        const data = await resp.json();
        if (data.error) {
            summaryDiv.innerHTML = `<p style="color:var(--accent-red)"><i class="fas fa-exclamation-triangle"></i> ${escapeHtml(data.error)}</p>`;
        } else {
            summaryDiv.innerHTML = `
                <h4><i class="fas fa-magic"></i> AI ${currentLang === "zh" ? "智能摘要" : "Summary"}</h4>
                <div class="markdown-body">${marked.parse(data.summary || "")}</div>
            `;
        }
    } catch (err) {
        summaryDiv.innerHTML = `<p style="color:var(--accent-red)">${err.message}</p>`;
    }

    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-magic"></i> <span>${t("ai_summary")}</span>`;
}

// ---------------------------------------------------------------------------
//  AI Analysis (Streaming)
// ---------------------------------------------------------------------------
async function aiAnalyze() {
    if (!selectedElement) return;

    const btn = document.getElementById("analyze-btn");
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t("loading")}`;

    const content = document.getElementById("analysis-content");
    content.innerHTML = "";

    // Gather context
    const priceInfo = document.getElementById("price-body").innerText || "N/A";
    const newsSnippets = currentNewsArticles.slice(0, 5).map(a => `- ${a.title}`).join("\n");

    try {
        const resp = await fetch("/api/ai/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                metal: selectedElement.name_en,
                metal_zh: selectedElement.name_zh,
                price_info: priceInfo,
                news_snippets: newsSnippets,
                lang: currentLang,
            }),
        });

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const payload = line.slice(6).trim();
                    if (payload === "[DONE]") break;
                    try {
                        const json = JSON.parse(payload);
                        if (json.content) {
                            fullText += json.content;
                            content.innerHTML = marked.parse(fullText);
                            content.scrollTop = content.scrollHeight;
                        }
                        if (json.error) {
                            content.innerHTML += `<p style="color:var(--accent-red)">${escapeHtml(json.error)}</p>`;
                        }
                    } catch {}
                }
            }
        }
    } catch (err) {
        content.innerHTML = `<p style="color:var(--accent-red)">${err.message}</p>`;
    }

    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-bolt"></i> <span>${t("generate_analysis")}</span>`;
}

// ---------------------------------------------------------------------------
//  AI Chat (Streaming)
// ---------------------------------------------------------------------------
async function sendChat() {
    const input = document.getElementById("chat-input");
    const msg = input.value.trim();
    if (!msg || !selectedElement) return;

    const msgContainer = document.getElementById("chat-messages");

    // Clear welcome message
    const welcome = msgContainer.querySelector(".chat-welcome");
    if (welcome) welcome.remove();

    // Add user message
    const userDiv = document.createElement("div");
    userDiv.className = "chat-msg user";
    userDiv.textContent = msg;
    msgContainer.appendChild(userDiv);

    input.value = "";
    autoResizeTextarea(input);

    // Add assistant message placeholder
    const assistDiv = document.createElement("div");
    assistDiv.className = "chat-msg assistant";
    assistDiv.innerHTML = '<div class="markdown-body cursor-typing"></div>';
    msgContainer.appendChild(assistDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    chatHistory.push({ role: "user", content: msg });

    const sendBtn = document.getElementById("chat-send");
    sendBtn.disabled = true;

    // Context
    const priceInfo = document.getElementById("price-body").innerText || "";
    const newsSnippets = currentNewsArticles.slice(0, 3).map(a => `- ${a.title}`).join("\n");

    try {
        const resp = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: chatHistory,
                metal: selectedElement.name_en,
                metal_zh: selectedElement.name_zh,
                context: `Price: ${priceInfo}\nRecent news:\n${newsSnippets}`,
                lang: currentLang,
            }),
        });

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        const mdBody = assistDiv.querySelector(".markdown-body");

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const payload = line.slice(6).trim();
                    if (payload === "[DONE]") break;
                    try {
                        const json = JSON.parse(payload);
                        if (json.content) {
                            fullText += json.content;
                            mdBody.innerHTML = marked.parse(fullText);
                            msgContainer.scrollTop = msgContainer.scrollHeight;
                        }
                        if (json.error) {
                            mdBody.innerHTML = `<p style="color:var(--accent-red)">${escapeHtml(json.error)}</p>`;
                        }
                    } catch {}
                }
            }
        }

        mdBody.classList.remove("cursor-typing");
        chatHistory.push({ role: "assistant", content: fullText });

    } catch (err) {
        assistDiv.querySelector(".markdown-body").innerHTML = `<p style="color:var(--accent-red)">${err.message}</p>`;
    }

    sendBtn.disabled = false;
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

// ---------------------------------------------------------------------------
//  Settings
// ---------------------------------------------------------------------------
async function loadSettings() {
    try {
        const resp = await fetch("/api/settings");
        const data = await resp.json();
        document.getElementById("setting-base-url").value = data.base_url || "";
        document.getElementById("setting-model").value = data.model || "gpt-4o";
        document.getElementById("setting-temp").value = data.temperature || 0.7;
        document.getElementById("temp-value").textContent = data.temperature || 0.7;
        // Don't populate API key (it's masked)
        updateApiStatus(data.api_key && data.api_key !== "***" ? true : (data.api_key === "***"));
    } catch {}
}

async function saveSettings() {
    const apiKey = document.getElementById("setting-api-key").value.trim();
    const baseUrl = document.getElementById("setting-base-url").value.trim();
    const model = document.getElementById("setting-model").value.trim();
    const temperature = parseFloat(document.getElementById("setting-temp").value);

    const payload = { base_url: baseUrl, model, temperature };
    if (apiKey && apiKey !== "***") { payload.api_key = apiKey; }

    try {
        await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        updateApiStatus(true);
    } catch {}

    document.getElementById("settings-modal").classList.add("hidden");
}

function updateApiStatus(online) {
    const statusEl = document.getElementById("api-status");
    const dot = statusEl.querySelector(".status-dot");
    const label = statusEl.querySelector("span:last-child");

    if (online) {
        dot.className = "status-dot online";
        label.textContent = t("llm_online");
    } else {
        dot.className = "status-dot offline";
        label.textContent = t("llm_offline");
    }
}

// ---------------------------------------------------------------------------
//  Refresh
// ---------------------------------------------------------------------------
async function refreshData() {
    if (!selectedElement) return;

    const btn = document.getElementById("refresh-btn");
    btn.querySelector("i").classList.add("fa-spin");

    // Clear cache for this element
    try {
        await fetch("/api/cache/clear", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbol: selectedElement.symbol }),
        });
    } catch {}

    // Reload data
    loadOverview(selectedElement);
    loadNews(selectedElement, currentNewsCategory);

    setTimeout(() => {
        btn.querySelector("i").classList.remove("fa-spin");
    }, 1000);
}

// ---------------------------------------------------------------------------
//  Utilities
// ---------------------------------------------------------------------------
function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function autoResizeTextarea(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

// ---------------------------------------------------------------------------
//  Event Listeners
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    renderPeriodicTable();
    applyI18n();
    loadSettings();

    // Language toggle
    document.getElementById("lang-toggle").addEventListener("click", () => {
        currentLang = currentLang === "en" ? "zh" : "en";
        document.documentElement.setAttribute("data-lang", currentLang);
        applyI18n();
        renderPeriodicTable();
        if (selectedElement) {
            const name = currentLang === "zh"
                ? `${selectedElement.name_zh} (${selectedElement.name_en})`
                : `${selectedElement.name_en} (${selectedElement.name_zh})`;
            document.getElementById("dash-name").textContent = name;
            const catName = NF_CAT_NAMES[selectedElement.nfCategory];
            document.getElementById("dash-meta").textContent = catName
                ? (currentLang === "zh" ? catName.zh : catName.en) : "";
            renderElementProps(selectedElement);
            renderApps(selectedElement);
        }
    });

    // Tabs
    document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });

    // News categories
    document.querySelectorAll(".cat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (selectedElement) loadNews(selectedElement, btn.dataset.cat);
        });
    });

    // Settings modal
    document.getElementById("settings-btn").addEventListener("click", () => {
        document.getElementById("settings-modal").classList.remove("hidden");
        loadSettings();
    });
    document.getElementById("close-settings").addEventListener("click", () => {
        document.getElementById("settings-modal").classList.add("hidden");
    });
    document.getElementById("settings-cancel").addEventListener("click", () => {
        document.getElementById("settings-modal").classList.add("hidden");
    });
    document.getElementById("settings-save").addEventListener("click", saveSettings);

    // Temperature slider
    document.getElementById("setting-temp").addEventListener("input", (e) => {
        document.getElementById("temp-value").textContent = e.target.value;
    });

    // Close dashboard
    document.getElementById("close-dashboard").addEventListener("click", () => {
        document.getElementById("element-dashboard").classList.add("hidden");
        selectedElement = null;
        renderPeriodicTable();
    });

    // Refresh
    document.getElementById("refresh-btn").addEventListener("click", refreshData);

    // AI Summary
    document.getElementById("summarize-btn").addEventListener("click", aiSummarize);

    // AI Analyze
    document.getElementById("analyze-btn").addEventListener("click", aiAnalyze);

    // Chat send
    document.getElementById("chat-send").addEventListener("click", sendChat);
    document.getElementById("chat-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendChat();
        }
    });
    document.getElementById("chat-input").addEventListener("input", (e) => {
        autoResizeTextarea(e.target);
    });

    // Click outside modal to close
    document.getElementById("settings-modal").addEventListener("click", (e) => {
        if (e.target.id === "settings-modal") {
            document.getElementById("settings-modal").classList.add("hidden");
        }
    });
});
