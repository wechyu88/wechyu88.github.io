# 页面编辑指南

本目录包含所有子页面的HTML文件。

## 快速开始

### 1. 添加新页面

1. 复制 `_TEMPLATE.html` 文件
2. 重命名为你的页面名称，例如 `my-new-page.html`
3. 编辑内容
4. 在 `index.html` 中添加导航链接：

```html
<li class="nav-item">
    <a href="javascript:void(0)" onclick="loadPage('pages/my-new-page.html')" class="nav-link">
        <i>📄</i> 我的新页面
    </a>
</li>
```

### 2. 删除页面

1. 删除对应的HTML文件
2. 在 `index.html` 中注释或删除对应的导航链接

### 3. 使用模板模块

`_TEMPLATE.html` 包含以下模块：

- **文本内容**：纯HTML文本
- **Markdown内容**：使用 `<markdown>` 标签包裹
- **图片展示**：单张图片或图片网格
- **文献下载**：PDF下载链接
- **卡片列表**：信息卡片网格
- **时间线**：事件时间线
- **表格**：数据表格
- **标签云**：关键词标签

### 4. 使用全局数据

在 `assets/js/global-data.js` 中管理所有数据：

```javascript
// 渲染特定论文
renderPapers(['paper-001', 'paper-002']);

// 渲染所有期刊论文
renderPapers(getPapersByType('journal').map(p => p.id));

// 渲染所有在读学生
renderStudents(getStudentsByStatus('在读').map(s => s.id));

// 渲染特定专利
renderPatents(['patent-001']);
```

### 5. 添加文件下载

1. 将文件放到对应目录：
   - 论文PDF: `downloads/papers/`
   - 专利证书: `downloads/patents/`
   - 荣誉证书: `downloads/honors/`

2. 在 `global-data.js` 中添加数据：

```javascript
{
    id: 'paper-003',
    title: '论文标题',
    pdf: 'downloads/papers/paper-003.pdf'
}
```

3. 页面中自动生成下载链接

### 6. 使用Markdown

在HTML中直接使用 `<markdown>` 标签：

```html
<markdown>
## 标题

这是**粗体**，这是*斜体*。

- 列表项1
- 列表项2
</markdown>
```

### 7. 添加图片

1. 将图片放到对应目录：
   - 学生照片: `images/students/`
   - 竞赛照片: `images/competitions/`
   - 其他图片: `images/`

2. 在页面中引用：

```html
<img src="images/students/student-001.jpg" alt="学生姓名">
```

## 文件结构

```
pages/
├── README.md                        # 本文件
├── _TEMPLATE.html                   # 页面模板
├── home.html                        # 首页
├── research-ai.html                 # 研究方向页面
├── achievements-journals.html       # 期刊论文页面
└── ...                              # 其他页面

downloads/
├── papers/                          # 论文PDF
├── patents/                         # 专利证书
└── honors/                          # 荣誉证书

images/
├── students/                        # 学生照片
├── competitions/                    # 竞赛照片
└── ...                              # 其他图片
```

## 常见问题

### Q: 如何避免论文重复计数？

A: 在 `global-data.js` 中每篇论文只定义一次，使用唯一ID。在不同页面引用同一ID即可。

### Q: 如何添加外部链接？

A: 使用 `<a href="https://..." target="_blank">` 标签，或参考 `home.html` 中的链接卡片样式。

### Q: 如何自定义样式？

A: 在页面底部的 `<style>` 标签中添加CSS样式。

### Q: 页面加载失败怎么办？

A: 检查：
1. 文件路径是否正确
2. 文件名是否拼写正确
3. 浏览器控制台是否有错误信息
