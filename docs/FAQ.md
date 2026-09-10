# Frequently Asked Questions

## Is RoamPrompt available in Roam Depot?

Not yet. RoamPrompt v0.4.5 is the current public reliability and privacy update, and Roam Depot PR #1442 remains open. Current development testing uses a locally loaded extension folder.

## Does RoamPrompt upload my entire graph?

No. Ordinary workflows send the selected input and limited contextual information needed for the requested task. Weekly Review locally selects Quote and open TODO block strings from the previous seven days, caps each category at 50 items, and asks for separate confirmation before transmission. See the [Privacy Guide](PRIVACY.md).

## Do I need my own AI account?

The current public release uses a user-provided Google Gemini API key.

## Will I be charged?

Google may charge for Gemini API usage depending on the user's account, model, region, quota, and current pricing. Review the applicable Google documentation before use.

## Can RoamPrompt read academic papers?

It supports selected PDF workflows, subject to file-size, model, and document-quality limitations.

## Can RoamPrompt read a PDF already embedded in a Daily Note?

Yes. On a device where the extension is installed, display the PDF and run **RoamPrompt: Read PDF on Current Page**. One PDF loads automatically; multiple PDFs produce a chooser. A PDF uploaded from Android can be processed after synchronisation, but the locally loaded extension cannot execute on Android itself.

## Can RoamPrompt read scanned newspaper clippings?

Version 0.4.4 adds text-native news articles and image-only scanned or screenshot clippings. For multi-column pages, name the intended headline or subject in Research focus. RoamPrompt should exclude advertisements and neighbouring stories, and it stops for clarification when the target remains ambiguous.

## Are generated citations guaranteed to be correct?

No. RoamPrompt is designed to preserve source grounding, but all bibliographic records, quotations, locators, and statistics should still be checked against the source.

## What is the difference between a literature note and a permanent note?

A literature note records what a source says. A permanent note expresses one autonomous, reusable idea in the user's developing knowledge system.

## Does RoamPrompt automatically add every proposed permanent note?

The source workflow is designed to present candidates for human review before insertion.

## Where should I report a problem?

Use [GitHub Issues](https://github.com/Puli-AI/RoamPrompt-Public/issues). Include the RoamPrompt version, browser, operating system, workflow, expected result, and sanitised error message. Never include API keys or private source content.
