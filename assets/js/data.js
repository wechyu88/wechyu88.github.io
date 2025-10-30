// 网站数据配置文件
// 最后更新: 2025/10/30 13:29:46

const siteData = {
  "personal": {
    "name": "温程远",
    "nameEn": "Chengyuan Wen",
    "title": "讲师",
    "affiliation": "浙江海洋大学",
    "email": "your-email@example.com",
    "avatar": "images/Avatar.jpg",
    "bio": "我是温程远（Chengyuan Wen），目前在浙江海洋大学从事人工智能、计算机视觉、机器学习等领域的研究和教学工作。我的研究兴趣包括深度学习、计算机视觉、机器人技术以及数据挖掘等方向。",
    "introduction": "在学术研究过程中，我注重理论与实践相结合，致力于将先进的人工智能技术应用于实际问题的解决。同时，我也热衷于指导学生参与科研项目和学科竞赛，培养学生的创新能力和实践能力。"
  },
  "research": [
    {
      "id": "ai-robotics",
      "title": "人工智能与机器人",
      "titleEn": "AI and Robotics",
      "icon": "🤖",
      "description": "研究智能机器人系统、自主导航、人机交互等前沿技术。",
      "image": "assets/images/research/placeholder.jpg",
      "content": "本研究方向专注于人工智能与机器人技术的前沿研究...",
      "topics": [
        {
          "title": "智能导航系统",
          "description": "研究机器人在复杂环境中的自主导航能力",
          "image": "assets/images/research/placeholder.jpg"
        },
        {
          "title": "人机交互技术",
          "description": "开发自然、高效的人机交互方式",
          "image": "assets/images/research/placeholder.jpg"
        }
      ],
      "students": [
        {
          "name": "张三",
          "level": "博士生",
          "direction": "机器人路径规划与导航",
          "year": "2022",
          "image": "assets/images/students/placeholder.jpg",
          "intro": "主要研究基于深度强化学习的机器人自主导航算法。"
        }
      ]
    },
    {
      "id": "computer-vision",
      "title": "计算机视觉",
      "titleEn": "Computer Vision",
      "icon": "👁️",
      "description": "专注于图像识别、目标检测、场景理解等计算机视觉技术。",
      "image": "assets/images/research/placeholder.jpg",
      "content": "计算机视觉是人工智能的重要分支...",
      "topics": [],
      "students": []
    },
    {
      "id": "machine-learning",
      "title": "机器学习",
      "titleEn": "Machine Learning",
      "icon": "🧠",
      "description": "深入研究深度学习、强化学习、迁移学习等机器学习方法。",
      "image": "assets/images/research/placeholder.jpg",
      "content": "机器学习是人工智能的核心技术...",
      "topics": [],
      "students": []
    },
    {
      "id": "data-mining",
      "title": "数据挖掘",
      "titleEn": "Data Mining",
      "icon": "📊",
      "description": "利用数据挖掘技术发现数据中的模式和知识，支持决策分析。",
      "image": "assets/images/research/placeholder.jpg",
      "content": "数据挖掘是从大量数据中提取有价值信息和知识的过程...",
      "topics": [],
      "students": []
    }
  ],
  "achievements": {
    "journals": [
      {
        "title": "Deep Learning for Autonomous Robot Navigation in Complex Environments",
        "authors": "Chengyuan Wen, Zhang San, et al.",
        "venue": "IEEE Transactions on Robotics",
        "year": 2024,
        "date": "2024-06",
        "level": "SCI一区",
        "abstract": "提出了一种新型深度强化学习框架，实现了机器人在复杂环境中的高效自主导航。",
        "tags": [
          "人工智能",
          "机器人"
        ],
        "period": "work",
        "doi": "",
        "pdf": ""
      }
    ],
    "conferences": [
      {
        "title": "Efficient Object Detection with Vision Transformers",
        "authors": "Chen Xiaoming, Chengyuan Wen, et al.",
        "venue": "CVPR 2024",
        "year": 2024,
        "date": "2024-06",
        "level": "CCF A类",
        "abstract": "提出了一种高效的基于视觉Transformer的目标检测算法。",
        "tags": [
          "计算机视觉",
          "深度学习"
        ],
        "period": "work"
      }
    ],
    "patents": [
      {
        "title": "一种基于深度学习的智能机器人导航系统",
        "inventors": "温程远, 张三",
        "number": "CN202410001234",
        "date": "2024-05",
        "status": "已授权",
        "period": "work"
      }
    ],
    "projects": [
      {
        "title": "国家自然科学基金面上项目",
        "number": "62xxxxxx",
        "role": "项目负责人",
        "budget": "60万",
        "startDate": "2023-01",
        "endDate": "2026-12",
        "description": "基于深度学习的智能机器人环境感知与导航技术研究",
        "period": "work"
      }
    ],
    "awards": [
      {
        "title": "IEEE优秀论文奖",
        "organization": "IEEE",
        "date": "2024-08",
        "level": "国际级",
        "description": "论文'Deep Learning for Autonomous Robot Navigation'获奖",
        "period": "work"
      }
    ]
  },
  "teaching": {
    "courses": [
      {
        "name": "人工智能导论",
        "code": "CS101",
        "credit": 3,
        "hours": 48,
        "semester": "2024秋季",
        "level": "本科",
        "description": "介绍人工智能的基本概念、方法和应用"
      },
      {
        "name": "深度学习",
        "code": "CS301",
        "credit": 3,
        "hours": 48,
        "semester": "2024春季",
        "level": "研究生",
        "description": "深入讲解深度学习的理论与实践"
      }
    ],
    "textbooks": [
      {
        "title": "深度学习实战教程",
        "authors": "温程远 等",
        "publisher": "清华大学出版社",
        "date": "2023-08",
        "isbn": "978-7-302-xxxxx-x",
        "cover": "assets/images/achievements/placeholder.jpg"
      }
    ],
    "awards": [
      {
        "title": "优秀教学成果奖",
        "level": "校级一等奖",
        "date": "2024-09",
        "description": "基于项目驱动的人工智能课程教学改革"
      }
    ]
  },
  "students": {
    "current": {
      "phd": [],
      "master": [],
      "undergraduate": []
    },
    "graduated": {
      "phd": [],
      "master": [],
      "undergraduate": []
    }
  },
  "service": {
    "reviewer": [
      {
        "venue": "IEEE TPAMI",
        "years": "2022-至今",
        "role": "审稿人"
      },
      {
        "venue": "CVPR",
        "years": "2023-至今",
        "role": "审稿人"
      }
    ],
    "committee": [
      {
        "role": "程序委员会委员",
        "conference": "ICML 2024",
        "year": 2024
      }
    ],
    "editor": []
  },
  "competitions": [
    {
      "name": "中国国际大学生创新大赛",
      "project": "智能机器人导航系统",
      "award": "国家级金奖",
      "date": "2024-10",
      "students": [
        "赵六",
        "李明",
        "王芳"
      ],
      "description": "项目开发了一套智能机器人导航系统...",
      "images": [
        "assets/images/test/placeholder.jpg"
      ]
    }
  ],
  "talks": [
    {
      "title": "深度学习在计算机视觉中的应用",
      "event": "浙江省人工智能学术会议",
      "date": "2024-09-15",
      "location": "杭州",
      "type": "特邀报告"
    }
  ],
  "news": [
    {
      "title": "论文被顶级会议录用",
      "date": "2024-10-20",
      "content": "我们团队的论文被CVPR 2025录用...",
      "image": ""
    }
  ]
};

// 导出数据供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = siteData;
}