/* =====================================================================
 *  网站全部内容都在这一个文件里。改完保存 → 提交(push) → 网站自动更新。
 *
 *  小规则（照着已有条目复制粘贴最省事）：
 *  1. 每个条目用 { ... } 包起来，条目之间用英文逗号 , 隔开
 *  2. 文字用英文引号 '...' 包起来；文字里本身要用引号时用中文引号 “ ”
 *  3. 以 // 开头的行是注释，网站不会显示，可以随便写备忘
 *  4. 某一项暂时不想显示：加一行 hide: true
 *  5. 日期写成 '2025-07' 或 '2025'，网站会自动按时间从新到旧排序，
 *     所以新条目加在哪里都行
 *  6. 照片放进 photos/ 文件夹，再在这里写上路径，例如 'photos/gallery/xxx.jpg'
 *  7. 改完后双击打开 index.html 就能在本地预览
 *
 *  ⚠ 这个文件和 photos/、files/ 会公开在 GitHub 上，任何人都能看到原文。
 *    不想公开的内容（作品名称、学生名单、指导教师排名、材料、学生照片）
 *    一律写进 private/details.js——那个文件夹不会上传到公开仓库。
 * ===================================================================== */

window.SITE = {

  // ------------------------------------------------------------------
  // 基本信息
  // ------------------------------------------------------------------
  profile: {
    name: '温程远',
    nameEn: 'Chengyuan Wen',
    title: '副教授',
    affiliation: '浙江海洋大学',
    department: '信息工程学院',
    avatar: 'photos/avatar.jpg',
    email: 'wechyu@zjou.edu.cn',
    address: '浙江省舟山市定海区临城街道海大南路1号，浙江海洋大学信息工程学院',
    postcode: '316022',
    phone: '',            // 留空就不显示
    interests: ['人工智能', '计算机视觉', '机器学习', '深度学习', '机器人技术', '数据挖掘'],

    // 个人简介。空一行 = 新段落；**加粗**；[文字](链接)
    bio: `我目前在浙江海洋大学从事**人工智能**、**计算机视觉**与**机器学习**等方向的研究和教学工作，研究兴趣包括深度学习、计算机视觉、机器人技术以及数据挖掘。

在学术研究中，我注重理论与实践相结合，致力于将人工智能技术应用于实际问题的解决。同时也热衷于指导学生参与科研项目和学科竞赛，培养学生的创新能力和实践能力。`,

    // 学术主页链接（填上网址才会显示）
    links: [
      { label: 'Google Scholar', url: 'https://scholar.google.com/citations?user=TWRe_GMAAAAJ' },
      { label: 'ORCID',          url: '' },
      { label: 'ResearchGate',   url: '' },
      { label: 'GitHub',         url: '' },
    ],
  },

  // 页面风格：'warm' 暖木（默认）/ 'white' 白墙 / 'stone' 石灰
  theme: 'stone',

  // 页面上显示哪些栏目、按什么顺序。不想要哪个就删掉/注释掉那一行
  sections: [
    'news',          // 最新动态（自动汇总下面带日期的条目）
    'experience',    // 教育与工作经历
    'research',      // 研究方向
    'projects',      // 科研项目
    'papers',        // 论文
    'patents',       // 专利
    'software',      // 软件著作权（公开版只显示数量）
    'teaching',      // 教学
    'students',      // 学生
    'studentProjects', // 指导学生项目（大创、新苗等）
    'competitions',  // 竞赛指导
    'honors',        // 荣誉
    'posts',         // 随笔 / Vlog（文章写在 posts/ 文件夹里）
    'gallery',       // 相册
    'contact',       // 联系
  ],

  // ------------------------------------------------------------------
  // 教育与工作经历（显示在简介下方）
  // ------------------------------------------------------------------
  education: [
    // 请填写真实信息后删除 hide: true
    { years: '2015.8 – 2019.12', degree: '硕士', major: '计算机科学与技术', school: 'Virginia Tech', hide: false },
    { years: '2012.8 – 2019.12', degree: '博士', major: '物理学',   school: 'Virginia Tech', hide: false },
    { years: '2007.9 – 2011.6', degree: '学士', major: '物理学', school: '吉林大学', hide: false },
  ],

  work: [
    { years: '2019.12 – 2021.4', position: '博士后', place: 'Virginia Tech' },
    { years: '2021.4 – 2022.8', position: '游戏研发工程师', place: '网易（杭州）燕云十六声工作室' },
    { years: '2022.9 – 2025.12', position: '讲师', place: '浙江海洋大学 信息工程学院' },
    { years: '2026.1 – 至今', position: '副教授', place: '浙江海洋大学 信息工程学院' },
  ],

  // ------------------------------------------------------------------
  // 最新动态：竞赛、荣誉、论文、专利、项目会自动出现在这里。
  // 其他想单独发布的消息写在这里即可。
  // ------------------------------------------------------------------
  news: [
    // { date: '2025-09', text: '欢迎对水下视觉方向感兴趣的同学联系我。' },
  ],
  newsCount: 6,   // 首页最多显示几条

  // ------------------------------------------------------------------
  // 研究方向
  // ------------------------------------------------------------------
  research: [
    {
      title: '人工智能与机器人',
      titleEn: 'AI & Robotics',
      text: '研究人工智能与机器人技术的交叉问题，包括机器人视觉感知、基于深度学习的智能控制、人机交互，以及移动机器人在复杂与未知环境中的自主导航。',
    },
    {
      title: '计算机视觉',
      titleEn: 'Computer Vision',
      text: '关注目标检测与识别、图像分割、三维重建与视觉跟踪，应用于智能驾驶、工业检测、医疗影像与智能监控等领域。',
    },
  ],

  // ------------------------------------------------------------------
  // 科研项目
  // years 写起止年份；role 例如 主持 / 参与（排名第2）；status 例如 在研 / 已结题
  // 经费、合同、结题材料等不想公开的，记在 private/details.js 的 projects 里（用 id 对应）
  // ------------------------------------------------------------------
  projects: [
    // 下面是示例，填写真实项目后删除 hide: true
    {
      id: 'proj-001',
      title: '项目名称',
      source: '国家自然科学基金青年科学基金项目',
      number: '62xxxxxx',
      years: '2021 – 2024',
      role: '主持',
      status: '已结题',
      hide: true,
    },
  ],

  // ------------------------------------------------------------------
  // 论文（type: 'journal' 期刊 / 'conference' 会议 / 'abstract' 会议摘要 / 'thesis' 学位论文 / 'preprint' 预印本）
  // authors 里在自己名字后面加 * 表示通信作者、加 # 表示共同第一作者，例如 'Chengyuan Wen*'；
  // 本人第一作者 / 通信作者 / 共同第一作者的论文会自动排在前面，名字加粗
  // ------------------------------------------------------------------
  papers: [
    // 下面两条是旧网站的示例，填写真实论文后删除即可
    {
      id: 'paper-001',   // 科研记录（文章）里写 paper: paper-001 就能关联到这篇论文
      type: 'journal',
      title: '基于深度学习的图像识别方法研究',
      authors: '温程远, 张三, 李四',
      venue: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
      date: '2023',
      level: 'SCI 一区',
      doi: '',     // 例如 '10.1109/TPAMI.2023.1234567'，会自动变成链接
      pdf: '',     // 例如 'files/paper-xxx.pdf'
      hide: true,
    },
    {
      id: 'paper-002',
      type: 'conference',
      title: '机器人视觉定位系统设计与实现',
      authors: '温程远, 王五',
      venue: 'IEEE International Conference on Robotics and Automation (ICRA)',
      date: '2023',
      level: 'CCF A',
      hide: true,
    },

    // ---- 以下根据 Google Scholar 整理（2026-10），level 只写 CCF 等级；中科院分区记在 private/details.js 的 papers 里（不公开） ----
    // type: journal 期刊 / conference 会议 / abstract 会议摘要 / thesis 学位论文 / preprint 预印本

    // 期刊论文
    { id: 'paper-038', level: 'CCF C', type: 'journal', title: 'Machine learning methods comparison for maritime wireless signal strength prediction',
      authors: 'Lisha Peng, Kun Yang, Jianming Wu, Chengyuan Wen, Tong Peng, Xin Li',
      venue: 'Engineering Applications of Artificial Intelligence, 158: 111357', date: '2025-10',
      doi: '10.1016/j.engappai.2025.111357' },
    { id: 'paper-036', type: 'journal', title: 'Passing-by Ship Shadowing Model for Ship-to-Shore Maritime Communication',
      authors: 'Kun Yang, Beining Xu, Shefeng Yan, Chengyuan Wen*, Jianhua Zhou, Wenliang Wang',
      venue: 'IEEE Antennas and Wireless Propagation Letters, 24(11): 3846–3850', date: '2025-07',
      doi: '10.1109/LAWP.2025.3588736' },
    { id: 'paper-034', type: 'journal', title: 'Improving the accuracy of direction of arrival estimation with multiple signal inputs using deep learning',
      authors: 'Yihan Lu, Hengchao Guan, Kun Yang, Tong Peng, Chengyuan Wen, Xin Li',
      venue: 'Sensors, 24(10): 2971', date: '2024-05', doi: '10.3390/s24102971' },
    { id: 'paper-032', type: 'journal', title: 'Satellite to buoy IoT communications in the Arctic Ocean',
      authors: 'Terje Røste, Kun Yang, Chengyuan Wen',
      venue: 'Frontiers in Marine Science, 10: 1153798', date: '2023-11', doi: '10.3389/fmars.2023.1153798' },
    { id: 'paper-030', type: 'journal', title: 'Molecular Weight Distribution of Branched Polymers: Comparison between Monte Carlo Simulation and Flory-Stockmayer Theory',
      authors: 'Chengyuan Wen, Roy Odle, Shengfeng Cheng',
      venue: 'Polymers, 15(7): 1791', date: '2023-04', doi: '10.3390/polym15071791' },
    { id: 'paper-028', type: 'journal', title: 'Interfacial layers between ion and water detected by terahertz spectroscopy',
      authors: 'Abhishek K Singh, Luan C Doan, Djamila Lou, Chengyuan Wen, Nguyen Q Vinh',
      venue: 'The Journal of Chemical Physics, 157(5): 054501', date: '2022-08',
      doi: '10.1063/5.0095932' },
    { id: 'paper-027', type: 'journal', title: 'Long-range DNA-water interactions',
      authors: 'Abhishek K Singh, Chengyuan Wen, Shengfeng Cheng, Nguyen Q Vinh',
      venue: 'Biophysical Journal, 120(22): 4966–4979', date: '2021-11',
      doi: '10.1016/j.bpj.2021.10.016' },
    { id: 'paper-026', type: 'journal', title: 'On the nature of freezing/melting water in ionic polysulfones',
      authors: 'Britannia Vondrasek#, Chengyuan Wen#, Shengfeng Cheng, Judy S Riffle, John J Lesko',
      venue: 'Macromolecules, 54(13): 6477–6488', date: '2021-06', doi: '10.1021/acs.macromol.1c00591' },
    { id: 'paper-023', type: 'journal', title: 'Hydration, ion distribution, and ionic network formation in sulfonated poly(arylene ether sulfones)',
      authors: 'Britannia Vondrasek, Chengyuan Wen, Shengfeng Cheng, Judy S Riffle, John J Lesko',
      venue: 'Macromolecules, 54(1): 302–315', date: '2021-01',
      doi: '10.1021/acs.macromol.0c01855' },
    { id: 'paper-022', type: 'journal', title: 'Coarse-grained molecular dynamics modeling of a branched polyetherimide',
      authors: 'Chengyuan Wen, Roy Odle, Shengfeng Cheng',
      venue: 'Macromolecules, 54(1): 143–160', date: '2021-01', doi: '10.1021/acs.macromol.0c01440' },
    { id: 'paper-019', type: 'journal', title: 'Determination of glass transition temperature of polyimides from atomistic molecular dynamics simulations and machine-learning algorithms',
      authors: 'Chengyuan Wen, Binghan Liu, Josh Wolfgang, Timothy E Long, Roy Odle, Shengfeng Cheng',
      venue: 'Journal of Polymer Science, 58(11): 1521–1534', date: '2020-06', doi: '10.1002/pol.20200050' },
    { id: 'paper-014', type: 'journal', title: 'Insights into hydration dynamics and cooperative interactions in glycerol–water mixtures by terahertz dielectric spectroscopy',
      authors: 'Ali Charkhesht, Djamila Lou, Ben Sindle, Chengyuan Wen, Shengfeng Cheng, Nguyen Q Vinh',
      venue: 'The Journal of Physical Chemistry B, 123(41): 8791–8799', date: '2019-09', doi: '10.1021/acs.jpcb.9b07021' },
    { id: 'paper-003', type: 'journal', title: 'Theoretical study of stereodynamics and isotopic effects for the reaction C(3P) + OD(X2Π) → CO(X1Σ+) + D(2S)',
      authors: 'Runze Liu, Yijue Ding, Chengyuan Wen, Jinfeng Li, Mingwang Zhong, Ying Shi',
      venue: 'Journal of Theoretical and Computational Chemistry, 10(04): 447–469', date: '2011-08', doi: '10.1142/S0219633611006578' },

    // 会议论文
    { id: 'paper-039', type: 'conference', title: 'A Multi-Strategy-based Coati Optimization Algorithm for Enhanced Maritime Mobile Positioning',
      authors: 'ZhenYang Wang, Tong Peng, Kun Yang, Chengyuan Wen, Yingying Pan, Xin Li',
      venue: '2026 6th International Symposium on Computer Technology and Information Science (ISCTIS)', date: '2026-05',
      doi: '10.1109/ISCTIS70043.2026.11572645' },
    { id: 'paper-037', type: 'conference', title: 'MedLoRA: exploring LoRA and quantization combinations for medical QA',
      authors: 'Kun Liu, Chengyuan Wen*',
      venue: '2025 6th International Conference on Big Data & Artificial Intelligence & Software Engineering (ICBASE)', date: '2025-07',
      doi: '10.1109/ICBASE66587.2025.11181297' },
    { id: 'paper-035', type: 'conference', title: 'Small-scale channel characteristics of shadowing effect in maritime wireless communication',
      authors: 'Chengyuan Wen, Shuo Zhang, Kun Yang, Beining Xu',
      venue: '2025 19th European Conference on Antennas and Propagation (EuCAP), 1–5', date: '2025-03',
      doi: '10.23919/EuCAP63536.2025.10999440' },
    { id: 'paper-031', type: 'conference', title: 'LoRa Path-Loss Model and Verification for Maritime Environment',
      authors: 'Hao Zeng, Kun Yang, Jianming Wu, Jianjun Ding, Chengyuan Wen, Xin Li',
      venue: '2023 IEEE International Conference on Unmanned Systems (ICUS), 1587–1591', date: '2023-10',
      doi: '10.1109/ICUS58632.2023.10318285' },
    { id: 'paper-021', level: 'CCF A', type: 'conference', title: 'Inferring and applying def-use like configuration couplings in deployment descriptors',
      authors: 'Chengyuan Wen, Yaxuan Zhang, Xiao He, Na Meng',
      venue: 'Proceedings of the 35th IEEE/ACM International Conference on Automated Software Engineering (ASE)', date: '2020-12', doi: '10.1145/3324884.3416577' },
    { id: 'paper-020', type: 'conference', title: 'Hydration dynamics in Deoxyribonucleic acid using an extended MHz-THz spectroscopy',
      authors: 'Abhishek K Singh, Chengyuan Wen, Nguyen Q Vinh',
      venue: '2020 45th International Conference on Infrared, Millimeter, and Terahertz Waves (IRMMW-THz)', date: '2020-11',
      doi: '10.1109/IRMMW-THz46771.2020.9370608' },

    // 会议摘要（APS March Meeting 等，暂不显示）
    { id: 'paper-033', type: 'abstract', title: 'Atomistic and Coarse-Grained Molecular Dynamics Simulations of Epoxy Network Polymers',
      authors: 'Xi Hao, Chengyuan Wen, Gary Seidel, Shengfeng Cheng',
      venue: 'APS March Meeting Abstracts 2024, B26.005', date: '2024-03',
      url: 'https://ui.adsabs.harvard.edu/abs/2024APS..MARB26005H/abstract', hide: true },
    { id: 'paper-029', type: 'abstract', title: 'Coarse-grained Molecular Dynamics Simulation of Epoxy Network Polymers',
      authors: 'Xi Hao, Chengyuan Wen, Gary Seidel, Shengfeng Cheng',
      venue: 'APS March Meeting Abstracts 2023, N02.002', date: '2023',
      url: 'https://ui.adsabs.harvard.edu/abs/2023APS..MARN02002H/abstract', hide: true },
    { id: 'paper-025', type: 'abstract', title: 'Using Machine Learning to Predict the Glass Transition Temperature of Polyimides',
      authors: 'Chengyuan Wen, Binghan Liu, Josh Wolfgang, Timothy Long, Roy Odle, Shengfeng Cheng',
      venue: 'APS March Meeting Abstracts 2021, L63.009', date: '2021',
      url: 'https://ui.adsabs.harvard.edu/abs/2021APS..MARL63009W/abstract', hide: true },
    { id: 'paper-024', type: 'abstract', title: 'A Coarse-Grained Model of Epoxy Network Polymers for Large Scale Molecular Dynamic Simulations',
      authors: 'Xi Hao, Chengyuan Wen, Gary Seidel, Shengfeng Cheng',
      venue: 'APS March Meeting Abstracts 2021, L03.009', date: '2021',
      url: 'https://ui.adsabs.harvard.edu/abs/2021APS..MARL03009H/abstract', hide: true },
    { id: 'paper-018', type: 'abstract', title: 'Multiscale Modeling of Fracture in Epoxy/CNT Nanocomposites',
      authors: 'Hayden Hollenbeck, Chengyuan Wen, Ralph Romero, Tabassum Ahmed, Neslihan Genckal, Nishant Shirodkar, Gary Seidel, Shengfeng Cheng',
      venue: 'Bulletin of the American Physical Society 65 (APS March Meeting 2020, P33.9)', date: '2020-03',
      url: 'https://meetings.aps.org/Meeting/MAR20/Session/P33.9', hide: true },
    { id: 'paper-017', type: 'abstract', title: 'Hydration Phenomena in Sulfonated Poly(arylene ether sulfone) Membranes',
      authors: 'Chengyuan Wen, Britannia Vondrasek, Judy Riffle, Jack Lesko, Shengfeng Cheng',
      venue: 'APS March Meeting 2020', date: '2020-03',
      url: 'https://meetings-archive.aps.org/mar/2020/d34/12/', hide: true },
    { id: 'paper-016', type: 'abstract', title: 'Probing Temperature-Dependent Dynamics of Hemoglobin and Water Molecules in the Hydration Shells Using High Sensitivity Dielectric Spectroscopy',
      authors: 'Luan Doan, Abhishek Singh, Chengyuan Wen, Shengfeng Cheng, Vinh Nguyen',
      venue: 'Bulletin of the American Physical Society 65 (APS March Meeting 2020, A20.10)', date: '2020-03',
      url: 'https://meetings.aps.org/Meeting/MAR20/Session/A20.10', hide: true },
    { id: 'paper-011', type: 'abstract', title: 'Coarse-grained Molecular Dynamics Modeling of Epoxy/CNT Nanocomposites',
      authors: 'Ralph Romero, Hayden Hollenbeck, Chengyuan Wen, Gary Seidel, Shengfeng Cheng',
      venue: 'APS March Meeting Abstracts 2019, R52.002', date: '2019',
      url: 'https://ui.adsabs.harvard.edu/abs/2019APS..MARR52002R/abstract', hide: true },
    { id: 'paper-010', type: 'abstract', title: 'Molecular Modeling of Polyetherimides',
      authors: 'Chengyuan Wen, Shengfeng Cheng',
      venue: 'APS March Meeting Abstracts 2019, F55.006', date: '2019',
      url: 'https://ui.adsabs.harvard.edu/abs/2019APS..MARF55006W/abstract', hide: true },
    { id: 'paper-009', type: 'abstract', title: 'Evaporation of Polymer Solutions Containing both Polycations and Polyanions: A Molecular Dynamics Study',
      authors: 'Chengyuan Wen, Yanfei Tang, Shengfeng Cheng',
      venue: 'APS March Meeting Abstracts 2018, C55.008', date: '2018',
      url: 'https://ui.adsabs.harvard.edu/abs/2018APS..MARC55008W/abstract', hide: true },
    { id: 'paper-008', type: 'abstract', title: 'Evaporation of Solutions Containing Charged Polymers: A Molecular Dynamics Study',
      authors: 'Chengyuan Wen, Shengfeng Cheng',
      venue: 'APS March Meeting Abstracts 2017, S10.010', date: '2017-03',
      url: 'https://ui.adsabs.harvard.edu/abs/2017APS..MARS10010W/abstract', hide: true },
    { id: 'paper-007', type: 'abstract', title: 'Self-assembly of Polyelectrolyte-coated Nanoparticles',
      authors: 'Chengyuan Wen, Shengfeng Cheng',
      venue: 'Bulletin of the American Physical Society 61 (SES16, B2.6)', date: '2016-11',
      url: 'https://meetings.aps.org/Meeting/SES16/Session/B2.6', hide: true },
    { id: 'paper-006', type: 'abstract', title: 'Molecular Dynamics Simulations of Nanoparticles Coated with Charged Polymers',
      authors: 'Chengyuan Wen, Shengfeng Cheng',
      venue: 'APS March Meeting Abstracts 2016, E42.010', date: '2016',
      url: 'https://ui.adsabs.harvard.edu/abs/2016APS..MARE42010W/abstract', hide: true },
    { id: 'paper-005', type: 'abstract', title: 'Interactions between Nanoparticles and Polymer Brushes: Molecular Dynamics Simulations and Self-consistent Field Theory Calculations',
      authors: 'Shengfeng Cheng, Chengyuan Wen, Sergei Egorov',
      venue: 'APS March Meeting Abstracts 2015, T41.008', date: '2015-03',
      url: 'https://ui.adsabs.harvard.edu/abs/2015APS..MART41008C/abstract', hide: true },
    { id: 'paper-004', type: 'abstract', title: 'Molecular Dynamics Simulations of Water Evaporation',
      authors: 'Chengyuan Wen, Gary Grest, Shengfeng Cheng',
      venue: 'APS March Meeting Abstracts 2015, B43.001', date: '2015-03',
      url: 'https://ui.adsabs.harvard.edu/abs/2015APS..MARB43001W/abstract', hide: true },

    // 学位论文（暂不显示）
    { id: 'paper-015', type: 'thesis', title: 'Computational Studies of Polyetherimides: Beyond All-Atom Molecular Dynamics Simulations',
      authors: 'Chengyuan Wen',
      venue: 'Virginia Tech（物理学博士学位论文）', date: '2020-01',
      url: 'https://vtechworks.lib.vt.edu/items/f888793a-7d98-42d3-9ce6-8acf93821554', hide: true },
    { id: 'paper-012', type: 'thesis', title: 'Xeditor: Inferring and Applying XML Consistency Rules',
      authors: 'Chengyuan Wen',
      venue: 'Virginia Tech（计算机科学硕士学位论文）', date: '2019',
      url: 'https://vtechworks.lib.vt.edu/items/90f858d6-1400-46e0-892d-8c2028d6dd9a', hide: true },

  ],

  // ------------------------------------------------------------------
  // 专利：公开版只显示数量；名称、发明人、专利号、证书记在 private/details.js 的 patents 里
  // ------------------------------------------------------------------
  patentCount: 4,

  // ------------------------------------------------------------------
  // 教学
  // ------------------------------------------------------------------
  // 公开显示的授课课程（只写课名即可）。留空时公开版不显示；
  // 每学期的详细授课记录写在 private/details.js 的 teaching 里，只在本地显示
  // 例：{ name: 'Python语言入门', level: '本科' },
  courses: [],

  textbooks: [
    // 请填写真实信息后删除 hide: true
    { title: '《人工智能基础教程》', role: '主编', publisher: '高等教育出版社', date: '2023-08', hide: true },
    { title: '《计算机视觉实践指南》', role: '副主编', publisher: '清华大学出版社', date: '2022-06', hide: true },
  ],

  // ------------------------------------------------------------------
  // 学生（status: '在读' 或 '已毕业'）
  // 公开版只显示姓名；照片、论文题目、去向等记在 private/details.js
  // ------------------------------------------------------------------
  students: [
    { id: 'stu-001', name: '张硕',   level: '硕士研究生', year: '2022级', status: '已毕业' },
    { id: 'stu-002', name: '陶冉',   level: '硕士研究生', year: '2022级', status: '已毕业' },
    { id: 'stu-003', name: '孔佳豪', level: '本科生',     year: '2021级', status: '已毕业' },
  ],

  // ------------------------------------------------------------------
  // 指导学生项目（国家级 / 省级大学生创新创业训练计划、新苗人才计划等）
  // 负责人、成员、结题证书等记在 private/details.js 的 studentProjects 里（用 id 对应）
  // ------------------------------------------------------------------
  studentProjects: [
    {
      id: 'sproj-001',
      title: '白鲸——智能水下设施检测机器人',
      source: '浙江省大学生科技创新活动计划（新苗人才计划）',
      number: '2023R411048',
      years: '2023 – 2025',
      role: '指导教师',
      status: '已结题（优秀）',
    },
    {
      id: 'sproj-002',
      title: '基于Gillespie算法的高分子缩聚反应模拟软件',
      source: '国家级大学生创新创业训练计划项目',
      number: '202310340067',
      years: '2023 – 2025',
      role: '指导教师',
      status: '已结题',
    },
  ],

  // ------------------------------------------------------------------
  // 软件著作权：公开版只显示数量；名称、登记号、证书记在 private/details.js 的 software 里
  // ------------------------------------------------------------------
  softwareCount: 3,

  // ------------------------------------------------------------------
  // 竞赛指导（公开版只写比赛名称、奖项和时间）
  // 作品名称、学生名单、指导教师排名、材料都记在 private/details.js，
  // 用 id 对应；新加一条时起一个新 id（例如 comp-012）
  // ------------------------------------------------------------------
  competitions: [
    { id: 'comp-001', name: '“华为杯”第五届中国研究生人工智能创新大赛', award: '全国三等奖', date: '2023-09' },
    { id: 'comp-002', name: '“兆易创新杯”第十九届中国研究生电子设计竞赛', award: '商业计划书专项赛初赛团队二等奖', date: '2024-07' },
    { id: 'comp-003', name: '第二届中国研究生“双碳”创新与创意大赛', award: '全国一等奖', date: '2023-10' },
    { id: 'comp-004', name: '浙江省第十八届“挑战杯”工商银行大学生课外学术科技作品竞赛', award: '金奖', date: '2023-05' },
    { id: 'comp-005', name: '“农行杯”浙江省国际大学生创新大赛（2025）', award: '银奖', date: '2025-08' },
    { id: 'comp-006', name: '2023“中石协·石化机械杯”第十届中国研究生能源装备创新设计大赛', award: '全国一等奖', date: '2023-09' },
    { id: 'comp-007', name: '浙江省第十九届“挑战杯”大学生课外学术科技作品竞赛 “人工智能+”专项赛', award: '铜奖', date: '2025-07' },
    { id: 'comp-008', name: '浙江省第十九届“挑战杯”大学生课外学术科技作品竞赛 主体赛', award: '金奖', date: '2025-05' },
    { id: 'comp-009', name: '浙江省第十九届“挑战杯”大学生课外学术科技作品竞赛 “人工智能+”专项赛', award: '银奖', date: '2025-07' },
    { id: 'comp-010', name: '美国大学生数学建模竞赛（MCM）', award: 'Honorable Mention', date: '2025' },
    { id: 'comp-011', name: '美国大学生数学建模竞赛（MCM）', award: 'Honorable Mention', date: '2025' },
    { id: 'comp-012', name: '“建行杯”浙江省国际大学生创新大赛（2024）', award: '银奖', date: '2024-08' },
    { id: 'comp-013', name: '浙江省第十四届“挑战杯”浙商银行大学生创业计划竞赛', award: '银奖', date: '2024-05' },
    { id: 'comp-014', name: '2025年iCAN大学生创新创业大赛 AI挑战赛全国总决赛', award: '全国三等奖', date: '2025-12' },
    { id: 'comp-015', name: '2025年iCAN大学生创新创业大赛（江苏浙江赛区）', award: '三等奖', date: '2025-11' },
    { id: 'comp-016', name: '2025年iCAN大学生创新创业大赛（江苏浙江赛区）', award: '二等奖', date: '2025-11' },
    { id: 'comp-017', name: '全国大学生数学建模竞赛', award: '浙江省三等奖', date: '2025-11' },
    { id: 'comp-018', name: '“中国移动杯”第一届浙江省大学生人工智能竞赛', award: '二等奖', date: '2025-12' },
    { id: 'comp-019', name: '2025年睿抗机器人开发者大赛（RAICOM）全国总决赛 编程技能竞赛', award: '全国二等奖', date: '2025-08' },
    { id: 'comp-020', name: '第二十一届浙江省大学生电子商务竞赛', award: '三等奖', date: '2026-06' },
    { id: 'comp-021', name: '浙江省第十五届“挑战杯”大学生创业计划竞赛', award: '银奖', date: '2026-06' },
    { id: 'comp-022', name: '2025年iCAN大学生创新创业大赛（江苏浙江赛区）', award: '三等奖', date: '2025-11' },
  ],

  // ------------------------------------------------------------------
  // 荣誉（证书和对应的学生竞赛记在 private/details.js 的 honors 里，用 id 对应）
  // ------------------------------------------------------------------
  honors: [
    { id: 'honor-001', title: '第二届中国研究生“双碳”创新与创意大赛 优秀指导教师', level: '国家级', date: '2023-10' },
  ],

  // ------------------------------------------------------------------
  // 相册：把照片放进 photos/gallery/，在这里加一行
  // ------------------------------------------------------------------
  gallery: [
    // { src: 'photos/gallery/2025-lab.jpg', caption: '2025 年课题组合影' },
  ],

  // 页脚
  footer: '© 温程远 · 浙江海洋大学',
};
