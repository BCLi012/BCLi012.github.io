# bruceli012.github.io

个人网站：供应链运营研究、项目与随笔。纯静态站点，由 Jekyll 构建、GitHub Pages 托管——**没有数据库、没有服务器、没有后台**。

线上地址：https://bclee012.github.io/ （中文版 https://bclee012.github.io/zh/）

---

## 一、这个网站是怎么运作的

```
本地文件（Markdown / HTML / CSS）
        ↓  git push
   GitHub 仓库（main 分支）
        ↓  GitHub Pages 自动构建（约 1 分钟）
   线上网站
```

改任何内容都只是改文件，推送到 GitHub 后会自动重新构建。不需要 FTP、不需要部署脚本。

**注意**：GitHub Pages 会给每个页面约 10 分钟的缓存。推送后如果没看到变化，用 `Cmd + Shift + R` 强制刷新，或开无痕窗口确认。

---

## 二、三种修改方式

### 方式 A：直接在 GitHub 网页上改（最简单，适合改文字）

1. 打开 https://github.com/BcLee012/BcLee012.github.io
2. 点进要改的文件 → 右上角铅笔图标 → 编辑
3. 拉到最下面点 **Commit changes**
4. 等约 1 分钟，刷新网站

适合：改简介、加一篇文章、改名言、改教育背景。不适合：调样式（改 CSS 容易出错）。

### 方式 B：在本地改（适合调样式、批量修改）

本地副本在 `~/Documents/github/BcLee012.github.io`。改完后：

```bash
cd ~/Documents/github/BcLee012.github.io
git add -A
git commit -m "说明这次改了什么"
git push
```

如果 push 时报 `Failed to connect to 127.0.0.1 port 7897`，是本地代理没开，临时绕过：

```bash
git -c http.proxy= -c https.proxy= push
```

### 方式 C：让我改

直接说需求即可，比如"把首页简介改成…"、"给 Sports 加一篇文章"、"页脚再紧凑一点"。

---

## 三、文件结构地图

| 位置 | 作用 |
|---|---|
| `_config.yml` | 站点名、描述、头像路径等全局配置 |
| `index.md` / `zh/index.md` | 首页（英文 / 中文） |
| `about.md` / `zh/about.md` | 关于页 |
| `contact.md` / `zh/contact.md` | 联系页 |
| `projects.md`、`research.md`、`arts.md`、`sports.md`、`thoughts.md` | 各栏目**列表页**（一般不用改） |
| `zh/` 目录 | 中文版页面（与英文版一一对应） |
| `_research/` `_projects/` `_arts/` `_sports/` `_thoughts/` | **内容文章**，每个栏目一个目录 |
| `_news/` | 首页 News 区块的短公告 |
| `_data/` | 结构化数据（教育背景、名言、社交链接） |
| `_layouts/` | 页面骨架（改结构才需要动） |
| `_includes/` | 可复用组件（列表、题词、社交按钮） |
| `assets/css/styles.css` | 全部样式与配色（顶部是设计令牌） |
| `assets/images/profile.jpg` | 首页头像 |

---

## 四、常见操作

### 加一篇文章（以随笔为例）

新建 `_thoughts/my-post.md`（英文）和 `_thoughts/my-post-zh.md`（中文）：

```yaml
---
title: "文章标题"
date: 2026-01-20
tags: [随笔, 思考]
summary: "一句话摘要，会显示在列表和搜索里。"
lang: en                    # 中文文件写 lang: zh
---
正文用 Markdown 写。
```

中文文件还需要加一行 `permalink: /zh/thoughts/my-post/`（把 `thoughts` 换成对应栏目名）。

`_research/`、`_projects/`、`_arts/`、`_sports/` 的写法完全一样，只是目录不同。

### 加一条首页动态

新建 `_news/2026-01-20-something.md`：

```yaml
---
date: 2026-01-20
lang: en
title: "公告一句话。"
link: "/projects/xxx/"      # 可选，不写就是纯文字
---
```

中文版 `_news/2026-01-20-something-zh.md` 写 `lang: zh`，`link` 加 `/zh` 前缀。

### 改教育背景

编辑 `_data/education.yml`：

```yaml
- period: "2022 — present"
  period_zh: "2022 — 至今"
  en: "Logistics Management — Supply Chain Operations Experimental Class"
  zh: "物流管理（供应链运营试验班）"
  detail_en: "Wuhan University, School of Economics and Management · GPA 3.87/4"
  detail_zh: "武汉大学 经济与管理学院 · GPA 3.87/4"
```

### 改名言 / 加新名言

编辑 `_data/quotes.yml`，每条按这个格式加：

```yaml
- en: "English quote"
  zh: "中文引文（可省略，省略时中文页显示英文）"
  author: "作者名"
```

### 加社交平台

1. 在 `_data/socials.yml` 加一条：

```yaml
- label: 微博
  icon: weibo          # 对应 _data/social_icons.yml 的键名
  url: "https://weibo.com/你的ID"
```

2. 在 `_data/social_icons.yml` 加图标路径。图标可从 [Simple Icons](https://simpleicons.org) 复制（点开图标 → 复制 SVG 里 `d="…"` 的内容）。

`url` 留空的条目不会显示。

### 换头像

覆盖 `assets/images/profile.jpg` 即可。建议宽度 640px 左右、竖版或正方形。

如果换了横版照片，需要同步改 `assets/css/styles.css` 里 `.profile-photo img` 的 `aspect-ratio`。

### 改站点名 / 描述

`_config.yml`：

```yaml
title: "Bruce Li (Bingcheng Li)"    # 英文页显示
title_zh: "李炳成"                   # 中文页显示
description: "..."                   # 英文 meta 描述
description_zh: "..."                # 中文 meta 描述
```

### 调配色

配色全部集中在 `assets/css/styles.css` **最顶部**的设计令牌里，改了全局生效：

```css
:root {                         /* 日间 */
  --bg: #faf9f8;                /* 页面底色（暖纸白） */
  --text: #1a1a1a;              /* 正文 */
  --text-secondary: #6b6b6b;    /* 次要文字 */
  --border: rgba(60, 50, 40, 0.12);  /* 分隔线 */
}
html[data-theme="dark"] {       /* 夜间，需与日间一一对应 */
  --bg: #121211;
  --text: #f2f1ef;
  /* … */
}
```

导航栏用的是同族半透明表面（`--bg-header`），不是反相色块。

---

## 五、双语规则（最容易出错的地方）

1. **文件名**：中文版在英文版文件名后加 `-zh`，如 `my-post.md` / `my-post-zh.md`
2. **front matter**：中文文件必须写 `lang: zh`
3. **permalink**：中文文件必须写 `permalink: /zh/<栏目>/<文件名去掉 -zh>/`
4. **列表自动过滤**：英文列表只显示 `lang != zh` 的文章，中文列表只显示 `lang: zh` 的文章——所以**只写英文版不会出错**，中文页只是少一篇文章
5. 中英两版的 `date` 建议保持一致

---

## 六、本地预览（可选）

本地装了 Jekyll 就能实时预览，不经过 GitHub 缓存，改完立刻看到效果：

```bash
# 一次性安装（macOS，使用 Homebrew 的 Ruby）
brew install ruby
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
gem install jekyll bundler

# 启动预览
cd ~/Documents/github/BcLee012.github.io
jekyll serve --livereload
# 浏览器打开 http://127.0.0.1:4000
```

改文件后浏览器自动刷新。按 `Ctrl + C` 停止。

---

## 七、常用命令

```bash
cd ~/Documents/github/BcLee012.github.io

git status                 # 看改了哪些文件
git diff                   # 看具体改了什么
git log --oneline -10      # 看最近提交
git pull                   # 拉取远端更新（换设备编辑前先执行）
```
