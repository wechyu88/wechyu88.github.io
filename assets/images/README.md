# 图片文件夹使用说明

本文件夹用于存放个人学术主页的所有图片资源。

## 文件夹结构

```
assets/images/
├── students/        # 学生照片
├── research/        # 研究内容相关图片
├── achievements/    # 成果相关图片（论文、获奖证书等）
├── backgrounds/     # 背景图片
└── test/           # 测试占位图片（已包含默认测试图片）
```

## 使用指南

### 1. 学生照片 (students/)
- 存放参与各研究方向的学生照片
- 建议尺寸：400x500 像素或同比例
- 命名规范：`student_name.jpg`，例如：`zhangsan.jpg`
- 支持格式：JPG, PNG

### 2. 研究内容图片 (research/)
- 存放各研究方向的项目图片、实验结果、系统界面等
- 建议尺寸：800x600 像素或 16:9 比例
- 命名规范：
  - `ai_robotics_01.jpg` - 人工智能与机器人
  - `computer_vision_01.jpg` - 计算机视觉
  - `machine_learning_01.jpg` - 机器学习
  - `data_mining_01.jpg` - 数据挖掘
- 支持格式：JPG, PNG

### 3. 成果图片 (achievements/)
- 存放论文截图、获奖证书、会议现场照片等
- 建议尺寸：根据实际内容调整
- 命名规范：
  - `paper_title_abbreviation.jpg` - 论文相关
  - `award_name_year.jpg` - 获奖证书
  - `conference_name_year.jpg` - 会议照片
- 支持格式：JPG, PNG, PDF

### 4. 背景图片 (backgrounds/)
- 存放页面背景图片、横幅图片等
- 建议尺寸：1920x1080 或更高分辨率
- 命名规范：`bg_page_name.jpg`
- 支持格式：JPG, PNG

### 5. 测试图片 (test/)
- 当前包含默认的占位测试图片 `placeholder.jpg`
- 用于网站开发和测试阶段
- 正式上线前建议替换为实际图片

## 图片上传步骤

1. 准备好需要上传的图片
2. 按照上述分类将图片重命名
3. 将图片复制到对应的文件夹中
4. 在HTML页面中更新图片路径，例如：
   ```html
   <img src="../assets/images/students/zhangsan.jpg" alt="张三">
   <img src="../assets/images/research/ai_robotics_01.jpg" alt="机器人项目">
   ```

## 注意事项

1. **图片大小**：建议单张图片不超过2MB，以保证网页加载速度
2. **图片格式**：优先使用JPG格式（照片）和PNG格式（图标、截图）
3. **图片质量**：保持清晰度的同时适当压缩，推荐使用在线压缩工具
4. **命名规范**：使用英文或拼音命名，避免使用中文和特殊字符
5. **版权问题**：确保上传的图片拥有使用权，避免侵权

## 当前使用测试图片的页面

以下页面当前使用测试占位图片，需要替换为实际图片：

- 主页 (index-new.html)
- 所有研究方向页面 (pages/research/*.html)
- 所有成果页面 (pages/achievements/*.html)
- 大学生竞赛页面 (pages/competitions.html)

## 替换步骤

1. 将实际图片上传到对应文件夹
2. 打开相应的HTML文件
3. 将 `assets/images/test/placeholder.jpg` 替换为实际图片路径
4. 保存并测试页面显示效果

---

最后更新日期：2025-10-27
