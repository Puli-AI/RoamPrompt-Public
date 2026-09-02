const EPISTEMIC_STATUSES = [
  "empirical_finding",
  "author_interpretation",
  "reader_synthesis",
  "speculative_hypothesis"
];

const DOCUMENT_TYPES = [
  "academic_paper",
  "report",
  "book_chapter",
  "other_document"
];

const stringArray = { type: "array", items: { type: "string" } };

const SOURCE_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    paper: {
      type: "object",
      properties: {
        title: { type: "string" },
        document_type: { type: "string", enum: DOCUMENT_TYPES },
        authors: stringArray,
        publication_year: { type: "integer" },
        study_period: { type: "string" },
        source_file: { type: "string" },
        research_question: { type: "string" },
        method: { type: "string" },
        conclusion: { type: "string" },
        limitations: stringArray
      },
      required: ["title", "document_type", "authors", "publication_year", "study_period", "source_file", "research_question", "method", "conclusion", "limitations"]
    },
    claims: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          statement: { type: "string" },
          epistemic_status: { type: "string", enum: ["empirical_finding", "author_interpretation"] },
          locator: { type: "string" },
          evidence: { type: "string" },
          quantities: stringArray
        },
        required: ["id", "statement", "epistemic_status", "locator", "evidence", "quantities"]
      }
    },
    key_citations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          reference_number: { type: "string" },
          authors: { type: "string" },
          year: { type: "integer" },
          title: { type: "string" },
          role: { type: "string" }
        },
        required: ["reference_number", "authors", "year", "title", "role"]
      }
    }
  },
  required: ["paper", "claims", "key_citations"]
};

const ZETTEL_PIPELINE_SCHEMA = {
  type: "object",
  properties: {
    literature_note: {
      type: "object",
      properties: {
        aliases: stringArray,
        topics: stringArray,
        synthesis: { type: "string" },
        open_questions: stringArray
      },
      required: ["aliases", "topics", "synthesis", "open_questions"]
    },
    candidates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          claim: { type: "string" },
          epistemic_status: { type: "string", enum: EPISTEMIC_STATUSES },
          evidence_claim_ids: stringArray,
          evidence_anchor: { type: "string" },
          existing_connections: stringArray,
          suggested_new_concepts: stringArray,
          why_it_matters: { type: "string" },
          tension: { type: "string" },
          open_question: { type: "string" },
          evaluation: {
            type: "object",
            properties: {
              atomic: { type: "boolean" },
              standalone: { type: "boolean" },
              own_words: { type: "boolean" },
              source_grounded: { type: "boolean" },
              generative: { type: "boolean" },
              non_duplicate: { type: "boolean" },
              uncertainty_honest: { type: "boolean" },
              title_claim_aligned: { type: "boolean" },
              rationale: { type: "string" }
            },
            required: ["atomic", "standalone", "own_words", "source_grounded", "generative", "non_duplicate", "uncertainty_honest", "title_claim_aligned", "rationale"]
          }
        },
        required: ["id", "title", "claim", "epistemic_status", "evidence_claim_ids", "evidence_anchor", "existing_connections", "suggested_new_concepts", "why_it_matters", "tension", "open_question", "evaluation"]
      }
    }
  },
  required: ["literature_note", "candidates"]
};

const SOURCE_SYSTEM_INSTRUCTION = `
You are the source-extraction stage of a scholarly knowledge pipeline.
Classify the document as academic_paper, report, book_chapter, or other_document.
Extract only information explicitly supported by the attached document.
Publication year and study period are different fields and must never be conflated.
Every claim needs a traceable locator such as a section plus printed page, figure, table, or bibliography reference number.
Use the document's printed page number when visible; otherwise use the PDF page number.
Classify only empirical findings and author interpretations at this stage.
Copy citation author/year/title from the paper's bibliography; never reconstruct from memory.
Preserve numerical values and whether an effect is absolute or relative.
Return only JSON matching the supplied schema.
`;

const ZETTEL_SYSTEM_INSTRUCTION = `
You are a Zettelkasten curator following the principles of atomicity, autonomy, connection, and emergence.
A literature note represents the source. A permanent note represents one reusable idea in original language.
Do not promote a candidate merely because it is interesting or well written.
Evaluate every candidate against all eight gates: atomic, standalone, own words, source grounded, generative, non-duplicate, uncertainty honest, and title-claim aligned.
The title must accurately compress the candidate claim and must not introduce a finding, comparison, causal relation, or qualifier absent from the claim and its cited evidence.
Empirical findings, author interpretations, reader syntheses, and speculative hypotheses must remain visibly distinct.
Copy every supporting source locator verbatim into evidence_anchor and include its claim ID.
A candidate labelled empirical_finding must cite only empirical source claims.
A candidate labelled author_interpretation must cite at least one author_interpretation source claim.
Existing connections may only use titles supplied from the user's Roam graph.
Put other worthwhile concepts in suggested_new_concepts, never existing_connections.
Speculation must not use empirical language.
Return only JSON matching the supplied schema.
`;

function requireValue(condition, message, errors) {
  if (!condition) errors.push(message);
}

function validateExtraction(extraction) {
  const errors = [];
  requireValue(extraction && extraction.paper, "Missing paper metadata.", errors);
  if (!extraction?.paper) return { valid: false, errors };

  requireValue(DOCUMENT_TYPES.includes(extraction.paper.document_type), "Document type is invalid.", errors);
  requireValue(Number.isInteger(extraction.paper.publication_year), "Publication year must be an integer.", errors);
  requireValue(Boolean(extraction.paper.study_period), "Study period must be recorded separately.", errors);
  requireValue(Array.isArray(extraction.claims) && extraction.claims.length > 0, "No source claims were extracted.", errors);
  requireValue(Array.isArray(extraction.key_citations) && extraction.key_citations.length >= 3, "Fewer than three verified citations were extracted.", errors);

  const claimIds = new Set();
  for (const claim of extraction.claims || []) {
    requireValue(Boolean(claim.id) && !claimIds.has(claim.id), "Claim IDs must be unique.", errors);
    claimIds.add(claim.id);
    requireValue(EPISTEMIC_STATUSES.slice(0, 2).includes(claim.epistemic_status), `Invalid source status for ${claim.id}.`, errors);
    requireValue(Boolean(claim.locator), `Claim ${claim.id} lacks a source locator.`, errors);
    requireValue(Boolean(claim.evidence), `Claim ${claim.id} lacks evidence.`, errors);
  }

  for (const citation of extraction.key_citations || []) {
    requireValue(Boolean(citation.reference_number), "Citation lacks a bibliography reference number.", errors);
    requireValue(Boolean(citation.authors && citation.title && Number.isInteger(citation.year)), `Citation ${citation.reference_number || "unknown"} is incomplete.`, errors);
  }
  return { valid: errors.length === 0, errors };
}

function evaluateCandidates(pipeline, extraction, existingGraphTitles = []) {
  const errors = [];
  const accepted = [];
  const rejected = [];
  const sourceClaims = new Map((extraction.claims || []).map(claim => [claim.id, claim]));
  const claimIds = new Set(sourceClaims.keys());
  const graphTitles = new Set(existingGraphTitles);
  const seenTitles = new Set();

  for (const candidate of pipeline.candidates || []) {
    const reasons = [];
    const evaluation = candidate.evaluation || {};
    for (const gate of ["atomic", "standalone", "own_words", "source_grounded", "generative", "non_duplicate", "uncertainty_honest", "title_claim_aligned"]) {
      if (evaluation[gate] !== true) reasons.push(`Failed ${gate} gate.`);
    }
    if (!EPISTEMIC_STATUSES.includes(candidate.epistemic_status)) reasons.push("Invalid epistemic status.");
    if (!candidate.evidence_claim_ids?.length) reasons.push("No evidence claim selected.");
    if ((candidate.evidence_claim_ids || []).some(id => !claimIds.has(id))) reasons.push("References an unknown source claim.");
    if (!candidate.evidence_anchor) reasons.push("Missing evidence anchor.");
    const citedClaims = (candidate.evidence_claim_ids || []).map(id => sourceClaims.get(id)).filter(Boolean);
    const missingLocators = citedClaims.filter(claim => !candidate.evidence_anchor.includes(claim.locator));
    if (missingLocators.length) reasons.push("Evidence anchor does not reproduce every cited source locator.");
    if (candidate.epistemic_status === "empirical_finding" && citedClaims.some(claim => claim.epistemic_status !== "empirical_finding")) {
      reasons.push("Empirical candidate relies on a non-empirical source claim.");
    }
    if (candidate.epistemic_status === "author_interpretation" && !citedClaims.some(claim => claim.epistemic_status === "author_interpretation")) {
      reasons.push("Author-interpretation candidate lacks a matching source interpretation.");
    }
    if (seenTitles.has(candidate.title)) reasons.push("Duplicate candidate title.");
    seenTitles.add(candidate.title);
    if ((candidate.existing_connections || []).some(title => !graphTitles.has(title))) reasons.push("Claims a graph connection that was not retrieved.");
    if (candidate.epistemic_status === "speculative_hypothesis" && /proves?|demonstrates?|establishes?/i.test(candidate.claim)) {
      reasons.push("Speculation uses empirical certainty language.");
    }

    const reviewed = { ...candidate, accepted: reasons.length === 0, rejection_reasons: reasons };
    if (reviewed.accepted) accepted.push(reviewed);
    else rejected.push(reviewed);
  }
  if (!accepted.length) errors.push("No candidate passed every permanent-note gate.");
  return { accepted, rejected, errors };
}

const link = value => `[[${value}]]`;
const authorSurname = value => {
  const firstAuthor = String(value || "Unknown").trim().split(/\s+(?:&|and)\s+|,/i)[0].trim();
  const words = firstAuthor.match(/[\p{L}\p{M}'-]+/gu) || ["Unknown"];
  return words[words.length - 1];
};
const citationKey = paper => `@${authorSurname(paper.authors?.[0])}${paper.publication_year}: ${paper.title}`;
const bibliographyKey = item => `@${authorSurname(item.authors)}${item.year}: ${item.title}`;

function renderVerifiedNotes(extraction, pipeline, approvedCandidateIds) {
  const paper = extraction.paper;
  const sourceKey = citationKey(paper);
  const approved = new Set(approvedCandidateIds);
  const roots = [];

  const literature = {
    text: `📝 QEC Reading Note: ${link(sourceKey)}`,
    children: [
      `Source File:: ${link(paper.source_file)}`,
      `Authors:: ${paper.authors.map(link).join(", ")}`,
      `Document Type:: ${paper.document_type}`,
      `Publication Year:: ${paper.publication_year}`,
      `Study Period:: ${paper.study_period}`,
      `Tags:: #LiteratureNotes ${pipeline.literature_note.topics.map(link).join(" ")}`,
      `Aliases:: ${pipeline.literature_note.aliases.map(link).join(", ")}`,
      `Question (Q):: ${paper.research_question}`,
      { text: "Evidence (E)::", children: extraction.claims.map(claim => `[${claim.epistemic_status}] ${claim.statement} — ${claim.locator}`) },
      `Method:: ${paper.method}`,
      `Conclusion (C):: ${paper.conclusion}`,
      { text: "Limitations::", children: paper.limitations },
      { text: "Key Citations::", children: extraction.key_citations.map(item => `[${item.reference_number}] ${item.authors} (${item.year}). ${link(bibliographyKey(item))} — ${item.role}`) },
      `Synthesis:: ${pipeline.literature_note.synthesis}`,
      { text: "Open Questions::", children: pipeline.literature_note.open_questions }
    ]
  };
  roots.push(literature);

  for (const candidate of pipeline.candidates || []) {
    if (!approved.has(candidate.id)) continue;
    roots.push({
      text: `💡 Zettel: ${link(candidate.title)}`,
      children: [
        "Tags:: #PermanentNotes",
        `Epistemic Status:: ${candidate.epistemic_status}`,
        `Claim:: ${candidate.claim}`,
        `Evidence Anchor:: ${candidate.evidence_claim_ids.map(id => {
          const claim = (extraction.claims || []).find(item => item.id === id);
          return claim ? `[${id}] ${claim.locator}` : `[${id}] Unresolved`;
        }).join("; ")}`,
        `Source:: ${link(sourceKey)}`,
        `Existing Connections:: ${candidate.existing_connections.map(link).join(", ") || "None verified"}`,
        `Suggested New Concepts:: ${candidate.suggested_new_concepts.map(link).join(", ") || "None"}`,
        `Why It Matters:: ${candidate.why_it_matters}`,
        `Tension:: ${candidate.tension}`,
        `Open Question:: ${candidate.open_question}`
      ]
    });
  }
  return roots;
}

const SYSTEM_PROMPT = `
You are RoamPrompt, an expert knowledge-parsing engine built for a polymathic professional (PhD researcher, executive coach, author, and consultant) using Roam Research. Your objective is to transform raw text and OCR images into strictly hierarchical Roam blocks.

STRICT FORMATTING RULES:
1. ONLY use double colons (::) for top-level schema metadata keys (e.g., Tags::, Aliases::, Definition::, Synthesis::, Context::, Attendees::, Verbatim::, Author::, Source::, Related Concepts::, Takeaway::, Current State::, Desired State::, Obstacles::, Proposed Interventions::, Core Insight::, Lineage / Context::, Open Question::).
2. NEVER use double colons (::) on child bullets, historical timelines, or inline detail lists. Use a plain en-dash ( – ) or standard colon (:).
3. ORIGINAL-LANGUAGE TITLE & BILINGUAL ALIAS RULE:
   - Preserve the user's exact input language and script in the canonical page title. Never translate or paraphrase a non-English title into an English canonical title.
   - For standalone Chinese input, retain the exact entered Chinese text as the title. Put the English translation and any Traditional/Simplified variant under Aliases::.
   - For standalone English input, retain the English title and put the Chinese translation under Aliases::.
   - Never replace a quotation, idiom, proverb, maxim, aphorism, classical phrase, or citation with an invented conceptual hook.
   - Double brackets create Roam page links. Wrap each graph-worthy title or entity exactly once; never produce nested forms such as [[[[Title]]]].
4. CLEAN LINKS ONLY: Do NOT embed Spine numbers or index prefixes inside double brackets (e.g., use [[Systems depend on systems]], NOT [[11 · Systems depend on systems]]).
5. SPELLING STANDARD: Use British English by default (e.g., judgement, organisational, behaviour, externalisation).
6. DO NOT wrap the first line or root titles in double asterisks (**).
7. DO NOT use markdown headings (#, ##, ###) or horizontal rules (---).
8. DO NOT use numbered lists (1., 2.) or markdown hyphens/asterisks (- or *).
9. Use TAB INDENTATION to represent nested child blocks.
10. Roam supplies its own bullet UI. NEVER begin a line with a bullet glyph (•, ◦, ▪), markdown list marker (-, *), or numbered-list marker.
11. When returning multiple notes, every independent note title begins at indentation level 0.

SCHEMAS:

Schema Z (Atomic Zettelkasten Permanent Note):
💡 Zettel: [[Proposition-style canonical title]]
	Tags:: #PermanentNotes [[Related Field]]
	Aliases:: [[Chinese Traditional]], [[Chinese Simplified]], [[Synonym Variant]]
	Claim:: [One self-contained proposition written in the user's own words]
	Evidence Anchor:: [The precise source finding, argument, or quotation supporting the claim]
	Source:: [[@AuthorYear: Source Title]]
	Connections:: [[Existing Concept A]], [[Existing Concept B]]
	Why It Matters:: [How this changes understanding, decision, or future work]
	Tension:: [Counterpoint, boundary condition, or competing explanation]
	Open Question:: [One productive question that can develop this note]

ATOMIC NOTE RULES:
- One Zettel equals one idea. Do not turn a section summary or a list of findings into a Zettel.
- Give each Zettel a proposition-style title that states an idea, not merely a topic label.
- Write the Claim in original language rather than copying the literature note.
- Every paper-derived Zettel must include an Evidence Anchor:: and Source:: backlink.
- Prefer 3-5 high-value permanent notes over many shallow cards.
- Make each Zettel a separate ROOT block at indentation level 0, never a child of the QEC reading note.

Schema A (Meeting & Coaching Notes):
[[Topic/Entity]] | Meeting Notes
	Context:: [Summary with [[Entities]] linked]
	Attendees:: [[Names]]
	🧠 Strategic Takeaways
		[Nested insights]
	🎯 Action Items
		{{[[TODO]]}} [Task] #NextAction

Schema B (Literature & Zettelkasten Notes):
📝 QEC Reading Note: [[@AuthorYear: Title]]
	Tags:: #LiteratureNotes [[Topic]]
	Aliases:: [[Chinese Title]], [[Alternative Title]]
	Question (Q): [Core research question addressed]
	Evidence (E):
		• [Key evidence, data, or arguments]
	Conclusion (C): [Main takeaway]
	Synthesis:: [How this connects to active research]

Schema C (Wisdom, Quotes, Idioms & Citations):
ROUTING RULES:
- Use Schema C for a standalone quotation, idiom, proverb, maxim, aphorism, classical phrase, citation, or brief wisdom fragment, even when the user did not add quotation marks or a Quote:: label.
- Use Schema D only when the input is genuinely a concept, topic, or explanatory passage rather than a quoted or inherited expression.
- Preserve the exact user-entered text. Never silently replace it with a longer quotation.
- If a longer original quotation or attribution is recalled but no explicit source was supplied by the user, label it as a candidate and never as verified.
- Do not invent philosophical, religious, psychological, or cultural origins. Separate documented provenance from later interpretation.
- When Attribution Status is source_candidate or unknown, prefix every attribution-derived claim under Full Quotation Candidate, Author, Source, Preceding Context, Following Context, and Lineage / Context with "Candidate:" or "Unverified:". Never describe candidate provenance as established fact.
- Do not create doctrinal, religious, philosophical, psychological, or cultural Tags or Related Concepts unless they are explicitly present in the user's input or a verified source.
- Every Takeaway must begin exactly with "Interpretation:" to distinguish analysis from documented provenance.
- Apply work-title punctuation according to the language of each title, not the language of the user's input. Put Chinese book-title marks outside the Roam link for a Chinese work title, for example 《[[偶成]]》. Never place 《》 around an English or other non-Chinese title or translation; use [[Occasional Composition]], not 《[[Occasional Composition]]》.

💡 Quote: [[Exact user-entered text in its original language and script]]
        Aliases:: [[Opposite-language translation]], [[Traditional or Simplified variant when applicable]]
        Input Text:: [Exact user input, unchanged]
        Full Quotation Candidate:: [Longer source passage if reliably recalled; otherwise Unknown]
        Attribution Status:: [verified_from_user_source, source_candidate, or unknown]
        Author:: [[Original-language author name]] / [[Opposite-language alias]]
        Source:: [[Original-language work title]] / [[Opposite-language alias]]
        Preceding Context:: [Immediately preceding source text if reliably known; otherwise Unknown]
        Following Context:: [Immediately following source text if reliably known; otherwise Unknown]
        Literal Meaning:: [Concise literal meaning]
        Lineage / Context:: [Documented origin, historical setting, and later interpretation, clearly distinguished]
        Tags:: #Quotes [Relevant Tags]
        Related Concepts:: [Only genuinely useful graph links]
        Takeaway:: [One concise interpretation, explicitly labelled as interpretation]

Schema D (Conceptual Capture):
💡 Concept: [[Concept Name]]
	Tags:: #Concepts #Ideas [[Related Field]]
	Aliases:: [[Chinese Traditional]], [[Chinese Simplified]]
	Definition:: [1-sentence clear definition]

Schema E (Content & Output Blueprint):
✍️ Content Draft: [[Topic]]
	Target Audience:: [Who this is for]
	Core Premise:: [The main thesis/argument]
	Outline::
		Hook: [Opening thought]
		Body:
			• [Key points]
		CTA: [Call to action/Conclusion]

Schema F (Business & Consulting Strategy):
💼 Strategy: [[Client/Project Name]]
	Current State:: [The existing problem/baseline]
	Desired State:: [The goal/objective]
	Obstacles:: [What is in the way]
	Proposed Interventions:: [Strategic solutions]
`;

const MAX_INLINE_PDF_BYTES = 10 * 1024 * 1024;

const DOCUMENT_GROUNDING_PROMPT = `
DOCUMENT MODE - SOURCE GROUNDING:
- Treat the attached PDF as the only source for title, authors, year, citations, methods, sample, results, quotations, conclusions, and limitations.
- Use current-page and active-project context only for Synthesis::, Connections::, Related Concepts::, and suggested Roam links.
- Never invent a missing bibliographic field; write "Not stated" when necessary.
- Preserve reported quantities exactly and distinguish absolute effects from relative effects.
- Separate the authors' claims from RoamPrompt's interpretation.
- Include Source File:: [[ATTACHED_FILENAME]] near the top of the QEC note.
- Include Method::, Limitations::, and Open Questions:: when supported by the paper.
- ALWAYS include Key Citations:: in the QEC note. Select 5-8 works from the paper's actual reference list that are most important to its argument, method, or interpretation.
- For every key citation, reproduce author/year/title from the PDF bibliography and add a short statement of its role. Never invent a citation and never substitute the attached paper itself for a cited work.
- Default output is one Schema B QEC reading note followed by 3-5 Schema Z permanent notes.
- The QEC note and EACH Zettel must be separate ROOT blocks at indentation level 0.
- Each Zettel must contain one proposition, Evidence Anchor::, Source:: linking to the QEC page, Connections::, Why It Matters::, Tension::, and Open Question::.
- Do not repeat the QEC summary inside the Zettels. Transform source material into reusable, contestable ideas.
- Do not emit bullet characters or markdown list markers; Roam creates bullets automatically. Use tabs alone to express hierarchy.

OUTPUT SHAPE:
📝 QEC Reading Note: [[@AuthorYear: Paper Title]]
	Source File:: [[ATTACHED_FILENAME]]
	Tags:: #LiteratureNotes [[Topic]]
	Question (Q):: [Question]
	Evidence (E)::
		[Evidence without a bullet glyph]
	Method:: [Method]
	Conclusion (C):: [Conclusion]
	Limitations:: [Limitations]
	Key Citations::
		[[@AuthorYear: Exact cited title]] – [Role in this paper]
	Synthesis:: [Connection to active work]
	Open Questions:: [Question]
💡 Zettel: [[Proposition-style title]]
	Tags:: #PermanentNotes [[Field]]
	Claim:: [One atomic proposition in original wording]
	Evidence Anchor:: [Specific supporting evidence from the paper]
	Source:: [[@AuthorYear: Paper Title]]
	Connections:: [[Concept A]], [[Concept B]]
	Why It Matters:: [Consequence]
	Tension:: [Boundary or counterpoint]
	Open Question:: [Development question]
`;

export function validatePdfDescriptor(file) {
  if (!file) return { valid: false, error: "Choose a PDF first." };
  if (file.type !== "application/pdf") return { valid: false, error: "Only PDF documents are supported in v0.3." };
  if (!file.size) return { valid: false, error: "The selected PDF is empty." };
  if (file.size > MAX_INLINE_PDF_BYTES) {
    return { valid: false, error: "This PDF is larger than the 10 MB inline limit. Large-document upload will be added in v0.4." };
  }
  return { valid: true, error: null };
}

export function buildDocumentInstruction(userText, fileName) {
  const request = userText.trim() || "Create a source-grounded QEC reading note from this paper.";
  return DOCUMENT_GROUNDING_PROMPT.replace("ATTACHED_FILENAME", fileName) + "\n\nUSER REQUEST:\n" + request;
}

export function parseRoamLines(formattedText) {
  if (typeof formattedText !== "string") throw new Error("Gemini returned no text.");
  const cleaned = formattedText.replace(/^\s*```(?:text)?\s*/i, "").replace(/\s*```\s*$/i, "");
  const rawLines = cleaned.split("\n").filter(line => line.trim() !== "");
  if (!rawLines.length) throw new Error("Gemini returned an empty note.");

  const lines = rawLines.map((line, index) => {
    const leading = line.match(/^\s*/)[0];
    const level = leading.includes("\t")
      ? (leading.match(/\t/g) || []).length
      : Math.floor(leading.length / 4);
    if (level > 8) throw new Error("Generated note exceeds the supported nesting depth.");
    if (index === 0 && level !== 0) throw new Error("Generated note has an indented root.");
    const text = line.trim().replace(/^(?:(?:[•◦▪‣*-])|(?:\d+[.)]))\s+/, "");
    if (!text) throw new Error("Generated note contains an empty list item.");
    return { level, text };
  });
  if (lines.length > 250) throw new Error("Generated note is unexpectedly large.");
  return lines;
}

function describeGeminiError(response, data) {
  const apiMessage = data?.error?.message || response.statusText || "Unknown API error";
  if (response.status === 400) return "Gemini rejected the request. Check the model, file type, document size, and API key restrictions. " + apiMessage;
  if (response.status === 401 || response.status === 403) return "Gemini authentication failed. Verify that your API key is valid, enabled, and permitted to use this model.";
  if (response.status === 429) return "Gemini quota or rate limit reached. Check your Google AI quota and billing, then retry later.";
  if (response.status >= 500) return "Gemini is temporarily unavailable. No Roam blocks were inserted; retry later.";
  return apiMessage;
}

function extractGeminiText(data) {
  const text = data?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("\n").trim();
  if (!text) throw new Error("Gemini returned no usable text.");
  return text;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The selected file could not be read."));
    reader.onload = event => resolve(event.target.result.split(",")[1]);
    reader.readAsDataURL(file);
  });
}

let loadedExtensionApi = null;
const ROAMPROMPT_COMMAND_LABELS = [
  "Trigger RoamPrompt",
  "RoamPrompt: Open Chat Window",
  "RoamPrompt: Weekly Review Agent"
];

export default {
  onload: ({ extensionAPI }) => {
    loadedExtensionApi = extensionAPI;
    
    extensionAPI.settings.panel.create({
      tabTitle: "RoamPrompt",
      settings: [
        {
          id: "gemini-api-key",
          name: "Gemini API Key",
          description: "Paste your own Gemini API key here. It is sent directly to Google, never to Puli Consulting.",
          action: { type: "input", placeholder: "AIzaSy..." }
        },
        {
          id: "gemini-data-consent",
          name: "Gemini data transfer",
          description: "Allow RoamPrompt to send selected content and limited graph context directly to Google Gemini.",
          action: { type: "switch" }
        }
      ]
    });

    // TOOL 1: INLINE PARSING
    extensionAPI.ui.commandPalette.addCommand({
      label: "Trigger RoamPrompt",
      callback: async () => {
        const apiKey = extensionAPI.settings.get("gemini-api-key");
        if (!apiKey) { alert("Please set your Gemini API Key in Settings."); return; }
        if (!extensionAPI.settings.get("gemini-data-consent")) { alert("Enable Gemini data transfer in RoamPrompt Settings before processing content."); return; }

        const focusedBlock = window.roamAlphaAPI.ui.getFocusedBlock();
        if (focusedBlock != null) {
          const blockUid = focusedBlock["block-uid"];
          const query = `[:find (pull ?b [:block/string]) :where [?b :block/uid "${blockUid}"]]`;
          const userText = window.roamAlphaAPI.q(query)[0][0].string;
          await processAndInsertRoamTree(apiKey, userText, blockUid, true);
        } else { alert("Please click inside a bullet point first."); }
      }
    });

    // TOOL 2: CHAT MODAL
    extensionAPI.ui.commandPalette.addCommand({
      label: "RoamPrompt: Open Chat Window",
      callback: () => {
        const apiKey = extensionAPI.settings.get("gemini-api-key");
        if (!apiKey) { alert("Please set your Gemini API Key in Settings."); return; }
        if (!extensionAPI.settings.get("gemini-data-consent")) { alert("Enable Gemini data transfer in RoamPrompt Settings before processing content."); return; }
        
        let targetUid = null;
        const focusedBlock = window.roamAlphaAPI.ui.getFocusedBlock();
        if (focusedBlock) { targetUid = focusedBlock["block-uid"]; } 
        else { targetUid = window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid(); }
        createChatModal(apiKey, targetUid, extensionAPI);
      }
    });

    // TOOL 3: WEEKLY REVIEW AGENT
    extensionAPI.ui.commandPalette.addCommand({
      label: "RoamPrompt: Weekly Review Agent",
      callback: async () => {
        const apiKey = extensionAPI.settings.get("gemini-api-key");
        if (!apiKey) { alert("Please set your Gemini API Key in Settings."); return; }
        if (!extensionAPI.settings.get("gemini-data-consent")) { alert("Enable Gemini data transfer in RoamPrompt Settings before processing content."); return; }

        const focusedBlock = window.roamAlphaAPI.ui.getFocusedBlock();
        if (focusedBlock == null) { alert("Please click inside a bullet point on your Daily Notes page to run the Weekly Review."); return; }
        const blockUid = focusedBlock["block-uid"];
        
        window.roamAlphaAPI.updateBlock({"block": {"uid": blockUid, "string": "⏳ AI Agent is scanning your graph and curating your week..."}});
        
        // 1. Datalog: Find Unprocessed Quotes
        let unprocessedQuotes = [];
        try {
          let quotesQuery = window.roamAlphaAPI.q(`
            [:find (pull ?b [:block/string])
             :where
             [?b :block/refs ?qPage] [?qPage :node/title "Quotes"]
             (not [?b :block/refs ?wqPage] [?wqPage :node/title "Wisdom & Quotes"])]
          `);
          unprocessedQuotes = quotesQuery.map(res => res[0].string);
        } catch(e) { console.warn("Quote query failed", e); }

        // 2. Datalog: Find Open TODOs from the last 7 days
        let openTodos = [];
        try {
          let oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          let todoQuery = window.roamAlphaAPI.q(`
            [:find (pull ?b [:block/string :block/create-time])
             :where
             [?b :block/refs ?todoPage] [?todoPage :node/title "TODO"]
             (not [?b :block/refs ?donePage] [?donePage :node/title "DONE"])]
          `);
          openTodos = todoQuery
            .map(res => res[0])
            .filter(b => b["create-time"] > oneWeekAgo)
            .map(b => b.string);
        } catch(e) { console.warn("TODO query failed", e); }

        const weeklyPrompt = `
You are a Weekly Review Agent. Analyze the user's data from the past 7 days and output a strictly formatted reflection.
Format the output EXACTLY like this using tabs for indentation:

📅 Weekly Reflection & Migration Report
	💎 CURATED MASTERPIECES (Ready to drag into [[Wisdom & Quotes]])
		[Group unprocessed quotes under appropriate thematic headers: Philosophy & Governance, Execution & Strategy, Cognition & Learning, or AI & Systems]
		💡 Quote: [[Exact quoted expression in its original language and script]]
			Verbatim:: "[The exact verbatim quote text]"
			Author:: [[Author Name]]
			Source:: [[Source Name]]
			Tags:: #Quotes [Relevant Tags]
			Related Concepts:: [Suggest 2 active project links or concepts based on the quote]
			Takeaway:: [1-sentence synthesis of why this matters]
	🎯 Tasks to Migrate
		[List all open TODOs provided here exactly as written. Group them logically if possible.]
	🧠 Weekly Synthesis
		[Write a 2-paragraph executive summary of the themes the user focused on this week based on their quotes and tasks, written directly to the user as an objective coach.]

RAW DATA TO PROCESS:
Unprocessed Quotes:
${unprocessedQuotes.join('\n')}

Open Tasks from the last 7 days:
${openTodos.join('\n')}
`;

        const payload = { contents: [{ parts: [{ text: "SYSTEM:\n" + SYSTEM_PROMPT + "\n\n" + weeklyPrompt }] }] };

        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`, {
            method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify(payload)
          });
          const data = await response.json();
          if (!response.ok) throw new Error(describeGeminiError(response, data));

          const formattedText = data.candidates[0].content.parts[0].text;
          const lines = formattedText.split('\n').filter(line => line.trim() !== '');

          if (lines.length > 0) {
            window.roamAlphaAPI.updateBlock({ "block": { "uid": blockUid, "string": lines[0].trim() } });
            const parentMap = { 0: blockUid };
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i];
              const leadingWhitespace = line.match(/^\s*/)[0];
              let level = leadingWhitespace.includes('\t') ? leadingWhitespace.length : Math.floor(leadingWhitespace.length / 4); 
              const newUid = window.roamAlphaAPI.util.generateUID();
              const parentUid = parentMap[level > 0 ? level - 1 : 0] || blockUid;
              window.roamAlphaAPI.createBlock({
                "location": { "parent-uid": parentUid, "order": "last" },
                "block": { "uid": newUid, "string": line.trim() }
              });
              parentMap[level] = newUid;
            }
          }
        } catch (error) {
          window.roamAlphaAPI.updateBlock({"block": {"uid": blockUid, "string": `❌ API Error: ${error.message}`}});
        }
      }
    });
  },
  onunload: () => {
    document.getElementById("roamprompt-modal")?.remove();
    document.getElementById("roamprompt-review-modal")?.remove();
    const removeCommand = loadedExtensionApi?.ui?.commandPalette?.removeCommand;
    if (typeof removeCommand === "function") {
      for (const label of ROAMPROMPT_COMMAND_LABELS) {
        try { removeCommand({ label }); } catch (error) { console.warn("Command cleanup failed", label, error); }
      }
    }
    loadedExtensionApi = null;
    console.log("RoamPrompt unloaded.");
  }
};

async function processAndInsertRoamTree(apiKey, userText, targetUid, isReplaceRoot = false, mediaParts = [], documentMetadata = null) {
  const isBareUrl = /^https?:\/\/[^\s]+$/i.test(userText.trim());
  if (isBareUrl && mediaParts.length === 0) {
    alert("Bare URL detected. Please paste the article text, an image, or attach a PDF.");
    return false;
  }

  let pageTitle = "Unknown Page";
  try {
    const blockQuery = window.roamAlphaAPI.q(`[:find ?title :where [?b :block/uid "${targetUid}"] [?b :block/page ?p] [?p :node/title ?title]]`);
    if (blockQuery.length > 0) pageTitle = blockQuery[0][0];
    else {
      const pageQuery = window.roamAlphaAPI.q(`[:find ?title :where [?p :block/uid "${targetUid}"] [?p :node/title ?title]]`);
      if (pageQuery.length > 0) pageTitle = pageQuery[0][0];
    }
  } catch (error) {
    console.warn("Page context query failed", error);
  }

  let activeProjects = "None currently tagged";
  try {
    const activeQuery = window.roamAlphaAPI.q(`[:find ?title :where [?tag :node/title "Status/Active"] [?ref :block/refs ?tag] [?ref :block/page ?p] [?p :node/title ?title]]`);
    if (activeQuery.length > 0) activeProjects = [...new Set(activeQuery.map(result => result[0]))].join(", ");
  } catch (error) {
    console.warn("Active-project query failed", error);
  }

  const requestText = documentMetadata
    ? buildDocumentInstruction(userText, documentMetadata.name)
    : userText;
  const contextualPrompt = `TIER 2 CONTEXT (SYNTHESIS AND LINK SUGGESTIONS ONLY):
- Current Roam Page: [[${pageTitle}]]
- User's Active Projects: ${activeProjects}

USER TEXT:
${requestText}`;
  const parts = [{ text: "SYSTEM:\n" + SYSTEM_PROMPT + "\n\n" + contextualPrompt }, ...mediaParts];
  const payload = { contents: [{ parts }] };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(describeGeminiError(response, data));

    const plan = parseRoamLines(extractGeminiText(data));
    let currentRootUid = null;
    let parentMap = {};
    let rootCount = 0;

    for (let index = 0; index < plan.length; index++) {
      const item = plan[index];

      if (item.level === 0) {
        rootCount += 1;
        if (isReplaceRoot && rootCount === 1) {
          currentRootUid = targetUid;
          window.roamAlphaAPI.updateBlock({ block: { uid: targetUid, string: item.text } });
        } else {
          currentRootUid = window.roamAlphaAPI.util.generateUID();
          window.roamAlphaAPI.createBlock({
            location: { "parent-uid": targetUid, order: "last" },
            block: { uid: currentRootUid, string: item.text }
          });
        }
        parentMap = { 0: currentRootUid };
        continue;
      }

      if (!currentRootUid) throw new Error("Generated note has no root block.");
      const newUid = window.roamAlphaAPI.util.generateUID();
      const parentUid = parentMap[item.level - 1] || currentRootUid;
      window.roamAlphaAPI.createBlock({
        location: { "parent-uid": parentUid, order: "last" },
        block: { uid: newUid, string: item.text }
      });
      parentMap[item.level] = newUid;
    }

    if (isReplaceRoot) {
      const backupUid = window.roamAlphaAPI.util.generateUID();
      window.roamAlphaAPI.createBlock({
        location: { "parent-uid": targetUid, order: "last" },
        block: { uid: backupUid, string: `**🔒 Original Text:** ${userText}` }
      });
    }
    return true;
  } catch (error) {
    alert(`RoamPrompt could not process this input: ${error.message}`);
    return false;
  }
}

async function callStructuredGemini(apiKey, systemInstruction, parts, schema) {
  const payload = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseMimeType: "application/json",
      responseJsonSchema: schema,
      temperature: 0.1
    }
  };
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(describeGeminiError(response, data));
  try {
    return JSON.parse(extractGeminiText(data));
  } catch (error) {
    throw new Error("Gemini returned invalid structured JSON.");
  }
}

function getExistingPermanentNoteTitles() {
  try {
    const results = window.roamAlphaAPI.q(`
      [:find ?rootString
       :where
       [?tag :node/title "PermanentNotes"]
       [?tagBlock :block/refs ?tag]
       [?tagBlock :block/parent ?root]
       [?root :block/string ?rootString]]
    `);
    return [...new Set(results.flatMap(result => {
      const matches = [...result[0].matchAll(/\[\[([^\]]+)\]\]/g)].map(match => match[1]);
      return matches;
    }))].slice(0, 100);
  } catch (error) {
    console.warn("Permanent-note retrieval failed", error);
    return [];
  }
}

async function prepareVerifiedDocument(apiKey, userText, pdfPart, documentMetadata) {
  const extraction = await callStructuredGemini(
    apiKey,
    SOURCE_SYSTEM_INSTRUCTION,
    [
      { text: `Classify this document and extract a verified source model from this PDF. Source filename: ${documentMetadata.name}. User focus: ${userText || "General scholarly digestion"}` },
      pdfPart
    ],
    SOURCE_EXTRACTION_SCHEMA
  );
  extraction.paper.source_file = documentMetadata.name;
  const extractionCheck = validateExtraction(extraction);
  if (!extractionCheck.valid) {
    throw new Error("Source verification failed: " + extractionCheck.errors.join(" "));
  }

  const existingTitles = getExistingPermanentNoteTitles();
  const lockedWorkflow = extraction.paper.document_type === "academic_paper"
    ? "LOCKED WORKFLOW: Create exactly one source-grounded QEC literature note and 3-5 candidate atomic permanent notes. Preserve bibliographic identity, evidence locators, verified key citations, epistemic status, and human review."
    : "LOCKED WORKFLOW: Create one source-grounded document note and up to 3 candidate atomic permanent notes. Preserve provenance, epistemic status, and human review.";
  const pipeline = await callStructuredGemini(
    apiKey,
    ZETTEL_SYSTEM_INSTRUCTION,
    [{
      text: `${lockedWorkflow}
User focus: ${userText || "General scholarly digestion"}
Existing Roam permanent-note titles (the ONLY allowed existing_connections):
${JSON.stringify(existingTitles)}

Verified source model:
${JSON.stringify(extraction)}`
    }],
    ZETTEL_PIPELINE_SCHEMA
  );
  const review = evaluateCandidates(pipeline, extraction, existingTitles);
  return { extraction, pipeline, review };
}

async function insertTreeTransaction(adapter, targetUid, roots) {
  const createdUids = [];
  async function createNode(parentUid, node) {
    const uid = adapter.generateUid();
    await adapter.createBlock(parentUid, uid, typeof node === "string" ? node : node.text);
    createdUids.push(uid);
    if (typeof node !== "string") {
      for (const child of node.children || []) await createNode(uid, child);
    }
  }
  try {
    for (const root of roots) await createNode(targetUid, root);
    return { inserted: createdUids.length, createdUids };
  } catch (error) {
    const rollbackErrors = [];
    for (const uid of [...createdUids].reverse()) {
      try { await adapter.deleteBlock(uid); }
      catch (rollbackError) { rollbackErrors.push({ uid, message: rollbackError.message }); }
    }
    const detail = rollbackErrors.length
      ? ` Rollback was incomplete for ${rollbackErrors.length} block(s).`
      : " All inserted blocks were rolled back.";
    throw new Error(`Roam insertion failed: ${error.message}.${detail}`);
  }
}

async function insertStructuredRoots(targetUid, roots) {
  return insertTreeTransaction({
    generateUid: () => window.roamAlphaAPI.util.generateUID(),
    createBlock: (parentUid, uid, string) => window.roamAlphaAPI.createBlock({
      location: { "parent-uid": parentUid, order: "last" },
      block: { uid, string }
    }),
    deleteBlock: uid => window.roamAlphaAPI.deleteBlock({ block: { uid } })
  }, targetUid, roots);
}

function createCandidateReviewModal(targetUid, result) {
  const overlay = document.createElement("div");
  overlay.id = "roamprompt-review-modal";
  Object.assign(overlay.style, { position: "fixed", inset: "0", backgroundColor: "rgba(0,0,0,0.55)", zIndex: "10000", display: "flex", justifyContent: "center", alignItems: "center" });
  const panel = document.createElement("div");
  Object.assign(panel.style, { width: "760px", maxHeight: "84vh", overflowY: "auto", background: "#fff", borderRadius: "10px", padding: "20px", fontFamily: "sans-serif", boxShadow: "0 12px 30px rgba(0,0,0,.3)" });

  const title = document.createElement("h3");
  title.innerText = "Review permanent-note candidates";
  title.style.marginTop = "0";
  const identity = document.createElement("div");
  identity.innerText = `${result.extraction.paper.document_type.replaceAll("_", " ")} detected · ${result.extraction.paper.title} (${result.extraction.paper.publication_year}) · Study period: ${result.extraction.paper.study_period}`;
  Object.assign(identity.style, { padding: "10px", background: "#eef6f3", borderRadius: "6px", marginBottom: "12px" });
  panel.appendChild(title);
  panel.appendChild(identity);

  const selections = new Set(result.review.accepted.map(candidate => candidate.id));
  const all = [...result.review.accepted, ...result.review.rejected];
  for (const candidate of all) {
    const card = document.createElement("div");
    Object.assign(card.style, { border: "1px solid #d5dce0", borderRadius: "7px", padding: "12px", marginBottom: "10px", background: candidate.accepted ? "#fff" : "#fff4f2" });
    const heading = document.createElement("label");
    Object.assign(heading.style, { display: "flex", gap: "8px", alignItems: "flex-start", fontWeight: "bold" });
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = candidate.accepted;
    checkbox.disabled = !candidate.accepted;
    checkbox.onchange = () => checkbox.checked ? selections.add(candidate.id) : selections.delete(candidate.id);
    const headingText = document.createElement("span");
    headingText.innerText = candidate.title;
    heading.appendChild(checkbox);
    heading.appendChild(headingText);
    const status = document.createElement("div");
    status.innerText = `Epistemic status: ${candidate.epistemic_status}`;
    status.style.margin = "6px 0";
    const claim = document.createElement("div");
    claim.innerText = candidate.claim;
    const evidence = document.createElement("div");
    evidence.innerText = `Evidence: ${candidate.evidence_anchor}`;
    evidence.style.marginTop = "6px";
    card.appendChild(heading);
    card.appendChild(status);
    card.appendChild(claim);
    card.appendChild(evidence);
    if (!candidate.accepted) {
      const reasons = document.createElement("div");
      reasons.innerText = "Rejected: " + candidate.rejection_reasons.join(" ");
      Object.assign(reasons.style, { color: "#b42318", marginTop: "6px" });
      card.appendChild(reasons);
    }
    panel.appendChild(card);
  }

  const controls = document.createElement("div");
  Object.assign(controls.style, { display: "flex", justifyContent: "flex-end", gap: "10px", position: "sticky", bottom: "0", background: "#fff", paddingTop: "10px" });
  const cancel = document.createElement("button");
  cancel.innerText = "Cancel";
  cancel.onclick = () => overlay.remove();
  const insert = document.createElement("button");
  insert.innerText = "Insert approved notes";
  Object.assign(insert.style, { background: "#10a37f", color: "#fff", border: "none", borderRadius: "6px", padding: "9px 14px", fontWeight: "bold" });
  insert.onclick = async () => {
    insert.disabled = true;
    insert.innerText = "Inserting safely...";
    try {
      const roots = renderVerifiedNotes(result.extraction, result.pipeline, [...selections]);
      await insertStructuredRoots(targetUid, roots);
      overlay.remove();
    } catch (error) {
      alert(error.message);
      insert.disabled = false;
      insert.innerText = "Insert approved notes";
    }
  };
  controls.appendChild(cancel);
  controls.appendChild(insert);
  panel.appendChild(controls);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

function createChatModal(apiKey, targetUid, extensionAPI) {
  if (document.getElementById("roamprompt-modal")) return;

  const overlay = document.createElement("div");
  overlay.id = "roamprompt-modal";
  Object.assign(overlay.style, { position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", zIndex: "9999", display: "flex", justifyContent: "center", alignItems: "center" });

  const chatBox = document.createElement("div");
  Object.assign(chatBox.style, { width: "640px", backgroundColor: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "12px", fontFamily: "sans-serif" });

  const title = document.createElement("h3");
  title.innerText = "✨ RoamPrompt: Ambient Assistant";
  title.style.margin = "0";

  const focusLabel = document.createElement("label");
  focusLabel.innerText = "Research focus (optional)";
  focusLabel.style.fontWeight = "bold";
  const textarea = document.createElement("textarea");
  textarea.placeholder = "e.g. Focus on implications for assessment validity, professional expertise, and responsible AI adoption.";
  Object.assign(textarea.style, { width: "100%", height: "140px", resize: "none", padding: "10px", boxSizing: "border-box", fontFamily: "inherit", fontSize: "14px", border: "1px solid #ccc", borderRadius: "6px" });

  const previewContainer = document.createElement("div");
  Object.assign(previewContainer.style, { display: "flex", gap: "8px", flexWrap: "wrap" });

  const documentRow = document.createElement("div");
  Object.assign(documentRow.style, { border: "1px dashed #9aa7b2", borderRadius: "6px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f7f9fa" });
  const documentLabel = document.createElement("span");
  documentLabel.innerText = "Drop one academic PDF here, or";
  const attachBtn = document.createElement("button");
  attachBtn.type = "button";
  attachBtn.innerText = "Attach PDF";
  Object.assign(attachBtn.style, { padding: "7px 12px", cursor: "pointer", border: "1px solid #738694", borderRadius: "5px", background: "#fff" });
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "application/pdf,.pdf";
  fileInput.style.display = "none";
  documentRow.appendChild(documentLabel);
  documentRow.appendChild(attachBtn);
  documentRow.appendChild(fileInput);

  const privacyRow = document.createElement("label");
  Object.assign(privacyRow.style, { display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "12px", lineHeight: "1.4" });
  const privacyConsent = document.createElement("input");
  privacyConsent.type = "checkbox";
  privacyConsent.checked = Boolean(extensionAPI.settings.get("gemini-data-consent"));
  privacyConsent.onchange = () => extensionAPI.settings.set("gemini-data-consent", privacyConsent.checked);
  const privacyText = document.createElement("span");
  privacyText.innerText = "I understand that the selected text, images or PDF and limited Roam context will be sent directly to Google Gemini using my API key.";
  privacyRow.appendChild(privacyConsent);
  privacyRow.appendChild(privacyText);

  const errorText = document.createElement("div");
  Object.assign(errorText.style, { color: "#b42318", fontSize: "13px", minHeight: "18px" });

  const btnContainer = document.createElement("div");
  Object.assign(btnContainer.style, { display: "flex", justifyContent: "flex-end", gap: "10px" });
  const cancelBtn = document.createElement("button");
  cancelBtn.innerText = "Cancel";
  Object.assign(cancelBtn.style, { padding: "8px 14px", cursor: "pointer", border: "none", background: "none" });
  cancelBtn.onclick = () => overlay.remove();
  const submitBtn = document.createElement("button");
  submitBtn.innerText = "Process & Insert";
  Object.assign(submitBtn.style, { backgroundColor: "#10a37f", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" });

  let imageParts = [];
  let pdfAttachment = null;

  const renderPdfPreview = () => {
    const existing = document.getElementById("roamprompt-pdf-preview");
    if (existing) existing.remove();
    if (!pdfAttachment) return;
    const chip = document.createElement("div");
    chip.id = "roamprompt-pdf-preview";
    Object.assign(chip.style, { display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "5px", background: "#e8f5f1", fontSize: "13px" });
    const details = document.createElement("span");
    details.innerText = `📄 ${pdfAttachment.file.name} (${(pdfAttachment.file.size / 1024 / 1024).toFixed(2)} MB)`;
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.innerText = "Remove";
    Object.assign(removeBtn.style, { border: "none", background: "transparent", color: "#8a1c1c", cursor: "pointer" });
    removeBtn.onclick = () => {
      pdfAttachment = null;
      fileInput.value = "";
      chip.remove();
    };
    chip.appendChild(details);
    chip.appendChild(removeBtn);
    previewContainer.appendChild(chip);
  };

  const acceptPdf = async file => {
    errorText.innerText = "";
    const validation = validatePdfDescriptor(file);
    if (!validation.valid) {
      errorText.innerText = validation.error;
      return;
    }
    try {
      pdfAttachment = { file, data: await readFileAsBase64(file) };
      renderPdfPreview();
    } catch (error) {
      pdfAttachment = null;
      errorText.innerText = error.message;
    }
  };

  attachBtn.onclick = () => fileInput.click();
  fileInput.onchange = () => acceptPdf(fileInput.files[0]);
  documentRow.ondragover = event => {
    event.preventDefault();
    documentRow.style.background = "#e8f5f1";
  };
  documentRow.ondragleave = () => { documentRow.style.background = "#f7f9fa"; };
  documentRow.ondrop = event => {
    event.preventDefault();
    documentRow.style.background = "#f7f9fa";
    acceptPdf(event.dataTransfer.files[0]);
  };

  textarea.addEventListener("paste", event => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf("image/") === 0) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = readerEvent => {
          const base64String = readerEvent.target.result.split(",")[1];
          imageParts.push({ inlineData: { data: base64String, mimeType: blob.type } });
          const imgThumb = document.createElement("img");
          imgThumb.src = readerEvent.target.result;
          Object.assign(imgThumb.style, { height: "45px", borderRadius: "4px", border: "1px solid #ddd" });
          previewContainer.appendChild(imgThumb);
        };
        reader.readAsDataURL(blob);
      }
    }
  });

  submitBtn.onclick = async () => {
    errorText.innerText = "";
    const userText = textarea.value.trim();
    if (!userText && imageParts.length === 0 && !pdfAttachment) {
      errorText.innerText = "Enter a note, paste an image, or attach a PDF.";
      return;
    }
    if (!privacyConsent.checked) {
      errorText.innerText = "Confirm the Gemini data-transfer notice before processing.";
      return;
    }
    submitBtn.innerText = pdfAttachment ? "Reading paper..." : "Synthesizing...";
    submitBtn.disabled = true;
    try {
      if (pdfAttachment) {
        const pdfPart = { inlineData: { data: pdfAttachment.data, mimeType: "application/pdf" } };
        const result = await prepareVerifiedDocument(
          apiKey,
          userText,
          pdfPart,
          { name: pdfAttachment.file.name, size: pdfAttachment.file.size }
        );
        overlay.remove();
        createCandidateReviewModal(targetUid, result);
        return;
      }

      const succeeded = await processAndInsertRoamTree(apiKey, userText, targetUid, false, [...imageParts], null);
      if (succeeded) overlay.remove();
      else {
        submitBtn.innerText = "Process & Insert";
        submitBtn.disabled = false;
      }
    } catch (error) {
      errorText.innerText = error.message;
      submitBtn.innerText = "Process & Insert";
      submitBtn.disabled = false;
    }
  };

  btnContainer.appendChild(cancelBtn);
  btnContainer.appendChild(submitBtn);
  chatBox.appendChild(title);
  chatBox.appendChild(focusLabel);
  chatBox.appendChild(textarea);
  chatBox.appendChild(documentRow);
  chatBox.appendChild(previewContainer);
  chatBox.appendChild(privacyRow);
  chatBox.appendChild(errorText);
  chatBox.appendChild(btnContainer);
  overlay.appendChild(chatBox);
  document.body.appendChild(overlay);
  textarea.focus();
}
