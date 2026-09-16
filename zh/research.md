---
layout: default
title: 研究
permalink: /zh/research/
lang: zh
summary: "论文、笔记与正在研究的问题。"
---
<header class="page-head">
  <h1>研究</h1>
  <p>论文、读书笔记，以及正在思考的问题。</p>
</header>

{% assign items = site.research | where_exp: 'item', 'item.lang == "zh"' | sort: 'date' | reverse %}
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
