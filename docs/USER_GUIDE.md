# User Guide

## Smart-note conversion

Use **Trigger RoamPrompt** while your cursor is inside a Roam block. RoamPrompt analyses the selected material and replaces or expands it as a structured note, while preserving the original text where supported.

Use this workflow for meeting fragments, observations, quotations, ideas, and working notes.

## Ambient Assistant

Use **RoamPrompt: Open Chat Window** to enter text, paste an image, or attach a supported PDF.

The assistant inserts results beneath the focused block or current page. A user instruction should express the desired intellectual focus, not repeat formatting rules controlled by RoamPrompt.

Example focus:

> Examine implications for assessment validity, teacher expertise, and responsible AI adoption.

## Reading an already embedded PDF

Use **RoamPrompt: Read PDF on Current Page** when a PDF has already been uploaded into a Roam page or Daily Note. The command searches the full nested block tree rather than requiring the raw PDF-component text to be exposed.

- If exactly one PDF is present, RoamPrompt downloads and preloads it into the Ambient Assistant.
- If several PDFs are present, RoamPrompt displays a chooser.
- On Daily Notes, RoamPrompt falls back to the active day's page when the rendered viewer has taken focus.
- The existing 10 MB PDF limit, Gemini consent, candidate review, and transactional insertion safeguards still apply.

A PDF may be captured from Android and processed after it synchronises to a Mac or another device where the extension is installed. The locally loaded extension cannot itself execute on Android.

## Academic-paper workflow

For a supported scholarly PDF, RoamPrompt applies a source-grounded reading workflow.

### Literature note

The literature note represents the source and may include:

- bibliographic identity;
- research question;
- method;
- evidence;
- conclusion;
- limitations;
- key citations;
- synthesis; and
- open questions.

### Permanent-note candidates

A permanent note should contain one reusable proposition, not merely a topic or paper summary.

Candidates are evaluated for:

- atomicity;
- independence from the source;
- original wording;
- source grounding;
- future usefulness;
- non-duplication; and
- honest treatment of uncertainty; and
- alignment between the card title, claim, and cited evidence.

Atomicity means one coherent, reusable proposition. A card may combine closely interdependent observations when their conjunction carries a distinct meaning, but it should not bundle unrelated findings merely because they came from the same source.

Candidates may be accepted or rejected before graph insertion.

## News-article and clipping workflow

Attach a text-native news article, scanned clipping, or screenshot wrapped as a PDF. If the page contains several stories, enter the intended headline or subject in **Research focus**.

RoamPrompt uses the page image, filename, headline prominence, and column boundaries to identify the target article. Browser controls, advertisements, and neighbouring stories must remain outside the source boundary. If the target remains ambiguous, RoamPrompt stops and reports the competing headlines so you can refine the focus.

The News Source Note records:

- publication and issue date;
- personal byline and wire-service attribution as separate fields;
- dateline;
- text, image-only scan, screenshot, or mixed capture mode;
- page and article-region locator;
- reported events;
- attributed statements;
- contemporary predictions;
- synthesis and open questions.

A missing personal byline is recorded as `Not stated`; a credit such as UPI is recorded as a wire service rather than converted into an author. Predictions made in an old clipping remain labelled as contemporary predictions even when later history is known.

### Epistemic status

RoamPrompt distinguishes:

- **Empirical finding** — directly supported by reported evidence.
- **Author interpretation** — an interpretation advanced by the source authors.
- **Reported event** — an event described by a journalistic source.
- **Attributed statement** — a claim or quotation assigned to a named person or organisation.
- **Contemporary prediction** — a forecast reported at the source's publication date.
- **Reader synthesis** — a new implication developed from verified source material.
- **Speculative hypothesis** — a useful but untested possibility.

## Connections

**Existing Connections** should refer only to pages retrieved from the current graph.

**Suggested New Concepts** are possible future pages. Their presence does not mean those concepts already exist or have been validated.

## Weekly Review

Use **RoamPrompt: Weekly Review Agent** to organise recent open tasks and captured quotations. Review the result before relying on task migration or thematic summaries.

## Responsible use

- Verify academic and journalistic claims against their sources.
- Treat generated citations as untrusted until checked.
- Do not use RoamPrompt as an autonomous authority.
- Keep regular Roam backups.
- Test new releases in a non-critical graph.
- Never publish an API key in a screenshot, issue, or shared graph.
