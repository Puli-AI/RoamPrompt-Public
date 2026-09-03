# RoamPrompt Webserver Maintenance Handoff

**Recorded:** 2026-09-03 (UTC)  
**Service:** `roamprompt.puli-consulting.com`  
**Scope:** RoamPrompt only. This record does not describe CICITC, SMES, StrategyLab, or other hosted applications.

## 1. Source-of-truth repositories

| Purpose | Repository | Operational role |
|---|---|---|
| Private extension development | `Puli-AI/RoamPrompt` | Extension code, tests, branches, and reviewed pull requests |
| Public release, documentation, and website | `Puli-AI/RoamPrompt-Public` | Public release artifacts, user documentation, and `site/` source |
| Production website | `https://roamprompt.puli-consulting.com` | Static deployment of the reviewed `RoamPrompt-Public/main/site` tree |

The production website must be deployed only from reviewed content merged into `Puli-AI/RoamPrompt-Public` `main`.

## 2. GitHub and release status

- RoamPrompt private PR #11 was squash-merged and its branch was deleted.
- RoamPrompt-Public PRs #9 and #10 were squash-merged and their branches were deleted.
- The public release is `v0.4.1`.
- Roam Depot PR #1442 is an upstream contribution to `Roam-Research/roam-depot`; its description was updated for `v0.4.1` and it remains subject to Roam Research maintainer review.
- The reviewed website source displays: `v0.4.1 · Stable public release · Roam Depot submission under review`.

## 3. Production deployment performed

The reviewed website files were downloaded from `Puli-AI/RoamPrompt-Public/main/site` into a temporary staging directory and then installed under:

```text
/var/www/roamprompt
```

Deployed files:

- `index.html`
- `styles.css`
- `assets/puli-consulting-logo.svg`
- `assets/review-candidates.webp`
- `assets/qec-reading-note.webp`
- `assets/permanent-notes.webp`

The files were installed as `www-data:www-data`, with file mode `0644`. The asset directory uses mode `0755`.

### Rollback copy

The pre-deployment website was preserved at:

```text
/var/backups/roamprompt/20260903T044135Z
```

This backup should be retained until the deployed release has completed its normal observation period.

## 4. Verification evidence

| Check | Result |
|---|---|
| Staged release marker | `v0.4.1 · Stable public release · Roam Depot submission under review` |
| Nginx configuration test | Successful |
| Nginx service | Active |
| Plain HTTP request | `301 Moved Permanently` to HTTPS |
| Public HTTPS request | `200 OK` |
| Production release marker | Matches staged `v0.4.1` marker |
| Public content length during verification | 8,623 bytes |

Recorded SHA-256 values for the deployed source files:

```text
d35f1e28d6a341ac0c4bd3a6a32e0e9a3933b08043640f91eaec6a13fbff6e6a  index.html
299ffb4e1d1ac12c16ab22026bca631f4904c8e52a3a3b044ffd101f4fda4662  styles.css
4aed0a4c116faa5e2f45c2804e5d4d570d6d5e4c88432195a1a0ef47cbdb6c31  assets/puli-consulting-logo.svg
ef6eebc54ff3ecb0291b2f291a46c21a16d3b92b1eb954ff2454ff4e072a01b3  assets/review-candidates.webp
60af0f9eb7377aaa0e972f32f478ba8835b8b5354fff9a08bd8a21f406b2e3fd  assets/qec-reading-note.webp
2726180038b6932369eda9a1dd9fe68d1a60f381a11f99653efaa423629fec74  assets/permanent-notes.webp
```

## 5. Nginx findings

The enabled RoamPrompt virtual host uses:

```nginx
server_name roamprompt.puli-consulting.com;
root /var/www/roamprompt;
index index.html;

location / {
    try_files $uri $uri/ =404;
}
```

HTTPS listens on IPv4 and IPv6 port 443 and uses the dedicated Certbot-managed certificate under:

```text
/etc/letsencrypt/live/roamprompt.puli-consulting.com/
```

Port 80 redirects the recognized hostname to HTTPS. The static site does not require an application process, container, database, or exposed backend port. No Nginx reload was required for this content-only deployment.

## 6. Security and operational conclusions

- RoamPrompt is isolated as a static website under its own document root and virtual host.
- The production site does not require GitHub credentials, API keys, environment files, or a running Docker container.
- Gemini keys belong to individual RoamPrompt users and must be entered only in the extension settings. They must not be stored on this webserver or in either repository.
- Preserve the human review boundary: Codex prepares GitHub branches and PRs; a reviewed PR is merged; the Alibaba server pulls only the reviewed public `main` content.
- Do not give GitHub broad SSH access to the Alibaba server merely to automate a small static deployment.
- Prefer a root-owned, narrowly scoped, pull-based deployment script with staging, checksum reporting, rollback, and post-deployment HTTP verification.

## 7. Recommended operating model

```text
Codex/ChatGPT change
        ↓
GitHub feature branch and PR
        ↓
Human review and squash merge
        ↓
Controlled pull from reviewed main on Alibaba
        ↓
Staging, backup, install, and health verification
```

The next RoamPrompt infrastructure improvement should package the verified deployment procedure into a repository-managed script. Installation on the server should remain an explicit administrative action.

## 8. Reusable checklist for the other service chats

Each CICITC, SMES, StrategyLab, or other service chat should perform and record its own findings. Do not assume RoamPrompt's static deployment model applies to an application service.

1. Name the authoritative repository, branch, release, and deployment directory.
2. Record whether the service is static, systemd-managed, Docker Compose-managed, or another type.
3. Inventory listening ports, Nginx upstreams, containers, services, volumes, and databases.
4. Confirm DNS, HTTPS, certificate ownership and expiry, HTTP-to-HTTPS behavior, and public response.
5. Record environment-file presence and secret status without printing secret values.
6. Preserve a rollback point before changing production.
7. Deploy only reviewed GitHub content and record the exact commit or content checksums.
8. Verify local health, public health, authentication boundaries, logs, and data persistence.
9. Document the recovery and rollback commands specific to that service.
10. Keep every service's credentials, database, ports, deployment files, and operational record isolated.

## 9. Current RoamPrompt disposition

The `v0.4.1` website content deployment is complete and healthy. Remaining work is operational hardening and convenience: convert the proven manual procedure into a reviewed, narrowly scoped deployment script and use it for future website releases.
