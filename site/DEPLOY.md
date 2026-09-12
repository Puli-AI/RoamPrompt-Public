# Deploying the public website

The production site is served by Nginx from `/var/www/roamprompt` at <https://roamprompt.puli-consulting.com>.

After a reviewed website change is merged to `main`, run:

```bash
sudo mkdir -p /var/www/roamprompt/assets

sudo curl --fail --location --output /var/www/roamprompt/index.html https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/index.html
sudo curl --fail --location --output /var/www/roamprompt/styles.css https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/styles.css
sudo curl --fail --location --output /var/www/roamprompt/assets/puli-consulting-logo.svg https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/puli-consulting-logo.svg
sudo curl --fail --location --output /var/www/roamprompt/assets/review-candidates.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/review-candidates.webp
sudo curl --fail --location --output /var/www/roamprompt/assets/qec-reading-note.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/qec-reading-note.webp
sudo curl --fail --location --output /var/www/roamprompt/assets/permanent-notes.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/permanent-notes.webp
sudo curl --fail --location --output /var/www/roamprompt/assets/pdf-current-page.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/pdf-current-page.webp
sudo curl --fail --location --output /var/www/roamprompt/assets/academic-review.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/academic-review.webp
sudo curl --fail --location --output /var/www/roamprompt/assets/news-clipping-input.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/news-clipping-input.webp
sudo curl --fail --location --output /var/www/roamprompt/assets/news-clipping-review.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/news-clipping-review.webp
sudo mkdir -p /var/www/roamprompt/assets/social
sudo curl --fail --location --output /var/www/roamprompt/assets/social/01-origins-slip-box.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/social/01-origins-slip-box.webp
sudo curl --fail --location --output /var/www/roamprompt/assets/social/02-niklas-luhmann-portrait.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/social/02-niklas-luhmann-portrait.webp
sudo curl --fail --location --output /var/www/roamprompt/assets/social/03-from-source-to-system.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/social/03-from-source-to-system.webp
sudo curl --fail --location --output /var/www/roamprompt/assets/social/04-dr-mak-roam-graph-overview.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/social/04-dr-mak-roam-graph-overview.webp
sudo curl --fail --location --output /var/www/roamprompt/assets/social/01-before-the-search-bar-linkedin.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/social/01-before-the-search-bar-linkedin.webp
sudo curl --fail --location --output /var/www/roamprompt/assets/social/02-scholar-90000-notes-linkedin.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/social/02-scholar-90000-notes-linkedin.webp
sudo curl --fail --location --output /var/www/roamprompt/assets/social/03-highlights-never-ideas-linkedin.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/social/03-highlights-never-ideas-linkedin.webp
sudo curl --fail --location --output /var/www/roamprompt/assets/social/04-lines-to-3d-web-linkedin.webp https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/assets/social/04-lines-to-3d-web-linkedin.webp

sudo chown -R www-data:www-data /var/www/roamprompt
sudo find /var/www/roamprompt -type f -exec chmod 644 {} \;
curl -I https://roamprompt.puli-consulting.com/
```

No Nginx reload is required for static content changes. Do not deploy unreviewed branches to production.

## Adding published LinkedIn article URLs

The four cards in the `#articles` section intentionally show `LinkedIn article forthcoming` until each post is published. Each placeholder has a stable `data-link-slot` value from `linkedin-post-1` through `linkedin-post-4`. For each published post, replace the corresponding pending span:

```html
<span class="article-cta" data-link-slot="linkedin-post-1" aria-disabled="true">LinkedIn article forthcoming</span>
```

with a direct, public LinkedIn URL:

```html
<a class="article-cta" href="https://www.linkedin.com/posts/...">Read on LinkedIn ↗</a>
```

Open each URL in a signed-out browser before deployment so the website does not point to an edit, analytics, or private-preview address.
