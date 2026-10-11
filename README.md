# 温程远 · 个人主页

纯静态网页，没有构建步骤，不依赖任何外部 CDN 或字体（国内打开不会卡在加载外部资源上）。

```
index.html        页面骨架（一般不用改）
content.js        ★ 公开内容：简介、项目、论文、专利、学生姓名、竞赛名称与奖项……
photos/ files/    公开的照片和附件
cv.html           简历 / 时间线导出页（只在本地可用）
assets/           样式和脚本（改配色看 assets/style.css 顶部）

private/          ★ 私密记录，只在你自己电脑上，不会上传到这个公开仓库
  details.js        作品名称、学生名单、指导教师排名、项目经费、学生照片、备注
  materials/        每个竞赛一个文件夹，放证书、申报书、照片等
  photos/           学生照片
```

---

## 零、公开版和本地详细版

| | 别人打开网址 | 你在自己电脑上双击 `index.html` |
|---|---|---|
| 竞赛 | 只显示「第几届 xx 杯 xx 竞赛 · xx 奖」 | 另外显示指导教师排名、作品、学生、材料链接 |
| 学生 | 只显示姓名、层次、年级 | 带照片、论文题目、去向、备注 |
| 简历 / 时间线导出 | 没有入口；直接访问 cv.html 也只显示“仅供本人在本地使用” | 页脚有「导出简历」「导出时间线」 |
| 顶部提示条 | 没有 | 有，并提醒哪些竞赛还没填指导教师排名、哪些私密字段误写进了 `content.js` |

公开网站根本不会去读取 `private/`，所以私密内容不会出现在网页上。

> ⚠ **`content.js`、`photos/`、`files/` 的原文任何人都能在 GitHub 上看到**（仓库是公开的），
> 即使网页上没显示也一样。所以不想公开的内容只能写进 `private/`。

---

## 一、日常更新内容

### 加一条竞赛获奖（两步）

**① 公开部分**：`content.js` 的 `competitions: [` 下面加一行，起一个新的 id：

```js
{ id: 'comp-012', name: '第X届xx杯xx竞赛', award: '全国一等奖', date: '2026-05' },
```

**② 私密部分**：`private/details.js` 的 `competitions: {` 下面加：

```js
'comp-012': {
  advisor: '第二指导教师',
  project: '作品名称',
  students: '张三、李四',
  files: ['private/materials/comp-012/获奖证书.pdf'],
  photos: [],
  note: '',
},
```

材料放进 `private/materials/comp-012/` 文件夹。
忘了第 ② 步也没关系：本地打开主页时，顶部提示条会列出“还没有本地记录 / 还没填指导教师排名”的竞赛。

只想自己留底、完全不公开的比赛，写在 `private/details.js` 的 `extra.competitions` 里，页面上会标「仅本地」。

### 加学生

`content.js` 里只写姓名、层次、年级、状态和 id；照片放 `private/photos/students/`，在 `private/details.js` 的 `students` 里写路径。

### 加照片（公开相册）

1. 把照片放进 `photos/gallery/`（建议先缩小到 2000 像素宽以内，几百 KB 即可）
2. 在 `content.js` 的 `gallery: [` 里加一行：
   ```js
   { src: 'photos/gallery/照片文件名.jpg', caption: '照片说明' },
   ```

### 加科研项目

`content.js` 的 `projects: [` 里复制示例那条，填好后删掉 `hide: true`：

```js
{
  id: 'proj-002',
  title: '项目名称',
  source: '浙江省自然科学基金',
  number: 'LQ2xFxxxxx',
  years: '2024 – 2026',
  role: '主持',          // 或 参与（排名第2）
  status: '在研',
},
```

经费、任务书、结题报告这类不想公开的，记在 `private/details.js` 的 `projects` 里：

```js
'proj-002': { budget: '10 万元', files: ['private/materials/proj-002/任务书.pdf'], note: '' },
```

### 加论文 / 专利 / 荣誉

找到 `papers` / `patents` / `honors`，复制一条改内容。PDF 放进 `files/`，填 `pdf: 'files/xxx.pdf'`。

### 换风格

`content.js` 顶部的 `theme`：`'stone'` 石灰（当前）/ `'warm'` 暖木 / `'white'` 白墙。
想微调颜色，改对应的 `assets/theme-stone.css` 顶部 `:root` 里的几个颜色值。

### 隐藏某一条、某一栏

- 某一条暂时不显示：在条目里加 `hide: true`（注意：原文仍在公开仓库里）
- 整个栏目不要了：在 `sections: [...]` 里删掉那一行；调整行的顺序就是调整页面顺序

### 本地预览

直接双击 `index.html` 用浏览器打开即可，改完刷新就能看到。
如果页面一片空白，多半是 `content.js` 或 `private/details.js` 里少了逗号或引号——按 F12 看“控制台”，会提示第几行出错。

### 导出简历 / 时间线（只在本地）

本地打开主页，点页脚的「导出简历」或「导出时间线」：

- **含作品与学生**：勾选后，简历里的竞赛会附上作品名称和学生名单（默认不含）
- **打印 / 存为 PDF**：在打印窗口里“目标打印机”选“另存为 PDF”
- **下载 Word**：得到 `.doc` 文件，可用 Word / WPS 打开继续编辑
- **下载 Markdown**：纯文本格式

指导教师排名填了的话，会自动写进简历，例如“（第二指导教师）”。

---

## 二、本地改好 → 网站自动同步；多台电脑同步

推荐用 **GitHub Desktop**（免费，<https://desktop.github.com>），管理两个仓库：

| 仓库 | 公开/私有 | 放在哪里 | 内容 |
|---|---|---|---|
| `wechyu88.github.io` | 公开 | 例如 `文档/wechyu88.github.io/` | 网站本身 |
| `homepage-private`（自己建） | **私有** | 放在上面文件夹里面，名字叫 `private` | 私密记录和材料 |

公开仓库的 `.gitignore` 已经写好忽略 `private/`，两个仓库互不干扰。

**第一次设置（一台电脑做一次）**

1. GitHub Desktop → File → Clone repository → 选 `wechyu88.github.io` → 选一个本地位置
2. 把 `private` 文件夹放进克隆下来的 `wechyu88.github.io` 文件夹里
3. GitHub Desktop → File → Add local repository → 选这个 `private` 文件夹 →
   提示“不是仓库”时点 create a repository → 然后点 Publish repository，**勾选 Keep this code private**

**另一台电脑**

1. Clone `wechyu88.github.io`
2. 再 Clone `homepage-private`，本地路径选到 `wechyu88.github.io/private`

**日常**

改完后在 GitHub Desktop 左上角切换到对应仓库 → 写一句说明 → Commit → Push。
在另一台电脑上先点 Fetch / Pull 拿到最新内容再改。

- 只改了公开内容：Push `wechyu88.github.io`，网站约 1–2 分钟后更新
- 只改了私密记录：Push `homepage-private`，网站不受影响
- 只是偶尔改一两处公开内容，也可以直接在 GitHub 网页上编辑 `content.js`

> 私密材料体积很大（视频、几百 MB 的文件）时，私有仓库不合适（单个文件上限 100 MB），
> 这类文件可以放网盘，在 `details.js` 的 `note` 里记一下位置。

---

## 三、部署到国内更容易访问的地址

网站是纯静态文件，下面任何平台都能直接用，**构建命令留空、输出目录填 `/`（或留空）** 即可。
可以同时部署多个，它们都从同一个 GitHub 仓库自动同步。

### 方案 A：腾讯 EdgeOne Pages（国内访问首选）

1. 打开 <https://edgeone.ai/pages>（国际站）或腾讯云控制台中的 EdgeOne Pages，用 GitHub 登录
2. 新建项目 → 导入 Git 仓库 → 选择 `wechyu88.github.io`
3. 框架预设选“无 / Other”，构建命令留空，输出目录 `./`
4. 部署后会得到一个免费域名；之后每次 push 自动重新部署

> 加速区域选“全球（不含中国大陆）”不需要备案，国内一般也比 github.io 快；
> 选“含中国大陆”速度最好，但绑定自定义域名需要 ICP 备案。

### 方案 B：Cloudflare Pages

1. 登录 <https://dash.cloudflare.com> → Workers & Pages → Create → Pages → Connect to Git
2. 选择仓库，Framework preset 选 **None**，Build command 留空，Build output directory 填 `/`
3. 部署后得到 `xxx.pages.dev` 地址；之后每次 push 自动重新部署

> 注意：`*.pages.dev` 默认域名在国内时好时坏，**建议绑定一个自己的域名**（几十元/年）
> 才比较稳定。Cloudflare 免费版在国内没有节点，速度一般。

### 方案 C：GitHub Pages（现有）

仓库名是 `wechyu88.github.io`，合并到 `master` 后 <https://wechyu88.github.io> 自动更新，无需额外操作。

### 更稳定的选择

- **学校教师主页**：很多高校为教师提供个人主页空间，可询问学院/网络中心，把整个文件夹上传即可
- **自己的域名 + 备案 + 国内云**（阿里云 OSS / 腾讯云 COS 静态网站）：国内速度最好，但需要备案
