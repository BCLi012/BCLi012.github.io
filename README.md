# Personal Jekyll Starter (Black & White, EN primary + ZH option)

This is a lightweight Jekyll starter for GitHub Pages:
- Black & white theme (responsive)
- Collections: projects, research, arts, sports, thoughts
- English primary; Chinese pages available under /zh/
- Client-side search (simple-jekyll-search)
- Minimal dependencies; easy to maintain

Quick start:
1. Create a repo `your-username.github.io` (recommended) or any repo.
2. Copy these files into the repo root.
3. (Optional) Install and preview locally:
   - Install Ruby + bundler
   - bundle install
   - bundle exec jekyll serve
4. Push to GitHub. In Settings → Pages, ensure branch is correct. GitHub will build automatically.

Customization:
- Edit _config.yml (site.title, url).
- Add content under _projects/, _research/, _arts/, _sports/, _thoughts/.
- To add Chinese version of a page, create a counterpart with `lang: zh` and `permalink: /zh/.../`.
