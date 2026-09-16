---
layout: default
title: 首页
permalink: /zh/
lang: zh
---
<section class="profile">
  <h1 class="profile-name">{{ site.title_zh }}</h1>
  <div class="profile-body">
    <div class="profile-bio">
      <p>在武汉大学经济与管理学院读物流管理（供应链运营试验班），研究平台供应链的定价、产能分配与信息披露，关注消费者策略行为下的机制设计。研究之外：长跑、摄影与音乐。</p>
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
