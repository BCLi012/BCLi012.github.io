# 架构说明

面向想理解或接手这个站点的人。日常操作见 [MAINTENANCE.md](MAINTENANCE.md)。

---

## 一、总体：三层，零服务端

```
  内容层        Markdown 文章 + YAML 数据文件
                 ↓
  模板层        Liquid 模板（2 个布局 + 5 个组件）
                 ↓  Jekyll 构建（GitHub Pages 服务器上自动执行）
  静态层        HTML + 1 个 CSS 文件 + 4KB 原生 JS
                 ↓
  访客          GitHub 全球 CDN 直接返回静态文件
```

**关键特征**：没有服务器、没有数据库、没有后台、没有构建产物入库。全站只有一个 CSS 文件和一个自托管的 4KB JS 库（仅用于搜索）。所有交互——明暗主题、搜索、名言轮播、阅读进度条、回到顶部——都是浏览器端原生 JavaScript，**没有引入任何前端框架**。

---

## 二、目录职责

```
BcLee012.github.io/
│
├── _config.yml            ← 全局配置：站点名（中英两套）、描述、头像路径、集合定义
├── README.md              ← 站点自我介绍
├── MAINTENANCE.md         ← 维护指南
├── ARCHITECTURE.md        ← 本文档
│
├── index.md  about.md  contact.md                        ← 英文版单页
├── projects.md research.md arts.md sports.md thoughts.md ← 5 个栏目列表页
├── zh/                                                   ← 中文版单页（与上面一一对应）
│
├── _research/ _projects/ _arts/ _sports/ _thoughts/      ← 内容文章，每栏目一目录
├── _news/                 ← 首页 News 短公告（output: false，不生成独立页面）
│
├── _data/                 ← 结构化数据，全站单一数据源
│   ├── education.yml      ←   教育背景
│   ├── quotes.yml         ←   页脚名言库
│   ├── socials.yml        ←   社交链接（平台名、图标键、地址）
│   └── social_icons.yml   ←   各平台图标矢量路径（独立成文件，便于隔离长 SVG 串）
│
├── _layouts/              ← 页面骨架
│   ├── default.html       ←   全站骨架，最核心的文件
│   └── post.html          ←   文章骨架（front matter 声明继承 default）
│
├── _includes/             ← 可复用组件
│   ├── entry-table.html   ←   日期左对齐列表（项目/研究/随笔/动态共用）
│   ├── education-table.html
│   ├── quote-rotator.html ←   页脚名言轮播
│   ├── link-buttons.html  ←   图标按钮行（联系页/关于页共用）
│   └── ink-divider.html   ←   水墨分隔线
│
├── assets/
│   ├── css/styles.css     ← 全部样式 + 配色令牌（唯一样式文件）
│   ├── images/profile.jpg ← 头像
│   ├── favicon.svg
│   └── vendor/            ← 自托管的搜索库
│
├── 404.html               ← 404 页面
├── robots.txt
├── sitemap.xml            ← 由 Liquid 生成，列全部页面与文章
├── search-en.json         ← 构建时生成的搜索索引（英文）
└── search-zh.json         ← 搜索索引（中文）
```

---

## 三、页面如何拼装

以一篇随笔为例：

```
_thoughts/tech-attention.md（内容 + front matter 元数据）
      ↓  front matter 未写 layout，由 _config.yml 的 defaults 指定为 post
_layouts/post.html（文章骨架：大标题 + 日期 + 标签 + 正文 + 返回栏目链接）
      ↓  它声明 layout: default，于是套进
_layouts/default.html（全站骨架）
      ↓  内部引用组件
   {% include entry-table.html %} 等
      ↓  Jekyll 生成
   /thoughts/tech-attention/index.html（纯静态 HTML）
```

`default.html` 承担全站公共部分：

| 区域 | 内容 |
|---|---|
| `<head>` | 标题、描述、OG 分享信息、theme-color、favicon、CSS（带构建版本号）、**防闪烁脚本** |
| 顶部导航 | 导航链接、搜索图标、语言切换、主题切换、阅读进度条 |
| 页脚 | 名言轮播、版权与署名 |
| 页面末尾 | 回到顶部按钮 + 全部交互脚本 |

`<head>` 里那段内联 JS 在页面渲染前读 `localStorage` 决定是否加 `data-theme="dark"`，否则深色模式用户每次刷新会先闪一下白屏。

**注意**：布局顶部（`<head>` 之前）有一整块按语言赋值的变量声明。所有语言相关变量必须在那里赋值——早前放在 `<body>` 里，导致 `<title>` 渲染为空。

---

## 四、内容模型的三种形态

1. **集合（Collections）**——有独立页面的：`research` / `projects` / `arts` / `sports` / `thoughts`；`news` 为 `output: false`，只在首页内嵌显示
2. **单页（Pages）**——首页、关于、联系、404，以及 5 个栏目列表页，中英各一套
3. **数据文件（Data）**——教育背景、名言、社交链接等"会在多处出现或被反复编辑"的信息，抽成 YAML 单一数据源

第 3 条是刻意的架构决策：曾出现过社交链接在首页和关于页各写一份、新增平台时漏改一处的情况。

---

## 五、双语系统

- **路径规则**：英文在主路径（`/about/`），中文统一加 `/zh/` 前缀（`/zh/about/`），由各文件 front matter 的 `permalink` 显式声明
- **归属标记**：每个文件声明 `lang: en` 或 `lang: zh`
- **布局按语言切换**：`default.html` 顶部的变量块按 `page.lang` 一次性决定站点名、描述、导航文案、搜索占位符、搜索索引文件，以及站内链接前缀变量 `base`
- **列表自动过滤**：`where_exp` 按 lang 过滤，中英文列表互不混入
- **搜索索引分语言**：构建时生成 `search-en.json` / `search-zh.json`
- **切换按钮**：英文页 → `/zh` + 当前路径；中文页 → 去掉 `/zh`。路径规则可逆，因此文章页也能精确切到对应译文

---

## 六、样式与配色系统

`styles.css` 顶部是设计令牌（CSS 变量），日间在 `:root`，夜间在 `html[data-theme="dark"]`：

```css
:root { --bg: #faf9f8; --text: #1a1a1a; --border: …; }
html[data-theme="dark"] { --bg: #121211; --text: #f2f1ef; … }
```

下方所有组件只引用变量、不写死颜色。换配色只改顶部十余行，全站（含搜索面板、图标按钮、进度条）自动跟随。主题切换即给 `<html>` 加/去 `data-theme` 属性。

配色为暖中性灰阶（纸白 / 炭灰），刻意不使用彩色；层级由字重、字号、字距承担。

---

## 七、构建与部署

```
本地编辑 → git commit → git push
    ↓  GitHub Pages 检测到 main 分支更新，用 Jekyll 构建（约 1 分钟）
静态文件 → GitHub 全球 CDN
```

两个与"看不到更新"有关的机制：

- **CSS 带版本号**（`styles.css?v=<构建时间戳>`）：每次构建生成新地址，保证新 HTML 一定拿到新样式
- **HTML 约 10 分钟缓存**：推送后需强刷（`Cmd + Shift + R`）

---

## 八、规模与取舍

| 项目 | 数量 |
|---|---|
| 布局 | 2 |
| 组件 | 5 |
| 数据文件 | 4 |
| 内容文件 | 约 30（含中英对照） |
| 样式 | 1 个文件，约 700 行 |
| JavaScript | 4KB 库 + 约 130 行自写逻辑 |
| 前端依赖 | 0（除 Jekyll 本身） |

**取舍**：

- **优势**：快、零维护、无安全面（没有可被拖库或入侵的服务端），GitHub 免费托管
- **代价一**：没有后台，发文靠编辑文件，没有可视化编辑器
- **代价二**：搜索只索引标题与摘要，不搜正文——纯静态的固有限制
- **代价三**：双语要维护两份文件，中文版必须正确填写 `permalink`
