# Changelog

All notable public changes to RoamPrompt are recorded here.

## 0.4.1 - 2026-09-03

### Fixed

- Preserve quotations, idioms, proverbs, maxims, aphorisms, classical phrases, and citations in their original input language and script.
- Place opposite-language translations and Traditional or Simplified variants under aliases.
- Route standalone wisdom fragments through the quote schema even when quotation marks or a `Quote::` label are absent.
- Mark recalled but user-unsupplied provenance as candidate or unverified.
- Label interpretive takeaways explicitly and avoid unsupported doctrinal or cultural claims.
- Apply Chinese book-title marks only to Chinese work titles and prevent nested Roam page links.

## 0.4.0 - 2026-08-31

### Added

- Smart-note conversion for focused Roam blocks.
- Ambient Assistant for text and pasted images.
- Source-grounded academic-PDF ingestion.
- Review screen for permanent-note candidates.
- QEC literature notes with evidence locators and key citations.
- Separate epistemic statuses for empirical findings, author interpretations, reader syntheses, and speculative hypotheses.
- Weekly review workflow.
- User-provided Gemini API key and explicit data-transfer consent.

### Reliability and safety

- Deterministic Roam rendering without model-authored bullet markers.
- Transactional insertion and rollback after write failures.
- Document-type and file-size validation.
- Evidence-locator and graph-connection validation.
- Title-claim alignment and eight permanent-note acceptance gates.
- Stable first-author bibliography keys.
- Extension lifecycle cleanup and duplicate-command protection.

### Status

Stable public release approved for Roam Depot submission.
