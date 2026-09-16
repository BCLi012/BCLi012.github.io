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
    <figure class="profile-photo">
      <img src="{{ site.profile_image | relative_url }}" alt="{{ site.title }}" />
    </figure>
    <div class="profile-bio">
      <p>{{ site.description }}</p>
      <div class="hero-links">
        <a class="button" href="{{ '/about/' | relative_url }}">About me</a>
        <a class="button button-ghost" href="{{ '/projects/' | relative_url }}">View projects</a>
      </div>
      <div class="profile-elsewhere">
        <a class="profile-social" href="https://github.com/BcLee012">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.99 5.24.99 11.5c0 4.86 3.15 8.98 7.52 10.44.55.1.75-.24.75-.53 0-.26-.01-1.13-.02-2.05-3.06.67-3.71-1.3-3.71-1.3-.5-1.28-1.22-1.62-1.22-1.62-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.92.1-.72.38-1.2.7-1.48-2.44-.28-5.01-1.22-5.01-5.44 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.43 3.02-1.13 3.02-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.23-2.58 5.16-5.03 5.43.4.34.75 1.01.75 2.04 0 1.47-.01 2.66-.01 3.02 0 .29.2.64.76.53A11.01 11.01 0 0 0 23 11.5C23 5.24 18.27.5 12 .5z"/></svg>
          GitHub
        </a>
      </div>
    </div>
  </div>
</section>

{% include ink-divider.html %}

<section class="section">
  <div class="section-head">
    <h2>Projects</h2>
    <a class="see-all" href="{{ '/projects/' | relative_url }}">All →</a>
  </div>
  {% include entry-table.html items=site.projects lang='en' limit=3 %}
</section>

<section class="section">
  <div class="section-head">
    <h2>Research</h2>
    <a class="see-all" href="{{ '/research/' | relative_url }}">All →</a>
  </div>
  {% include entry-table.html items=site.research lang='en' limit=3 %}
</section>

<section class="section">
  <div class="section-head">
    <h2>From the Journal</h2>
    <a class="see-all" href="{{ '/thoughts/' | relative_url }}">All →</a>
  </div>
  {% include entry-table.html items=site.thoughts lang='en' limit=4 %}
</section>
