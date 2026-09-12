# Getting Started

RoamPrompt v0.4.5 is the current public reliability and privacy update and is available in Roam Depot.

## Before installation

You will need:

- access to a Roam Research graph;
- permission to install Roam Depot extensions;
- a Google Gemini API key;
- an understanding that selected content is sent to Google Gemini for processing.

Read the [Privacy Guide](PRIVACY.md) before using the extension with personal, confidential, regulated, or unpublished material.

## Roam Depot installation

1. Open **Settings** in Roam Research.
2. Select **Roam Depot**.
3. Search for **RoamPrompt**.
4. Review the description, permissions, privacy information, and release notes.
5. Select **Install**.
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

## Already-embedded PDF test

Upload a PDF to a Daily Note from Android or another device and allow the graph to synchronise. On a device where RoamPrompt is installed:

1. Display the embedded PDF.
2. Open Roam's command palette.
3. Run **RoamPrompt: Read PDF on Current Page**.
4. Confirm that a sole PDF is preloaded automatically, or select the intended file when several PDFs are present.
5. Review the source identity, evidence anchors, and permanent-note candidates before insertion.

The command scans the current page's nested block tree. On the Daily Notes screen it can fall back to the active day's page when the rendered PDF viewer has taken focus. The extension itself cannot run on Android until RoamPrompt is available there.

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
