# Deploying the public website

The production website is a static site served by Nginx from:

`/var/www/roamprompt`

Production URL: <https://roamprompt.puli-consulting.com>

After a reviewed website change is merged to `main`, deploy the two public files from the repository:

```bash
sudo curl --fail --location --output /var/www/roamprompt/index.html https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/index.html
sudo curl --fail --location --output /var/www/roamprompt/styles.css https://raw.githubusercontent.com/Puli-AI/RoamPrompt-Public/main/site/styles.css
sudo chown www-data:www-data /var/www/roamprompt/index.html /var/www/roamprompt/styles.css
sudo chmod 644 /var/www/roamprompt/index.html /var/www/roamprompt/styles.css
curl -I https://roamprompt.puli-consulting.com/
```

No Nginx reload is required for static content changes. Do not deploy unreviewed branches to production.
