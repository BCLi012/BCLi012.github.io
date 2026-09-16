---
title: Home
layout: default
lang: en
---
<section class="hero">
  <p class="hero-eyebrow">Personal Site</p>
  <h1>{{ site.title }}</h1>
  <p class="hero-tagline">{{ site.description }}</p>
  <div class="hero-links">
    <a class="button" href="{{ '/about/' | relative_url }}">About me</a>
    <a class="button button-ghost" href="{{ '/projects/' | relative_url }}">View projects</a>
  </div>
  {% include hero-quotes.html %}
</section>

{% include ink-divider.html %}

<section class="section">
  <div class="section-head">
    <h2>Projects</h2>
    <a class="see-all" href="{{ '/projects/' | relative_url }}">All →</a>
  </div>
  <ul class="card-list">
    {% assign items = site.projects | where_exp: 'item', 'item.lang != "zh"' %}
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
    <h2>Research</h2>
    <a class="see-all" href="{{ '/research/' | relative_url }}">All →</a>
  </div>
  <ul class="card-list">
    {% assign items = site.research | where_exp: 'item', 'item.lang != "zh"' %}
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
    <h2>From the Journal</h2>
    <a class="see-all" href="{{ '/thoughts/' | relative_url }}">All →</a>
  </div>
  <ul class="journal-list">
    {% assign thoughts = site.thoughts | where_exp: 'item', 'item.lang != "zh"' | sort: 'date' | reverse %}
    {% for t in thoughts limit:4 %}
      <li>
        <a href="{{ t.url | relative_url }}">{{ t.title }}</a>
        <time datetime="{{ t.date | date_to_xmlschema }}">{{ t.date | date: "%Y-%m-%d" }}</time>
      </li>
    {% endfor %}
  </ul>
</section>
