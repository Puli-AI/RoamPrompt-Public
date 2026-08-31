# Getting Started

RoamPrompt v0.4.0-rc.3 is the approved public release candidate. The Roam Depot listing is pending; the steps below describe the supported workflow once installation is available.

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
