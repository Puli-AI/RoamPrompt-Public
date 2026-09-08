# Changelog

All notable public changes to RoamPrompt are recorded here.

## 0.4.4 - 2026-09-07

### Added

- Recognise text-native news articles and scanned or screenshot news clippings as first-class source types.
- Read image-only PDF pages through Gemini's visual document understanding.
- Record publication, issue date, dateline, personal byline, wire service, capture mode, article region, and competing headlines separately.
- Render journalism as a News Source Note rather than forcing it into an academic QEC schema.
- Distinguish reported events, attributed statements, and contemporary predictions from reader synthesis.
- Read a PDF already embedded anywhere in the current Roam page with **RoamPrompt: Read PDF on Current Page**.
- Support an Android-capture/Mac-processing workflow after the uploaded attachment synchronises to the graph.

### Reliability and safety

- Use the research focus, filename, headline prominence, and column boundaries to isolate the intended article.
- Exclude browser controls, advertisements, captions belonging to other items, and neighbouring columns.
- Stop and request a target headline when the article remains ambiguous.
- Avoid generating `@Unknown...` source pages when a clipping has no personal byline.
- Retry malformed or invalid structured extraction once without relaxing provenance requirements.
- Preserve all existing academic-paper citation checks, Zettelkasten gates, candidate review, and transactional insertion safeguards.
- Rebuild candidate evidence anchors deterministically from verified source-claim locators.
- Reject a news candidate that mixes a reported event with a contemporary prediction.
- Resolve embedded PDFs from focused blocks, open pages, nested page ancestry, and the active Daily Note when the rendered viewer has taken focus.
- Validate the final private release with 42 automated tests and live acceptance against an embedded academic PDF and an image-only NYT clipping.

## 0.4.3 - 2026-09-05

### Fixed

- Classify complete monographs as `book` instead of `other_document`.
- Reserve `book_chapter` for individual chapters and excerpts from larger books.
- Describe the attachment control as accepting a supported PDF rather than only an academic PDF.
- Retain the academic-paper-only three-citation threshold and all existing provenance safeguards.

## 0.4.2 - 2026-09-05

### Fixed

- Apply the three-citation verification threshold only to academic papers.
- Allow books, book chapters, reports, and other supported PDFs to proceed with fewer bibliography entries when their extracted claims still have valid evidence locators.
- Preserve all existing claim, citation, epistemic-status, permanent-note review, and transactional insertion safeguards.

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
