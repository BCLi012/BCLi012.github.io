---
layout: default
title: Projects
permalink: /projects/
---
<header class="page-head">
  <h1>Projects</h1>
  <p>Selected work, side projects, and things I've built.</p>
</header>

{% assign items = site.projects | sort: 'date' | reverse %}
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
{% if items.size == 0 %}<p class="empty">Nothing here yet.</p>{% endif %}
