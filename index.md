---
title: Home
layout: default
lang: en
---
<section class="profile">
  <h1 class="profile-name">{{ site.title }}</h1>
  <p class="profile-meta">
    <a href="{{ '/projects/' | relative_url }}">Projects</a> ·
    <a href="{{ '/research/' | relative_url }}">Research</a> ·
    <a href="{{ '/arts/' | relative_url }}">Arts</a> ·
    <a href="{{ '/sports/' | relative_url }}">Sports</a> ·
    <a href="{{ '/thoughts/' | relative_url }}">Thoughts</a>
  </p>
  <div class="profile-body">
    <div class="profile-bio">
      <p>{{ site.description }}</p>
      <div class="profile-elsewhere">
        <a class="profile-social" href="{{ '/about/' | relative_url }}">More about me</a>
      </div>
    </div>
    <figure class="profile-photo">
      <img src="{{ site.profile_image | relative_url }}" alt="{{ site.title }}" />
    </figure>
  </div>
</section>

{% include ink-divider.html %}

<section class="section">
  <div class="section-head">
    <h2>Education</h2>
  </div>
  {% include education-table.html %}
</section>

<section class="section">
  <div class="section-head">
    <h2>News</h2>
  </div>
  {% include entry-table.html items=site.news lang='en' limit=4 explicit_link=true %}
</section>

<section class="section">
  <div class="section-head">
    <h2>Latest posts</h2>
  </div>
  {% include entry-table.html items=site.thoughts lang='en' limit=4 %}
</section>

<section class="section">
  <div class="section-head">
    <h2>Selected projects</h2>
  </div>
  {% include entry-table.html items=site.projects lang='en' limit=3 %}
</section>

<section class="section">
  <div class="section-head">
    <h2>Elsewhere</h2>
  </div>
  {% include social-row.html %}
</section>
