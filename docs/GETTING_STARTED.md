# Getting Started

RoamPrompt v0.4.4 is the approved stable public release. The Roam Depot listing remains pending in PR #1442. Current development acceptance therefore uses a locally loaded extension folder; the Depot steps below apply only after Roam Research approves the listing.

## Before installation

You will need:

- access to a Roam Research graph;
- permission to install Roam Depot extensions;
- a Google Gemini API key;
- an understanding that selected content is sent to Google Gemini for processing.

Read the [Privacy Guide](PRIVACY.md) before using the extension with personal, confidential, regulated, or unpublished material.

## Roam Depot installation

When the Roam Depot listing is approved:

1. Open **Settings** in Roam Research.
2. Select **Roam Depot**.
3. Search for **RoamPrompt**.
4. Review the description, permissions, privacy information, and release notes.
5. Install the extension.
6. Open the RoamPrompt settings panel.
7. Enter your own Gemini API key.
8. Start with a non-critical test graph.

## First test

Create a short block on the Daily Notes page, focus the block, and run **Trigger RoamPrompt** from the command palette.

Confirm that:

- the original material remains recoverable;
- the generated hierarchy is readable;
- page links are relevant; and
- no confidential information was included unintentionally.

## Academic-paper test

Run **RoamPrompt: Open Chat Window**, attach a supported academic PDF, and optionally enter a research focus.

RoamPrompt should:

- identify the source;
- create a QEC literature note;
- preserve publication information separately from the study period;
- show evidence anchors and key citations;
- propose atomic permanent notes; and
- ask you to review candidates before insertion.

AI-generated notes can contain errors. Check source identity, quantities, citations, evidence locators, and interpretations against the original document.

## News-clipping test

Run **RoamPrompt: Open Chat Window**, attach a newspaper or magazine clipping saved as a PDF, and use the research-focus field to name the intended headline when the page contains several articles.

RoamPrompt should:

- recognise text-native articles and image-only scans or screenshots;
- isolate the intended article from advertisements and neighbouring columns;
- preserve publication, issue date, dateline, byline or wire-service attribution, and article region;
- keep reported events, attributed statements, and contemporary predictions distinct;
- create a News Source Note and reviewable atomic-note candidates; and
- stop with an actionable ambiguity message instead of silently combining articles.

Check the generated text and locators against the clipping before insertion.
