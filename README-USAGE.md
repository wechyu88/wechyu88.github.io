# 个人主页使用指南

## 🎉 全新的简洁静态网页系统

已完全移除CMS系统，改为直接编辑HTML文件的简单方式。

---

## 📁 文件结构

```
wechyu88.github.io/
├── index.html                      # 主页（固定侧边栏）
├── pages/                          # 所有子页面
│   ├── README.md                   # 页面编辑详细指南
│   ├── _TEMPLATE.html              # 页面模板（复制此文件创建新页面）
│   ├── home.html                   # 首页
│   ├── achievements-*.html         # 成果页面
│   ├── research-*.html             # 研究方向页面
│   ├── teaching-*.html             # 教学工作页面
│   ├── students.html               # 学生指导
│   ├── competitions.html           # 竞赛指导
│   ├── honors.html                 # 荣誉奖项
│   └── contact.html                # 联系方式
├── assets/
│   └── js/
│       └── global-data.js          # 全局数据管理（论文、专利、学生等）
├── downloads/                      # 文件下载目录
│   ├── papers/                     # 论文PDF
│   ├── patents/                    # 专利证书
│   └── honors/                     # 荣誉证书
└── images/                         # 图片目录
    ├── students/                   # 学生照片
    └── competitions/               # 竞赛照片
```

---

## 🚀 快速开始

### 1. 添加/删除侧边栏菜单

编辑 `index.html` 第 24-106 行，通过**注释/取消注释**来控制菜单项：

```html
<!-- 删除菜单：注释掉整个 <li> 块 -->
<!--
<li class="nav-item">
    <a href="javascript:void(0)" onclick="loadPage('pages/某页面.html')" class="nav-link">
        <i>📄</i> 某菜单
    </a>
</li>
-->

<!-- 添加新菜单：取消注释或复制一个 <li> 块 -->
<li class="nav-item">
    <a href="javascript:void(0)" onclick="loadPage('pages/new-page.html')" class="nav-link">
        <i>📄</i> 新页面
    </a>
</li>
```

### 2. 创建新页面

1. 复制 `pages/_TEMPLATE.html` 文件
2. 重命名为 `pages/my-new-page.html`
3. 编辑内容（模板包含8种常用模块）
4. 在 `index.html` 中添加对应的导航链接

### 3. 管理数据（论文、专利、学生等）

编辑 `assets/js/global-data.js` 文件：

```javascript
// 添加新论文
papers: [
    {
        id: 'paper-003',                    // 唯一ID
        type: 'journal',                    // 'journal' 或 'conference'
        title: '论文标题',
        authors: '作者列表',
        venue: '期刊/会议名称',
        year: 2024,
        level: 'SCI一区',
        doi: '10.xxxx/xxxxx',
        pdf: 'downloads/papers/paper-003.pdf',   // PDF文件路径
        abstract: '摘要内容',
        keywords: ['关键词1', '关键词2']
    }
]

// 添加新专利
patents: [
    {
        id: 'patent-002',
        title: '专利名称',
        inventors: '发明人',
        number: '专利号',
        status: '已授权',
        date: '2024-01-15',
        certificate: 'downloads/patents/patent-002-cert.pdf'
    }
]

// 添加新学生
students: [
    {
        id: 'student-002',
        name: '学生姓名',
        level: '硕士研究生',
        year: '2023级',
        status: '在读',              // '在读' 或 '已毕业'
        research: '研究方向',
        photo: 'images/students/student-002.jpg',
        achievements: [
            '成果1',
            '成果2'
        ]
    }
]
```

### 4. 上传文件

将文件放到对应目录：
- **论文PDF**: `downloads/papers/`
- **专利证书**: `downloads/patents/`
- **荣誉证书**: `downloads/honors/`
- **学生照片**: `images/students/`
- **竞赛照片**: `images/competitions/`

然后在 `global-data.js` 中引用文件路径。

### 5. 使用Markdown

在页面中使用 `<markdown>` 标签：

```html
<section class="content-card">
    <h2>标题</h2>
    <markdown>
## Markdown 标题

这是**粗体**，这是*斜体*。

### 列表
- 列表项1
- 列表项2

### 代码
```python
def hello():
    print("Hello, World!")
```

### 链接
[点击这里](https://example.com)
    </markdown>
</section>
```

---

## 📝 页面模板模块

`pages/_TEMPLATE.html` 包含以下模块：

1. **文本内容** - 纯HTML文本
2. **Markdown内容** - 支持Markdown语法
3. **图片展示** - 单张或多张图片网格
4. **文献下载** - PDF下载链接
5. **卡片列表** - 信息卡片网格
6. **时间线** - 事件时间线
7. **表格** - 数据表格
8. **标签云** - 关键词标签

复制需要的模块到你的新页面中即可。

---

## 🔢 全局计数系统

系统会自动统计并显示在侧边栏：

- **论文数量**: 自动统计 `globalData.papers` 的长度
- **专利数量**: 自动统计 `globalData.patents` 的长度
- **学生数量**: 自动统计 `globalData.students` 的长度

**避免重复计数**：每个项目在 `global-data.js` 中只定义一次，使用唯一ID，在不同页面引用同一ID即可。

---

## 🔗 添加外部链接

### 方式1：直接链接

```html
<a href="https://scholar.google.com" target="_blank">Google Scholar</a>
```

### 方式2：使用链接卡片（参考 home.html）

```html
<div class="link-grid">
    <a href="https://example.com" target="_blank" class="link-card">
        <span class="link-icon">🔗</span>
        <span class="link-title">链接标题</span>
    </a>
</div>
```

---

## 🎨 自定义样式

在页面底部的 `<style>` 标签中添加CSS：

```html
<style>
    .my-custom-class {
        color: #3498db;
        font-size: 1.2rem;
    }
</style>
```

---

## 💡 使用技巧

### 1. 引用全局数据

在页面中使用全局数据渲染函数：

```html
<div id="my-papers"></div>
<script>
    // 显示特定论文
    document.getElementById('my-papers').innerHTML =
        renderPapers(['paper-001', 'paper-002']);

    // 显示所有期刊论文
    const journals = getPapersByType('journal');
    document.getElementById('my-papers').innerHTML =
        renderPapers(journals.map(p => p.id));

    // 显示所有在读学生
    const currentStudents = getStudentsByStatus('在读');
    document.getElementById('students').innerHTML =
        renderStudents(currentStudents.map(s => s.id));
</script>
```

### 2. 条件筛选

```javascript
// 筛选2023年的论文
const papers2023 = globalData.papers.filter(p => p.year === 2023);

// 筛选包含特定关键词的论文
const cvPapers = globalData.papers.filter(p =>
    p.keywords && p.keywords.some(k => k.includes('计算机视觉'))
);

// 筛选已毕业学生
const graduated = getStudentsByStatus('已毕业');
```

### 3. 响应式图片网格

```html
<div class="image-grid">
    <img src="images/photo1.jpg" alt="照片1">
    <img src="images/photo2.jpg" alt="照片2">
    <img src="images/photo3.jpg" alt="照片3">
</div>

<style>
    .image-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }
</style>
```

---

## ⚠️ 注意事项

1. **文件路径**: 所有路径使用相对路径，从项目根目录开始
2. **文件名**: 建议使用小写字母和连字符，如 `my-page.html`
3. **唯一ID**: 每个数据项必须有唯一ID，避免重复
4. **图片格式**: 推荐使用 JPG/PNG 格式，大小控制在1MB以内
5. **PDF文件**: 确保文件权限允许下载

---

## 🐛 常见问题

### Q: 页面加载失败？
A: 检查文件路径是否正确，文件名是否拼写正确。

### Q: Markdown不显示？
A: 确保使用 `<markdown>` 标签包裹内容，且marked.js已加载。

### Q: 统计数字不更新？
A: 确保在 `global-data.js` 中添加了数据，且页面调用了 `updateStats()`。

### Q: 图片不显示？
A: 检查图片路径和文件是否存在，路径是否正确。

### Q: 如何调试？
A: 打开浏览器开发者工具（F12），查看Console标签的错误信息。

---

## 📚 更多信息

详细的页面编辑指南请参考: `pages/README.md`

---

## 🎯 系统特点

✅ **简单直观** - 直接编辑HTML文件
✅ **模板丰富** - 8种常用模块随意组合
✅ **数据统一** - 全局管理避免重复
✅ **灵活扩展** - 易于添加新页面和功能
✅ **Markdown支持** - 轻松编写内容
✅ **响应式设计** - 自适应各种屏幕
✅ **文件下载** - 支持PDF等文件下载
✅ **无需数据库** - 纯静态网页

---

**祝您使用愉快！** 🎉
