# Privacy

RoamPrompt is designed as a client-side Roam Research extension using the Google Gemini API.

## Information processed

Depending on the selected workflow, RoamPrompt may send the following information to Google Gemini:

- text selected or entered by the user;
- pasted images;
- attached PDF documents, including files downloaded from synced Roam attachment links at the user's request;
- the current Roam page title;
- titles associated with active projects; and
- limited existing-note titles used to suggest graph connections.

RoamPrompt does not require the entire graph to be uploaded for ordinary operation. When **RoamPrompt: Read PDF on Current Page** is invoked, the extension searches block strings on that page for PDF references, downloads the selected attachment in the user's browser, and sends the PDF directly to Google Gemini after consent. The PDF is not routed through a Puli AI server.

## Gemini API key

Users provide their own Gemini API key. The extension sends requests directly from the browser to the Gemini API.

Users are responsible for:

- understanding the Google terms applicable to their account;
- restricting their API key where possible;
- monitoring usage and charges;
- rotating a key that may have been exposed; and
- deciding which material is appropriate to send.

## Puli AI servers

The planned first public release does not require note content, documents, graph context, or Gemini API keys to be sent to a Puli AI server.

If a future version introduces optional server-backed services, the change will require clear disclosure and an updated privacy notice before activation.

## Sensitive information

Do not process confidential, personal, regulated, privileged, or unpublished information unless you have authority to do so and the relevant data-processing terms are acceptable.

## AI limitations

Generated content may be inaccurate, incomplete, biased, or unsupported. Human review remains necessary, particularly for bibliographic information, quotations, statistics, causal claims, and permanent notes.
