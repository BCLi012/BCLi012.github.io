---
layout: default
title: 艺术
permalink: /zh/arts/
lang: zh
summary: "摄影、电影笔记与评论。"
---
<header class="page-head">
  <h1>艺术</h1>
  <p>摄影、电影笔记、评论，以及其他创作。</p>
</header>

{% assign items = site.arts | where_exp: 'item', 'item.lang == "zh"' | sort: 'date' | reverse %}
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
