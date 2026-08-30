# Security Policy

## Supported versions

RoamPrompt has not yet issued a public production release. Security support will begin with the first Roam Depot release.

## Reporting a vulnerability

Do not disclose a suspected vulnerability, API key, private note, confidential document, or exploitable detail in a public GitHub issue.

Use GitHub's private vulnerability-reporting feature when it becomes available for this repository. If private reporting is unavailable, open a minimal public issue requesting a private contact channel without including sensitive technical details.

## API keys

RoamPrompt should never require users to commit, publish, or share a Gemini API key.

If a key is exposed:

1. revoke or rotate it immediately in the relevant Google console;
2. review usage and billing activity;
3. remove it from screenshots, logs, issues, and shared graphs; and
4. do not assume deletion from Git history removes prior exposure.

## Scope

Security reports may include unintended graph access, unsafe data transmission, secret exposure, injection risks, cross-extension interference, or destructive graph writes.
