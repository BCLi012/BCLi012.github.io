/* =========================================================
   苹果风个人博客 · 前端应用
   云端能力：数据库（文章）、认证（登录）、存储（图片/附件）
   ========================================================= */

// ---- 云服务配置（来自应用开通时返回的 publicConfig）----
const publicConfig = {
  endpoint: 'https://apple-style-blog.app.workbuddy.link',
  publishableKey: 'wbpk_e9R62fyi7nk2vWwvXL3A8I_U80CQPRLBARxUFw6RFRGmJugPu2KGYRj',
};

const cloud = WorkBuddyCloud.createWorkBuddyCloud({
  endpoint: publicConfig.endpoint,
  publishableKey: publicConfig.publishableKey,
});

// ---- 运行环境 ----
// 云端域名下启用完整云端能力（数据库 / 登录 / 上传）；
// GitHub Pages 与本地预览下改为读取仓库内的 Markdown 文章，保证阅读体验完整。
const CLOUD_MODE = /(^|\.)workbuddy\.link$/.test(location.hostname);
const CLOUD_SITE = 'https://apple-style-blog.app.workbuddy.link/';

// ---- 静态文章仓库（posts/manifest.json + Markdown 文件）----
const staticStore = {
  _manifest: null,
  async manifest() {
    if (!this._manifest) {
      const res = await fetch('posts/manifest.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('文章清单加载失败');
      this._manifest = await res.json();
    }
    return this._manifest;
  },
  async list({ category, tag } = {}) {
    const { posts } = await this.manifest();
    return posts.filter(
      (p) =>
        (!category || p.category === category) &&
        (!tag || (p.tags || []).includes(tag))
    );
  },
  async one(id) {
    const { posts } = await this.manifest();
    const meta = posts.find((p) => String(p.id) === String(id));
    if (!meta) return null;
    const res = await fetch(meta.file, { cache: 'no-cache' });
    const content = res.ok ? await res.text() : '';
    return { ...meta, content, status: 'published', owner_id: 'static' };
  },
};

// ---- 全局状态 ----
let currentUser = null; // { id, email }
const CATEGORIES = ['随笔', '文艺', '技术', '读书', '生活'];

// ---- 小工具 ----
const $ = (sel) => document.querySelector(sel);
const app = $('#app');

function esc(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), ms);
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function excerpt(md = '', n = 90) {
  const text = md.replace(/[#>*`\-\[\]()!_]/g, '').replace(/\s+/g, ' ').trim();
  return text.length > n ? text.slice(0, n) + '…' : text;
}

function setLoading(msg = 'LOADING') {
  app.innerHTML = `<div class="loading">${msg}</div>`;
}

// ---- Markdown 渲染（cloud: 存储路径 → 签名 URL）----
async function renderMarkdown(md) {
  let html = marked.parse(md || '');
  // 收集 cloud: 引用（图片 / 附件链接）
  const paths = new Set();
  const re = /(?:src|href)="(cloud:[^"]+)"/g;
  let m;
  while ((m = re.exec(html))) paths.add(m[1].slice('cloud:'.length));
  if (paths.size && CLOUD_MODE) {
    const signed = await cloud.storage.createSignedUrls([...paths], 3600);
    const map = {};
    if (signed && signed.data) {
      (Array.isArray(signed.data) ? signed.data : [signed.data]).forEach((item, i) => {
        const url = item?.signedUrl || item?.url;
        if (url) map[[...paths][i]] = url;
      });
    }
    html = html.replace(/(src|href)="cloud:([^"]+)"/g, (_, attr, p) => {
      const url = map[p];
      return url ? `${attr}="${url}"` : `${attr}=""`;
    });
  } else if (paths.size) {
    // 静态模式无法访问云端存储，去掉未解析的占位引用
    html = html.replace(/(src|href)="cloud:[^"]*"/g, '');
  }
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}

// ---- 认证辅助 ----
async function refreshUser() {
  if (!CLOUD_MODE) { currentUser = null; renderNavUser(); return; }
  try {
    const { data: session, error } = await cloud.auth.getSession();
    if (error || !session) { currentUser = null; } else {
      const { data: user } = await cloud.auth.getUser();
      currentUser = user?.user || session.user || null;
    }
  } catch { currentUser = null; }
  renderNavUser();
}

function renderNavUser() {
  const navUser = $('#navUser');
  const navLogout = $('#navLogout');
  if (currentUser) {
    const email = currentUser.email || '已登录';
    navUser.textContent = email;
    navUser.title = email;
    navLogout.classList.remove('hidden');
  } else {
    navUser.textContent = '';
    navLogout.classList.add('hidden');
  }
}

$('#navLogout').addEventListener('click', async () => {
  await cloud.auth.signOut();
  currentUser = null;
  renderNavUser();
  toast('已退出登录');
  location.hash = '#/';
  route();
});

// ---- 数据访问 ----
async function fetchPosts({ category, tag, limit } = {}) {
  // 静态模式：读取仓库内的 Markdown 文章清单
  if (!CLOUD_MODE) {
    try {
      const list = await staticStore.list({ category, tag });
      return limit ? list.slice(0, limit) : list;
    } catch (e) {
      toast('文章加载失败：' + e.message);
      return [];
    }
  }
  let q = cloud.database
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  if (category) q = q.eq('category', category);
  if (tag) q = q.contains('tags', [tag]);
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) { console.error(error); toast('文章加载失败：' + error.message); return []; }
  return data || [];
}

async function fetchPost(id) {
  // 静态模式：清单 + 对应 Markdown 文件
  if (!CLOUD_MODE) {
    try {
      return await staticStore.one(id);
    } catch (e) {
      toast('文章加载失败：' + e.message);
      return null;
    }
  }
  const { data, error } = await cloud.database.from('posts').select('*').eq('id', id).maybeSingle();
  if (error) { toast('文章加载失败'); return null; }
  return data;
}

// ---- 渲染：文章卡片 ----
function postCardHtml(p) {
  return `
    <a class="post-card" href="#/post/${p.id}">
      <div class="post-meta">
        <span class="category-badge">${esc(p.category)}</span>
        <span>·</span><span>${fmtDate(p.created_at)}</span>
      </div>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.summary || excerpt(p.content))}</p>
      ${p.tags?.length ? `<div class="post-tags">${p.tags.map((t) => `<span class="tag-chip"># ${esc(t)}</span>`).join('')}</div>` : ''}
    </a>`;
}

// =========================================================
// 路由
// =========================================================
async function route() {
  const hash = location.hash || '#/';
  const parts = hash.slice(2).split('/'); // 去掉 '#/'
  const page = parts[0] || 'home';

  // 导航高亮
  document.querySelectorAll('#navLinks a').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === page || (page === 'post' && a.dataset.nav === 'posts') || (page === 'tag' && a.dataset.nav === 'tags') || (page === 'category' && a.dataset.nav === decodeURIComponent(parts[1] || '')));
  });

  if (page === 'home') return pageHome();
  if (page === 'posts') return pagePosts();
  if (page === 'post') return pagePost(parts[1]);
  if (page === 'category') return pageCategory(decodeURIComponent(parts[1] || ''));
  if (page === 'tags') return pageTags();
  if (page === 'tag') return pageTag(decodeURIComponent(parts[1] || ''));
  if (page === 'about') return pageAbout();
  if (page === 'admin') return pageAdmin();
  return pageHome();
}

window.addEventListener('hashchange', route);

// =========================================================
// 页面：首页
// =========================================================
async function pageHome() {
  setLoading();
  const posts = await fetchPosts({ limit: 6 });
  app.innerHTML = `
    <div class="fade-in">
      <section class="hero">
        <div class="hero-avatar">博</div>
        <h1>你好，我是博主。</h1>
        <p class="hero-sub">开发者 · 写作者 · 生活的观察者</p>
        <p class="hero-gradient">保持简单，保持热爱。</p>
        <p class="hero-bio">
          这里是我的个人角落：写代码，也写文字；记录技术的思考，也收藏生活的诗意。
          相信好的产品和好的文章一样 —— 都源于对简洁与克制的热爱。
        </p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/posts">阅读文章</a>
          <a class="btn btn-ghost" href="#/about">关于我</a>
        </div>
      </section>
      <section class="container-wide">
        <h2 class="section-title">最新文章</h2>
        <p class="section-desc">Recent Posts · 记录想法与生活</p>
        ${posts.length ? `<div class="post-grid">${posts.map(postCardHtml).join('')}</div>` : `<div class="empty"><span class="empty-icon">🍃</span>还没有文章，登录后写下第一篇吧。</div>`}
      </section>
      <section class="container-wide" style="padding-top:0">
        <div class="post-grid">
          <a class="post-card" href="#/category/文艺">
            <div class="post-meta"><span class="category-badge">栏目</span></div>
            <h3>文艺栏目</h3><p>诗歌、书摘与光影 —— 那些让日子变得柔软的文字与瞬间。</p>
          </a>
          <a class="post-card" href="#/category/随笔">
            <div class="post-meta"><span class="category-badge">栏目</span></div>
            <h3>个人随笔</h3><p>不成体系的胡思乱想，和一些认真生活过的证据。</p>
          </a>
          <a class="post-card" href="#/category/技术">
            <div class="post-meta"><span class="category-badge">栏目</span></div>
            <h3>技术文章</h3><p>代码、架构与工程实践 —— 把复杂的事情做简单。</p>
          </a>
        </div>
      </section>
    </div>`;
}

// =========================================================
// 页面：文章列表
// =========================================================
async function pagePosts() {
  setLoading();
  const posts = await fetchPosts();
  app.innerHTML = `
    <div class="container fade-in">
      <h2 class="section-title">全部文章</h2>
      <p class="section-desc">共 ${posts.length} 篇 · 按时间排序</p>
      ${posts.length ? `<div class="post-grid single">${posts.map(postCardHtml).join('')}</div>` : `<div class="empty"><span class="empty-icon">📝</span>暂无文章</div>`}
    </div>`;
}

// =========================================================
// 页面：文章详情
// =========================================================
async function pagePost(id) {
  setLoading();
  const p = await fetchPost(id);
  if (!p) {
    app.innerHTML = `<div class="container fade-in"><div class="empty"><span class="empty-icon">🔍</span>文章不存在或暂未发布</div></div>`;
    return;
  }
  const isOwner = currentUser && currentUser.id === p.owner_id;
  app.innerHTML = `
    <div class="container fade-in">
      <a href="#/posts" style="font-size:13px">← 返回列表</a>
      <article class="article" style="margin-top:16px">
        <header class="article-header">
          <div class="article-meta">
            <a class="category-badge" href="#/category/${encodeURIComponent(p.category)}">${esc(p.category)}</a>
            <span>${fmtDate(p.created_at)}</span>
            ${isOwner ? `<a href="#/admin/edit/${p.id}" style="font-size:12px">编辑</a>` : ''}
          </div>
          <h1>${esc(p.title)}</h1>
          ${p.tags?.length ? `<div class="post-tags">${p.tags.map((t) => `<a class="tag-chip" href="#/tag/${encodeURIComponent(t)}"># ${esc(t)}</a>`).join('')}</div>` : ''}
        </header>
        <div class="markdown" id="mdBody"><div class="loading">渲染中…</div></div>
      </article>
    </div>`;
  const html = await renderMarkdown(p.content || '');
  $('#mdBody').innerHTML = html;
  $('#mdBody').querySelectorAll('a[href^="http"]').forEach((a) => { a.target = '_blank'; a.rel = 'noopener'; });
}

// =========================================================
// 页面：分类（文艺栏目 / 个人随笔 / …）
// =========================================================
const CATEGORY_DESC = {
  '文艺': '诗歌、书摘与光影 —— 那些让日子变得柔软的文字与瞬间。',
  '随笔': '不成体系的胡思乱想，和一些认真生活过的证据。',
  '技术': '代码、架构与工程实践 —— 把复杂的事情做简单。',
  '读书': '读过的书，和书里留下的划线。',
  '生活': '吃饭、走路、看云 —— 生活的碎屑也值得被记录。',
};

async function pageCategory(cat) {
  setLoading();
  const posts = await fetchPosts({ category: cat });
  app.innerHTML = `
    <div class="container fade-in">
      <h2 class="section-title">${esc(cat)}</h2>
      <p class="section-desc">${esc(CATEGORY_DESC[cat] || '这个分类下的所有文章。')} · 共 ${posts.length} 篇</p>
      ${posts.length ? `<div class="post-grid single">${posts.map(postCardHtml).join('')}</div>` : `<div class="empty"><span class="empty-icon">🌿</span>这个栏目还没有文章</div>`}
    </div>`;
}

// =========================================================
// 页面：标签
// =========================================================
async function pageTags() {
  setLoading();
  const posts = await fetchPosts();
  const counts = {};
  posts.forEach((p) => (p.tags || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
  const tags = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  app.innerHTML = `
    <div class="container fade-in">
      <h2 class="section-title">标签</h2>
      <p class="section-desc">共 ${tags.length} 个标签</p>
      ${tags.length ? `<div class="tag-cloud">${tags.map(([t, c]) => `<a href="#/tag/${encodeURIComponent(t)}">${esc(t)}<span class="tag-count">${c}</span></a>`).join('')}</div>` : `<div class="empty"><span class="empty-icon">🏷️</span>还没有标签</div>`}
    </div>`;
}

async function pageTag(tag) {
  setLoading();
  const posts = await fetchPosts({ tag });
  app.innerHTML = `
    <div class="container fade-in">
      <h2 class="section-title"># ${esc(tag)}</h2>
      <p class="section-desc">标签下的文章 · 共 ${posts.length} 篇</p>
      ${posts.length ? `<div class="post-grid single">${posts.map(postCardHtml).join('')}</div>` : `<div class="empty"><span class="empty-icon">🏷️</span>该标签下暂无文章</div>`}
    </div>`;
}

// =========================================================
// 页面：关于
// =========================================================
function pageAbout() {
  app.innerHTML = `
    <div class="container fade-in">
      <div class="about-card">
        <h2>关于我</h2>
        <p>你好，欢迎来到我的博客。我是一名开发者，白天写代码，晚上写字。</p>
        <p>这个站点像一台 Mac —— 安静、克制、把注意力留给内容本身。我会在这里记录技术思考、读书笔记，也会在「文艺栏目」里存放一些诗歌与光影，在「个人随笔」里留下生活的注脚。</p>
        <h2>关于本站</h2>
        <ul class="about-list">
          <li><strong>主题风格</strong><span>苹果风 · 极简 · 毛玻璃</span></li>
          <li><strong>文章存储</strong><span>WorkBuddy 云数据库</span></li>
          <li><strong>图片附件</strong><span>WorkBuddy 云存储</span></li>
          <li><strong>账号体系</strong><span>邮箱登录 / 注册</span></li>
          <li><strong>内容格式</strong><span>Markdown</span></li>
        </ul>
        <h2>联系我</h2>
        <p>如果你对某篇文章有想法，欢迎交流。邮件是最好的方式 —— 我会认真读每一封。</p>
      </div>
    </div>`;
}

// =========================================================
// 页面：后台（登录 / 注册 / 我的文章 / 编辑器）
// =========================================================
async function pageAdmin() {
  // 静态托管（GitHub Pages）下没有云端鉴权，写作后台只在云端站点可用
  if (!CLOUD_MODE) return pageStaticNotice();
  await refreshUser();
  const hash = location.hash || '#/admin';
  if (hash.startsWith('#/admin/edit')) return pageEditor(hash.split('/')[3]);
  if (hash.startsWith('#/admin/new')) return pageEditor();
  if (!currentUser) return pageLogin();
  return pageDashboard();
}

// ---- 静态托管模式说明 ----
function pageStaticNotice() {
  app.innerHTML = `
    <div class="auth-wrap fade-in">
      <div class="auth-card">
        <h2>写作后台在云端站点</h2>
        <p class="auth-sub">当前页面由 GitHub Pages 静态托管</p>
        <p style="color:var(--text-2);font-size:14px;line-height:1.8">
          这里展示的文章来自仓库中的 Markdown 文件，浏览完全可用。
          但登录、发布文章、上传图片需要云端鉴权，而云端服务只对已登记的站点域名开放，
          因此这些功能请在云端站点使用。
        </p>
        <a class="btn btn-primary" href="${CLOUD_SITE}" style="width:100%;text-align:center;margin-top:22px">前往云端站点写作</a>
        <div class="auth-switch"><a href="#/posts">← 返回文章列表</a></div>
      </div>
    </div>`;
}

// ---- 登录 / 注册 ----
function pageLogin() {
  app.innerHTML = `
    <div class="auth-wrap fade-in">
      <div class="auth-card">
        <h2>欢迎回来</h2>
        <p class="auth-sub">登录以管理你的博客</p>
        <div class="auth-tabs">
          <button id="tabLogin" class="active">登录</button>
          <button id="tabSignup">注册</button>
        </div>

        <div id="loginPane">
          <div class="auth-tabs" style="margin-bottom:18px">
            <button id="tabPwd" class="active">密码登录</button>
            <button id="tabOtp">邮箱验证码</button>
          </div>

          <div id="pwdPane">
            <div class="field"><label>邮箱</label><input id="liEmail" type="email" placeholder="you@example.com" /></div>
            <div class="field"><label>密码</label><input id="liPwd" type="password" placeholder="••••••••" /></div>
            <div class="form-error" id="liErr"></div>
            <button class="btn btn-primary" id="btnPwdLogin" style="width:100%">登录</button>
            <div class="auth-switch"><a href="#" id="linkForgot">忘记密码？</a></div>
          </div>

          <div id="otpPane" class="hidden">
            <div class="field"><label>邮箱</label><input id="loEmail" type="email" placeholder="you@example.com" /></div>
            <div class="field"><label>验证码</label><input id="loCode" inputmode="numeric" placeholder="6 位验证码" /></div>
            <div class="form-error" id="loErr"></div>
            <button class="btn btn-primary" id="btnOtpSend" style="width:100%">发送验证码</button>
            <button class="btn btn-ghost" id="btnOtpLogin" style="width:100%;margin-top:10px">验证并登录</button>
          </div>
        </div>

        <div id="signupPane" class="hidden">
          <div class="field"><label>邮箱</label><input id="suEmail" type="email" placeholder="you@example.com" /></div>
          <div class="field"><label>邮箱验证码</label>
            <div style="display:flex;gap:10px">
              <input id="suCode" inputmode="numeric" placeholder="6 位验证码" style="flex:1" />
              <button class="btn btn-ghost btn-sm" id="btnSuSend">发送</button>
            </div>
          </div>
          <div class="field"><label>设置密码</label><input id="suPwd" type="password" placeholder="至少 6 位" /></div>
          <div class="form-error" id="suErr"></div>
          <button class="btn btn-primary" id="btnSignup" style="width:100%">注册</button>
        </div>

        <div id="forgotPane" class="hidden">
          <div class="field"><label>邮箱</label><input id="fpEmail" type="email" placeholder="you@example.com" /></div>
          <div class="field"><label>重置码（发送到邮箱）</label><input id="fpCode" inputmode="numeric" placeholder="6 位验证码" /></div>
          <div class="field"><label>新密码</label><input id="fpPwd" type="password" placeholder="新密码" /></div>
          <div class="form-error" id="fpErr"></div>
          <button class="btn btn-primary" id="btnForgotSend" style="width:100%">发送重置码</button>
          <button class="btn btn-ghost" id="btnForgotReset" style="width:100%;margin-top:10px">重置密码</button>
          <div class="auth-switch"><a href="#" id="linkBackLogin">返回登录</a></div>
        </div>
      </div>
    </div>`;

  const show = (id) => ['loginPane', 'signupPane', 'forgotPane'].forEach((p) => $('#' + p).classList.toggle('hidden', p !== id));
  $('#tabLogin').onclick = () => { show('loginPane'); $('#tabLogin').classList.add('active'); $('#tabSignup').classList.remove('active'); };
  $('#tabSignup').onclick = () => { show('signupPane'); $('#tabSignup').classList.add('active'); $('#tabLogin').classList.remove('active'); };
  $('#linkForgot').onclick = (e) => { e.preventDefault(); show('forgotPane'); };
  $('#linkBackLogin').onclick = (e) => { e.preventDefault(); show('loginPane'); };

  const showLoginMode = (otp) => {
    $('#pwdPane').classList.toggle('hidden', otp);
    $('#otpPane').classList.toggle('hidden', !otp);
    $('#tabPwd').classList.toggle('active', !otp);
    $('#tabOtp').classList.toggle('active', otp);
  };
  $('#tabPwd').onclick = () => showLoginMode(false);
  $('#tabOtp').onclick = () => showLoginMode(true);

  // 密码登录
  $('#btnPwdLogin').onclick = async () => {
    const err = $('#liErr'); err.textContent = '';
    const { error } = await cloud.auth.signInWithPassword({ email: $('#liEmail').value.trim(), password: $('#liPwd').value });
    if (error) { err.textContent = '邮箱或密码不正确，请重试'; return; }
    await refreshUser(); toast('登录成功，欢迎回来'); route();
  };

  // OTP 登录
  let otpFlow = null;
  $('#btnOtpSend').onclick = async () => {
    const err = $('#loErr'); err.textContent = '';
    const started = await cloud.auth.signInWithOtp({ email: $('#loEmail').value.trim() });
    if (started.error) { err.textContent = '验证码发送失败，请检查邮箱后重试'; return; }
    otpFlow = started.data;
    toast('验证码已发送，请查收邮箱');
  };
  $('#btnOtpLogin').onclick = async () => {
    const err = $('#loErr'); err.textContent = '';
    if (!otpFlow) { err.textContent = '请先发送验证码'; return; }
    const completed = await otpFlow.verify({ token: $('#loCode').value.trim() });
    if (completed.error) { err.textContent = '验证码不正确或已过期'; return; }
    await refreshUser(); toast('登录成功'); route();
  };

  // 注册（邮箱验证 + 设置密码）
  let suFlow = null;
  $('#btnSuSend').onclick = async () => {
    const err = $('#suErr'); err.textContent = '';
    const sent = await cloud.auth.sendOtp({ email: $('#suEmail').value.trim() });
    if (sent.error) { err.textContent = '验证码发送失败，请稍后重试'; return; }
    suFlow = sent.data;
    toast('验证码已发送，请查收邮箱');
  };
  $('#btnSignup').onclick = async () => {
    const err = $('#suErr'); err.textContent = '';
    const pwd = $('#suPwd').value;
    if (!suFlow) { err.textContent = '请先获取邮箱验证码'; return; }
    if (pwd.length < 6) { err.textContent = '密码至少 6 位'; return; }
    const completed = await cloud.auth.verifyOtp({
      verificationId: suFlow.verificationId,
      token: $('#suCode').value.trim(),
      email: $('#suEmail').value.trim(),
      isExistingUser: suFlow.isExistingUser,
      password: suFlow.isExistingUser ? undefined : pwd,
    });
    if (completed.error) { err.textContent = suFlow.isExistingUser ? '该邮箱已注册，请直接登录' : '注册失败，请检查验证码后重试'; return; }
    await refreshUser(); toast('注册成功，欢迎加入'); route();
  };

  // 忘记密码
  let fpFlow = null;
  $('#btnForgotSend').onclick = async () => {
    const err = $('#fpErr'); err.textContent = '';
    const started = await cloud.auth.resetPasswordForEmail($('#fpEmail').value.trim());
    if (started.error) { err.textContent = '重置码发送失败，请稍后重试'; return; }
    fpFlow = started.data;
    toast('重置码已发送，请查收邮箱');
  };
  $('#btnForgotReset').onclick = async () => {
    const err = $('#fpErr'); err.textContent = '';
    if (!fpFlow) { err.textContent = '请先发送重置码'; return; }
    const completed = await fpFlow.updateUser({ nonce: $('#fpCode').value.trim(), password: $('#fpPwd').value });
    if (completed.error) { err.textContent = '重置失败，请检查重置码与新密码'; return; }
    await refreshUser(); toast('密码已重置'); route();
  };
}

// ---- 我的文章 ----
async function pageDashboard() {
  setLoading();
  const { data: mine, error } = await cloud.database
    .from('posts')
    .select('*')
    .eq('owner_id', currentUser.id)
    .order('created_at', { ascending: false });
  const list = mine || [];
  app.innerHTML = `
    <div class="container fade-in">
      <div class="dash-head">
        <div>
          <h2 class="section-title" style="margin-bottom:2px">我的文章</h2>
          <p class="section-desc" style="margin-bottom:0">登录身份：${esc(currentUser.email || '')}</p>
        </div>
        <a class="btn btn-primary" href="#/admin/new">＋ 写新文章</a>
      </div>
      ${error ? `<div class="form-error">加载失败：${esc(error.message)}</div>` : ''}
      ${list.length ? list.map((p) => `
        <div class="my-post-item">
          <div>
            <div class="mp-title">${esc(p.title)}</div>
            <div class="mp-meta">${esc(p.category)} · ${fmtDate(p.created_at)} · ${p.status === 'published' ? '已发布' : '草稿'}</div>
          </div>
          <div class="my-post-actions">
            <a class="btn btn-ghost btn-sm" href="#/post/${p.id}">预览</a>
            <a class="btn btn-ghost btn-sm" href="#/admin/edit/${p.id}">编辑</a>
            <button class="btn btn-danger btn-sm" data-del="${p.id}">删除</button>
          </div>
        </div>`).join('') : `<div class="empty"><span class="empty-icon">✍️</span>还没有写过文章，点击右上角开始创作</div>`}
    </div>`;

  app.querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = async () => {
      if (!confirm('确定删除这篇文章吗？删除后不可恢复。')) return;
      const { data } = await cloud.database.from('posts').delete().eq('id', btn.dataset.del).eq('owner_id', currentUser.id).select();
      if (!data || data.length === 0) { toast('删除失败：文章不存在或不属于你'); return; }
      toast('已删除'); pageDashboard();
    };
  });
}

// ---- 编辑器（新建 / 编辑）----
async function pageEditor(id) {
  let post = null;
  if (id) {
    const { data } = await cloud.database.from('posts').select('*').eq('id', id).maybeSingle();
    if (!data || data.owner_id !== currentUser.id) {
      app.innerHTML = `<div class="container fade-in"><div class="empty"><span class="empty-icon">🔒</span>文章不存在或不属于你</div></div>`;
      return;
    }
    post = data;
  }
  app.innerHTML = `
    <div class="editor-wrap fade-in">
      <div class="editor-card">
        <h2 class="section-title">${post ? '编辑文章' : '写新文章'}</h2>
        <p class="section-desc">支持 Markdown · 图片和附件将上传到云端存储</p>
        <div class="field"><label>标题</label><input id="edTitle" value="${esc(post?.title || '')}" placeholder="给文章起个标题" /></div>
        <div class="field-row">
          <div class="field"><label>分类</label>
            <select id="edCat">${CATEGORIES.map((c) => `<option ${post?.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
          </div>
          <div class="field"><label>标签（逗号分隔）</label><input id="edTags" value="${esc((post?.tags || []).join(', '))}" placeholder="例如：生活, 思考" /></div>
        </div>
        <div class="field"><label>摘要（可选）</label><textarea id="edSummary" placeholder="显示在列表页的一句话摘要">${esc(post?.summary || '')}</textarea></div>
        <div class="field">
          <label>正文（Markdown）</label>
          <textarea id="edContent" style="min-height:320px;font-family:'SF Mono',ui-monospace,Menlo,monospace;font-size:13.5px" placeholder="# 标题&#10;正文支持 Markdown 语法…">${esc(post?.content || '')}</textarea>
          <div class="editor-toolbar">
            <button class="btn btn-ghost btn-sm" id="btnUpImg">🖼 插入图片</button>
            <button class="btn btn-ghost btn-sm" id="btnUpFile">📎 上传附件</button>
            <input type="file" id="fileImg" accept="image/*" class="hidden" />
            <input type="file" id="fileAtt" class="hidden" />
            <span class="attach-list" id="upState"></span>
          </div>
        </div>
        <div class="form-error" id="edErr"></div>
        <div style="display:flex;gap:12px">
          <button class="btn btn-primary" id="btnSave">发布文章</button>
          <a class="btn btn-ghost" href="#/admin">返回</a>
        </div>
      </div>
    </div>`;

  // 上传到云存储（shared 空间，登录用户可读）
  async function uploadToCloud(file, kind) {
    if (!file) return null;
    if (file.size > 20 * 1024 * 1024) { toast('文件不能超过 20MB'); return null; }
    $('#upState').textContent = `正在上传 ${file.name} …`;
    const ext = (file.name.split('.').pop() || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || (kind === 'img' ? 'png' : 'bin');
    const path = cloud.storage.sharedPath(currentUser.id, `${kind}s/${crypto.randomUUID()}.${ext}`);
    const result = await cloud.storage.upload(path, file, { contentType: file.type || 'application/octet-stream' });
    if (result.error) { $('#upState').textContent = ''; toast('上传失败：' + result.error.message); return null; }
    $('#upState').textContent = `已上传：${file.name}`;
    return path;
  }

  function insertAtCursor(textarea, snippet) {
    const s = textarea.selectionStart ?? textarea.value.length;
    const e = textarea.selectionEnd ?? s;
    textarea.value = textarea.value.slice(0, s) + snippet + textarea.value.slice(e);
    textarea.dispatchEvent(new Event('input'));
  }

  $('#btnUpImg').onclick = () => $('#fileImg').click();
  $('#btnUpFile').onclick = () => $('#fileAtt').click();
  $('#fileImg').onchange = async (e) => {
    const path = await uploadToCloud(e.target.files[0], 'img');
    if (path) insertAtCursor($('#edContent'), `\n![${e.target.files[0].name}](cloud:${path})\n`);
    e.target.value = '';
  };
  $('#fileAtt').onchange = async (e) => {
    const f = e.target.files[0];
    const path = await uploadToCloud(f, 'file');
    if (path) insertAtCursor($('#edContent'), `\n[📎 ${f.name}](cloud:${path})\n`);
    e.target.value = '';
  };

  $('#btnSave').onclick = async () => {
    const err = $('#edErr'); err.textContent = '';
    const title = $('#edTitle').value.trim();
    const content = $('#edContent').value;
    if (!title) { err.textContent = '请填写标题'; return; }
    if (!content.trim()) { err.textContent = '请填写正文内容'; return; }
    const tags = $('#edTags').value.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
    const payload = {
      title,
      content,
      summary: $('#edSummary').value.trim() || excerpt(content),
      category: $('#edCat').value,
      tags,
      status: 'published',
      owner_name: (currentUser.email || '博主').split('@')[0],
      updated_at: new Date().toISOString(),
    };
    if (post) {
      const { data, error } = await cloud.database.from('posts').update(payload).eq('id', post.id).eq('owner_id', currentUser.id).select();
      if (error || !data || data.length === 0) { err.textContent = '保存失败：文章可能不属于当前账号'; return; }
      toast('已保存'); location.hash = `#/post/${post.id}`;
    } else {
      const { data, error } = await cloud.database.from('posts').insert(payload).select();
      if (error) { err.textContent = '发布失败：' + (error.message || '请确认已登录'); return; }
      toast('发布成功');
      location.hash = `#/post/${data[0].id}`;
    }
  };
}

// =========================================================
// 启动
// =========================================================
(async function init() {
  marked.setOptions({ breaks: true, gfm: true });
  await refreshUser();
  route();
})();
