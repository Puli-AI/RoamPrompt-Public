# RoamPrompt v0.4.0 release audit

Date: 2026-08-31  
Status: Approved for stable public release and Roam Depot submission

## Scope

This promotion preserves the tested behavior of v0.4.0-rc.3. The public `extension.js` was verified to match the engineering release candidate before the metadata-only stable promotion.

## Automated verification

- JavaScript syntax validation passes for the shipped entry point.
- The engineering release candidate passed all 24 automated tests.
- The test suite covers academic-PDF validation, grounded QEC output, permanent-note candidate gates, evidence locators, citation handling, Roam tree parsing, transactional insertion rollback, privacy consent, and extension lifecycle cleanup.

## Manual acceptance

- The three RoamPrompt commands load without duplication after repeated extension reloads.
- Academic PDFs produce one source reading note plus separately reviewable permanent-note candidates.
- Approved candidates insert as independent top-level Zettels.
- Publication year and study period remain distinct.
- Evidence locators and epistemic-status labels are visible for review.
- The user supplies their own Gemini API key in Roam Research settings.
- No Gemini API key is bundled in the extension or hosted by Puli Consulting.

## Release decision

No functional changes were required after acceptance of v0.4.0-rc.3. Version, public status, and Puli Consulting attribution were updated for the stable v0.4.0 release.
