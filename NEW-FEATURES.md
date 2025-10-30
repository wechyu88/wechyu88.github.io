# 新功能使用指南

## 🎉 最新更新

### 1. 本地开发问题修复

**问题**：在本地双击打开HTML文件时，页面加载失败。

**原因**：浏览器的安全策略不允许使用`file://`协议加载其他文件。

**解决方案**：

使用本地HTTP服务器运行项目：

```bash
# 方法1: Python 3
python -m http.server 8000

# 方法2: Python 2
python -m SimpleHTTPServer 8000

# 方法3: Node.js
npx http-server

# 方法4: PHP
php -S localhost:8000
```

然后在浏览器访问: `http://localhost:8000`

**提示**：页面加载失败时会自动显示详细的解决方案。

---

### 2. 子菜单样式美化 ✨

子菜单现在更加美观：
- ✅ 不再紧贴左侧，有适当间距
- ✅ 每个子菜单项都有圆角边框和背景
- ✅ 鼠标悬停时有平滑动画效果
- ✅ 激活状态有明显的蓝色高亮
- ✅ 点击时有向右滑动效果

---

### 3. 全局时间线系统 📅

#### 什么是时间线系统？

时间线系统可以自动收集并整理你所有重要的学术事件，包括：
- 📄 论文发表
- 🔬 专利授权
- 🏆 荣誉奖项
- 👨‍🎓 学生指导
- 🎯 竞赛指导
- 💼 科研项目
- 📌 其他重要事件

#### 如何添加时间线事件？

在任何页面的 `<script>` 标签中调用 `markTimelineEvent()` 函数：

```html
<script>
    // 基本用法
    markTimelineEvent('2023-12-25', '事件标题', '事件类别');

    // 完整用法（带关联ID和描述）
    markTimelineEvent(
        '2023-12-25',          // 日期
        '论文被期刊接收',       // 标题
        'paper',               // 类别: paper/patent/honor/student/competition/project/other
        'paper-001',           // 关联的数据ID（可选）
        '这是事件的详细描述'    // 描述（可选）
    );
</script>
```

**示例**：

```html
<!-- 在 home.html 中 -->
<script>
    // 论文发表
    markTimelineEvent('2024-01', '论文被IEEE TPAMI接收', 'paper', 'paper-001');

    // 竞赛指导
    markTimelineEvent('2023-12', '指导学生获得全国一等奖', 'competition', 'competition-001');

    // 荣誉奖项
    markTimelineEvent('2023-10', '获得省科技进步奖', 'honor', 'honor-001');

    // 专利授权
    markTimelineEvent('2023-06-15', '专利获得授权', 'patent', 'patent-001');

    // 其他事件
    markTimelineEvent('2023-01', '开始访问学者计划', 'other', null, '为期一年');
</script>
```

#### 如何生成时间线？

**步骤**：
1. 连续点击侧边栏底部的**统计区域** 3次
2. 隐藏工具栏会弹出
3. 点击 **"📅 生成时间线"** 按钮
4. 自动下载Markdown格式的时间线文件

**时间线文件内容**：
- 按时间倒序排列所有事件
- 自动分类显示（论文、专利、荣誉等）
- 包含事件描述和关联ID
- Markdown格式，易于编辑和分享

---

### 4. 一键生成学术简历 📄

#### 什么是学术简历？

自动从`global-data.js`中提取所有数据，生成完整的学术简历，包括：
- 📋 个人信息
- 🎓 教育背景
- 💼 工作经历
- 💡 科研项目
- 📚 论文发表
- 🔬 专利
- 🏆 荣誉奖项
- 👨‍🎓 学生指导
- 🎯 竞赛指导

#### 如何生成简历？

**步骤**：
1. 连续点击侧边栏底部的**统计区域** 3次
2. 隐藏工具栏会弹出
3. 点击 **"📄 生成简历"** 按钮
4. 自动下载Markdown格式的简历文件

**简历特点**：
- ✅ 自动统计数量（论文、专利等）
- ✅ 格式规范，符合学术简历标准
- ✅ Markdown格式，可轻松转换为PDF
- ✅ 包含所有重要信息
- ✅ 自动生成日期标注

#### 准备工作

确保在 `assets/js/global-data.js` 中填写了完整的个人信息：

```javascript
personalInfo: {
    name: '温程远',
    nameEn: 'Wen Chengyuan',
    title: '副教授',
    affiliation: '浙江海洋大学',
    department: '信息工程学院',
    email: 'wenchengyuan@zjou.edu.cn',
    phone: '+86-580-xxxxxxx',
    address: '浙江省舟山市定海区临城街道海大南路1号',
    postcode: '316022',
    researchInterests: ['人工智能', '计算机视觉', ...]
},

education: [
    {
        degree: '博士',
        major: '计算机科学与技术',
        university: '某某大学',
        duration: '2015-2019',
        thesis: '博士学位论文标题',
        supervisor: '导师姓名'
    }
    // ...
],

workExperience: [
    {
        position: '副教授',
        institution: '浙江海洋大学',
        department: '信息工程学院',
        duration: '2019年至今',
        description: '从事教学科研工作'
    }
    // ...
]
```

---

## 💡 使用技巧

### 激活隐藏工具的方法

**方法1**：连续点击统计区域3次（推荐）
- 点击侧边栏底部显示论文、专利、学生数量的区域
- 连续快速点击3次
- 隐藏工具栏会弹出

**方法2**：浏览器控制台
```javascript
toggleHiddenTools()  // 显示/隐藏工具栏
```

### 隐藏工具栏

点击工具栏中的 **"❌ 隐藏"** 按钮，或再次点击统计区域3次。

---

## 📝 最佳实践

### 1. 时间线事件的添加位置

**推荐**：在相关页面添加时间线标记

```
home.html        → 添加最新的、重要的事件
achievements-*.html → 添加论文发表事件
honors.html      → 添加荣誉奖项事件
competitions.html → 添加竞赛指导事件
students.html    → 添加学生相关事件
```

**示例**：在论文页面添加发表事件

```html
<!-- achievements-journals.html -->
<script>
    const journals = getPapersByType('journal');
    document.getElementById('journal-list').innerHTML = renderPapers(journals.map(p => p.id));

    // 为每篇论文添加时间线事件
    journals.forEach(paper => {
        markTimelineEvent(
            `${paper.year}-01`,  // 假设发表在年初
            `论文《${paper.title}》发表于${paper.venue}`,
            'paper',
            paper.id
        );
    });
</script>
```

### 2. 时间线事件的类别

使用正确的类别标记：

| 类别 | 说明 | 图标 |
|------|------|------|
| `paper` | 论文发表 | 📄 |
| `patent` | 专利授权 | 🔬 |
| `honor` | 荣誉奖项 | 🏆 |
| `student` | 学生指导相关 | 👨‍🎓 |
| `competition` | 竞赛指导 | 🎯 |
| `project` | 科研项目 | 💼 |
| `other` | 其他事件 | 📌 |

### 3. 定期生成简历

建议每学期或每年生成一次简历：
1. 更新 `global-data.js` 中的所有数据
2. 生成最新简历
3. 保存备份
4. 用于申报、评审等

---

## 🐛 常见问题

### Q: 点击3次后工具栏没有出现？

A: 检查：
1. 是否点击的是统计区域（显示数字的地方）
2. 点击是否够快（1秒内完成3次）
3. 打开浏览器控制台查看是否有日志

### Q: 时间线为空怎么办？

A: 在页面中添加 `markTimelineEvent()` 调用。如果没有添加任何事件，时间线会提示"暂无时间线事件"。

### Q: 简历中缺少某些信息？

A: 在 `global-data.js` 中补充对应的数据。简历是从 `globalData` 对象中提取的。

### Q: 如何修改时间线或简历的格式？

A: 编辑 `assets/js/global-data.js` 中的：
- `generateTimelineMarkdown()` 函数（时间线格式）
- `generateAcademicCV()` 函数（简历格式）

### Q: 下载的文件在哪里？

A: 通常在浏览器的默认下载文件夹中，文件名包含日期。

---

## 🎯 总结

### 本次更新内容

1. ✅ 修复本地开发加载问题，添加详细提示
2. ✅ 美化子菜单样式，提升用户体验
3. ✅ 全局时间线系统，自动整理学术事件
4. ✅ 一键生成学术简历，Markdown格式
5. ✅ 隐藏工具栏设计，保持界面简洁

### 快速开始

1. **本地运行**: `python -m http.server 8000`
2. **添加事件**: 在页面中使用 `markTimelineEvent()`
3. **激活工具**: 点击统计区域3次
4. **生成文档**: 点击对应按钮下载

---

**祝您使用愉快！** 🎉

*更新日期: 2024年10月30日*
