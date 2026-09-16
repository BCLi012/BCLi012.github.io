---
layout: default
title: 首页
permalink: /zh/
lang: zh
---
<section class="profile">
  <h1 class="profile-name">{{ site.title }}</h1>
  <div class="profile-body">
    <div class="profile-bio">
      <p>项目、研究、艺术与户外——这里是我的自留地。</p>
    </div>
    <figure class="profile-photo">
      <img src="{{ site.profile_image | relative_url }}" alt="{{ site.title }}" />
    </figure>
  </div>
</section>

{% include ink-divider.html %}

<section class="section">
  <div class="section-head">
    <h2>教育</h2>
  </div>
  {% include education-table.html %}
</section>

<section class="section">
  <div class="section-head">
    <h2>动态</h2>
  </div>
  {% include entry-table.html items=site.news lang='zh' limit=4 explicit_link=true %}
</section>

<section class="section">
  <div class="section-head">
    <h2>最新随笔</h2>
  </div>
  {% include entry-table.html items=site.thoughts lang='zh' limit=4 %}
</section>

<section class="section">
  <div class="section-head">
    <h2>精选项目</h2>
  </div>
  {% include entry-table.html items=site.projects lang='zh' limit=3 %}
</section>

<section class="section">
  <div class="section-head">
    <h2>在其他地方</h2>
  </div>
  {% include social-row.html %}
</section>
