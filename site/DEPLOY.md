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

sudo chown -R www-data:www-data /var/www/roamprompt
sudo find /var/www/roamprompt -type f -exec chmod 644 {} \;
curl -I https://roamprompt.puli-consulting.com/
```

No Nginx reload is required for static content changes. Do not deploy unreviewed branches to production.
