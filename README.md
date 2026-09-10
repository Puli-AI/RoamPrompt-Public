# RoamPrompt

**Website:** [roamprompt.puli-consulting.com](https://roamprompt.puli-consulting.com)

**Turn notes, images, and supported PDFs into structured, connected knowledge inside Roam Research.**

RoamPrompt is an AI-assisted extension from Puli Consulting for people who use Roam Research for scholarly work, professional learning, writing, and knowledge development.

It helps transform source material into:

- structured smart notes;
- source-grounded QEC literature notes;
- provenance-rich News Source Notes for text-native and scanned journalism;
- candidate atomic Zettelkasten notes;
- explicit evidence and source connections; and
- reusable ideas that can develop across a Roam graph.

## What makes RoamPrompt different?

RoamPrompt is designed around a simple principle: AI should accelerate knowledge work without silently deciding what becomes knowledge.

For source-grounded PDFs, RoamPrompt separates:

1. what the source reports;
2. what the authors interpret;
3. what the reader synthesises; and
4. what remains speculative.

For journalism, it also keeps reported events, attributed statements, and contemporary predictions distinct. Image-only clipping PDFs are read visually, and multi-column pages retain an explicit article-region boundary so neighbouring stories and advertisements are not silently merged.

Permanent-note candidates are reviewed before insertion. Existing Roam connections are distinguished from newly suggested concepts.

## Core workflows

### Smart-note conversion

Convert a focused Roam block into a structured note with useful metadata and page links.

### Ambient Assistant

Enter notes or paste an image in a lightweight window without leaving the current Roam page.

### PDF document workflow

Attach a supported PDF to produce a source-grounded source note and reviewable permanent-note candidates. Supported routes include academic papers, reports, books, book chapters, news articles, scanned news clippings, and other documents. For a PDF already embedded in the current Roam page or Daily Note, run **RoamPrompt: Read PDF on Current Page**. A sole PDF loads automatically; multiple PDFs open a chooser.

### Weekly Review

Organise recent tasks and captured quotations into a structured reflection. Version 0.4.5 restricts this workflow to the previous seven days and caps transmission at 50 Quote block strings and 50 open TODO block strings, with a workflow-specific confirmation before anything is sent to Gemini.

## Release status

RoamPrompt v0.4.5 is the current public reliability and privacy update. Its self-contained distribution file is available in this repository.

RoamPrompt is **not yet listed in Roam Depot**. PR #1442 remains open while the v0.4.5 corrective release is reviewed. Current development testing therefore uses a locally loaded extension folder; general users should wait for the Depot release. Internal development history and experimental materials remain separate.

## Documentation

- [Getting Started](docs/GETTING_STARTED.md)
- [User Guide](docs/USER_GUIDE.md)
- [Privacy](docs/PRIVACY.md)
- [Frequently Asked Questions](docs/FAQ.md)
- [Security](SECURITY.md)
- [Changelog](CHANGELOG.md)

## Requirements

The release requires:

- a Roam Research graph;
- a supported web browser;
- a user-provided Google Gemini API key; and
- acceptance of the applicable Google API terms and costs.

Roam Depot installation instructions will be finalised when the listing is approved.

## Support, feedback, and collaboration

Use [GitHub Issues](https://github.com/Puli-AI/RoamPrompt-Public/issues) for reproducible bugs and feature requests. Do not include API keys, private notes, confidential documents, or sensitive graph content in an issue.

We welcome conversations with Roam practitioners, researchers, educators, extension developers, and institutional partners interested in promoting RoamPrompt or co-developing responsible, source-grounded knowledge workflows.

Contact **Dr. M.K. Mak**, Managing Partner, Puli Consulting International Co., Ltd., at [m.k.mak@puli-consulting.com](mailto:m.k.mak@puli-consulting.com).

## About Puli Consulting

RoamPrompt is developed by [Puli Consulting International Co., Ltd.](https://www.puli-consulting.com) as part of its work on human-centred AI, knowledge infrastructure, and augmented professional reasoning.

## Licence

RoamPrompt is released under the [MIT License](LICENSE).

The licence permits use, copying, modification, and redistribution subject to preservation of the copyright and licence notice. Company names, logos, and branding are not licensed as trademarks.
