---
title: Home
layout: default
lang: en
---
<section class="profile">
  <h1 class="profile-name">{{ site.title }}</h1>
  <div class="profile-body">
    <div class="profile-bio">
      <p>I study supply chain operations at Wuhan University's School of Economics and Management — platform pricing, capacity allocation, and information disclosure when consumers behave strategically. Away from research: long-distance running, photography, and music.</p>
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
