---
layout: default
title: 随笔
permalink: /zh/thoughts/
lang: zh
summary: "关于技术、工作与生活的思考。"
---
<header class="page-head">
  <h1>随笔</h1>
  <p>关于技术、工作与生活的想法和记录。</p>
</header>

{% assign items = site.thoughts | where_exp: 'item', 'item.lang == "zh"' | sort: 'date' | reverse %}
<ul class="entry-list">
  {% for item in items %}
  <li class="entry">
    <a class="entry-title" href="{{ item.url | relative_url }}">{{ item.title }}</a>
    {% if item.summary %}<p class="entry-summary">{{ item.summary }}</p>{% endif %}
    <div class="entry-meta">
      {% if item.date %}<span class="entry-date">{{ item.date | date: "%Y-%m-%d" }}</span>{% endif %}
      {% if item.tags %}{% for t in item.tags %}<span class="tag">{{ t }}</span>{% endfor %}{% endif %}
    </div>
  </li>
  {% endfor %}
</ul>
{% if items.size == 0 %}<p class="empty">这里还没有内容。</p>{% endif %}
