---
title: Home
layout: default
lang: en
---
<section class="hero">
  <h2>Hello — I'm Your Name</h2>
  <p>A short one-line intro about who you are and what you do.</p>
</section>

<section class="preview">
  <h3>Recent Projects</h3>
  <ul class="card-list">
    {% for p in site.projects limit:3 %}
      <li class="card">
        <a href="{{ p.url | relative_url }}">
          <h4>{{ p.title }}</h4>
          <p>{{ p.summary }}</p>
        </a>
      </li>
    {% endfor %}
  </ul>

  <h3>Recent Research</h3>
  <ul class="card-list">
    {% for r in site.research limit:2 %}
      <li class="card"><a href="{{ r.url | relative_url }}"><h4>{{ r.title }}</h4></a></li>
    {% endfor %}
  </ul>

  <h3>From the Journal (Thoughts)</h3>
  <ul>
    {% for t in site.thoughts limit:3 %}
      <li><a href="{{ t.url | relative_url }}">{{ t.title }}</a> — <small>{{ t.date | date: "%Y-%m-%d" }}</small></li>
    {% endfor %}
  </ul>
</section>
