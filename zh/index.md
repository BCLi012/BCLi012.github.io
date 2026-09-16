---
layout: default
title: 首页
permalink: /zh/
lang: zh
---
<section class="hero">
  <p class="hero-eyebrow">个人网站</p>
  <h1>{{ site.title }}</h1>
  <p class="hero-tagline">项目、研究、艺术与户外——这里是我的自留地。</p>
  <div class="hero-links">
    <a class="button" href="{{ '/zh/about/' | relative_url }}">关于我</a>
    <a class="button button-ghost" href="{{ '/zh/projects/' | relative_url }}">看看项目</a>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <h2>项目</h2>
    <a class="see-all" href="{{ '/zh/projects/' | relative_url }}">全部 →</a>
  </div>
  {% assign items = site.projects | where_exp: 'item', 'item.lang == "zh"' | sort: 'date' | reverse %}
  <ul class="card-list">
    {% for p in items limit:3 %}
      <li class="card">
        <a href="{{ p.url | relative_url }}">
          <h4>{{ p.title }}</h4>
          <p>{{ p.summary }}</p>
        </a>
      </li>
    {% endfor %}
  </ul>
</section>

<section class="section">
  <div class="section-head">
    <h2>研究</h2>
    <a class="see-all" href="{{ '/zh/research/' | relative_url }}">全部 →</a>
  </div>
  {% assign items = site.research | where_exp: 'item', 'item.lang == "zh"' | sort: 'date' | reverse %}
  <ul class="card-list">
    {% for r in items limit:2 %}
      <li class="card">
        <a href="{{ r.url | relative_url }}">
          <h4>{{ r.title }}</h4>
          <p>{{ r.summary }}</p>
        </a>
      </li>
    {% endfor %}
  </ul>
</section>

<section class="section">
  <div class="section-head">
    <h2>随笔</h2>
    <a class="see-all" href="{{ '/zh/thoughts/' | relative_url }}">全部 →</a>
  </div>
  {% assign items = site.thoughts | where_exp: 'item', 'item.lang == "zh"' | sort: 'date' | reverse %}
  <ul class="journal-list">
    {% for t in items limit:4 %}
      <li>
        <a href="{{ t.url | relative_url }}">{{ t.title }}</a>
        <time datetime="{{ t.date | date_to_xmlschema }}">{{ t.date | date: "%Y-%m-%d" }}</time>
      </li>
    {% endfor %}
  </ul>
</section>
