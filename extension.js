const EPISTEMIC_STATUSES = [
  "empirical_finding",
  "author_interpretation",
  "reported_event",
  "attributed_statement",
  "contemporary_prediction",
  "reader_synthesis",
  "speculative_hypothesis"
];

const DOCUMENT_TYPES = [
  "academic_paper",
  "report",
  "book",
  "book_chapter",
  "news_article",
  "news_clipping",
  "other_document"
];

const NEWS_DOCUMENT_TYPES = ["news_article", "news_clipping"];

const SOURCE_CLAIM_STATUSES = [
  "empirical_finding",
  "author_interpretation",
  "reported_event",
  "attributed_statement",
  "contemporary_prediction"
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
        limitations: stringArray,
        capture_mode: { type: "string", enum: ["text_pdf", "image_only_scan", "screenshot", "mixed"] },
        publication_name: { type: "string" },
        publication_date: { type: "string" },
        dateline: { type: "string" },
        byline: { type: "string" },
        wire_service: { type: "string" },
        target_region: { type: "string" },
        selection_confidence: { type: "string", enum: ["high", "medium", "low"] },
        competing_headlines: stringArray
      },
      required: ["title", "document_type", "authors", "publication_year", "study_period", "source_file", "research_question", "method", "conclusion", "limitations", "capture_mode", "publication_name", "publication_date", "dateline", "byline", "wire_service", "target_region", "selection_confidence", "competing_headlines"]
    },
    claims: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          statement: { type: "string" },
          epistemic_status: { type: "string", enum: SOURCE_CLAIM_STATUSES },
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
You are the visual source-intake and extraction stage of a provenance-preserving knowledge pipeline.
Classify the document as academic_paper, report, book, book_chapter, news_article, news_clipping, or other_document.
Use book for a complete monograph. Use book_chapter only when the attached source is a single chapter or an excerpt from a larger book.
Use news_article for a text-native news article. Use news_clipping for a scanned, photographed, screenshot, or image-only newspaper or magazine clipping.
Visually inspect every PDF page. A PDF may contain no text layer; read legible text from the rendered page image rather than treating it as empty.
For screenshots and multi-column pages, identify the target article from the user's focus, filename, headline prominence, and column boundaries. Exclude browser controls, advertisements, captions belonging to other items, and neighbouring articles.
Record the target column or page region and list other plausible headlines under competing_headlines. Use low selection_confidence when the intended article remains ambiguous; never merge text from competing articles.
Extract only information explicitly supported by the attached document.
Publication year and study period are different fields and must never be conflated.
Every claim needs a traceable locator such as a section plus printed page, figure, table, or bibliography reference number.
Use the document's printed page number when visible; otherwise use the PDF page number.
For news sources, use reported_event for events described by the article, attributed_statement for claims or quotations attributed to a named person or organisation, and contemporary_prediction for forecasts made at the time. Do not convert a prediction into an established fact.
For academic and general documents, classify source claims as empirical_finding or author_interpretation.
For news sources, populate publication_name, publication_date, dateline, byline, and wire_service only from visible evidence. Use "Not stated" rather than guessing. An agency credit such as UPI is a wire_service, not a personal author.
For news sources, use "Not applicable" for the string fields study_period, research_question, method, and conclusion when the article does not state scholarly equivalents; use an empty limitations array.
For non-news sources, still populate capture_mode and target_region. Use "Not applicable" for news-only string fields that are not visible, high selection_confidence when the source boundary is clear, and an empty competing_headlines array when there is no ambiguity.
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
Empirical findings, author interpretations, reported events, attributed statements, contemporary predictions, reader syntheses, and speculative hypotheses must remain visibly distinct.
Copy every supporting source locator verbatim into evidence_anchor and include its claim ID.
A candidate labelled empirical_finding must cite only empirical source claims.
A candidate labelled author_interpretation must cite at least one author_interpretation source claim.
A candidate labelled reported_event, attributed_statement, or contemporary_prediction must cite at least one source claim with the same status.
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
  requireValue(extraction && extraction.paper, "Missing source metadata.", errors);
  if (!extraction?.paper) return { valid: false, errors };

  requireValue(DOCUMENT_TYPES.includes(extraction.paper.document_type), "Document type is invalid.", errors);
  requireValue(Number.isInteger(extraction.paper.publication_year), "Publication year must be an integer.", errors);
  const isNews = NEWS_DOCUMENT_TYPES.includes(extraction.paper.document_type);
  if (isNews) {
    requireValue(Boolean(extraction.paper.publication_name), "News source lacks a publication name.", errors);
    requireValue(Boolean(extraction.paper.publication_date), "News source lacks a publication date.", errors);
    requireValue(Boolean(extraction.paper.target_region), "News source lacks an article-region locator.", errors);
    requireValue(["text_pdf", "image_only_scan", "screenshot", "mixed"].includes(extraction.paper.capture_mode), "News source capture mode is invalid.", errors);
    requireValue(["high", "medium", "low"].includes(extraction.paper.selection_confidence), "News source selection confidence is invalid.", errors);
    requireValue(Array.isArray(extraction.paper.competing_headlines), "News source competing headlines must be an array.", errors);
    if (extraction.paper.selection_confidence === "low") {
      const alternatives = extraction.paper.competing_headlines?.length
        ? `: ${extraction.paper.competing_headlines.join("; ")}`
        : "";
      errors.push(`The target article is ambiguous${alternatives}. Add the target headline or subject to Research focus and retry.`);
    }
  } else {
    requireValue(Boolean(extraction.paper.study_period), "Study period must be recorded separately.", errors);
  }
  requireValue(Array.isArray(extraction.claims) && extraction.claims.length > 0, "No source claims were extracted.", errors);
  const citations = Array.isArray(extraction.key_citations) ? extraction.key_citations : [];
  requireValue(Array.isArray(extraction.key_citations), "Key citations must be an array.", errors);
  if (extraction.paper.document_type === "academic_paper") {
    requireValue(citations.length >= 3, "Fewer than three verified citations were extracted for an academic paper.", errors);
  }

  const claimIds = new Set();
  for (const claim of extraction.claims || []) {
    requireValue(Boolean(claim.id) && !claimIds.has(claim.id), "Claim IDs must be unique.", errors);
    claimIds.add(claim.id);
    requireValue(SOURCE_CLAIM_STATUSES.includes(claim.epistemic_status), `Invalid source status for ${claim.id}.`, errors);
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
    const citedClaims = (candidate.evidence_claim_ids || []).map(id => sourceClaims.get(id)).filter(Boolean);
    const verifiedEvidenceAnchor = (candidate.evidence_claim_ids || []).map(id => {
      const claim = sourceClaims.get(id);
      return claim ? `[${id}] ${claim.locator}` : `[${id}] Unresolved`;
    }).join("; ");
    if (candidate.epistemic_status === "empirical_finding" && citedClaims.some(claim => claim.epistemic_status !== "empirical_finding")) {
      reasons.push("Empirical candidate relies on a non-empirical source claim.");
    }
    if (candidate.epistemic_status === "author_interpretation" && !citedClaims.some(claim => claim.epistemic_status === "author_interpretation")) {
      reasons.push("Author-interpretation candidate lacks a matching source interpretation.");
    }
    if (["reported_event", "attributed_statement", "contemporary_prediction"].includes(candidate.epistemic_status)
      && citedClaims.some(claim => claim.epistemic_status !== candidate.epistemic_status)) {
      reasons.push(`${candidate.epistemic_status} candidate mixes source claims with different epistemic statuses.`);
    }
    if (seenTitles.has(candidate.title)) reasons.push("Duplicate candidate title.");
    seenTitles.add(candidate.title);
    if ((candidate.existing_connections || []).some(title => !graphTitles.has(title))) reasons.push("Claims a graph connection that was not retrieved.");
    if (candidate.epistemic_status === "speculative_hypothesis" && /proves?|demonstrates?|establishes?/i.test(candidate.claim)) {
      reasons.push("Speculation uses empirical certainty language.");
    }

    const reviewed = {
      ...candidate,
      evidence_anchor: verifiedEvidenceAnchor,
      accepted: reasons.length === 0,
      rejection_reasons: reasons
    };
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
const sourceKey = source => NEWS_DOCUMENT_TYPES.includes(source.document_type)
  ? `${source.publication_name || source.wire_service || "News source"} ${source.publication_date || source.publication_year}: ${source.title}`
  : citationKey(source);

function renderVerifiedNotes(extraction, pipeline, approvedCandidateIds) {
  const paper = extraction.paper;
  const sourcePageKey = sourceKey(paper);
  const approved = new Set(approvedCandidateIds);
  const roots = [];

  const newsSource = NEWS_DOCUMENT_TYPES.includes(paper.document_type);
  const literature = newsSource ? {
    text: `📰 News Source Note: ${link(sourcePageKey)}`,
    children: [
      `Source File:: ${link(paper.source_file)}`,
      `Publication:: ${paper.publication_name}`,
      `Publication Date:: ${paper.publication_date}`,
      `Byline:: ${paper.byline}`,
      `Wire Service:: ${paper.wire_service}`,
      `Dateline:: ${paper.dateline}`,
      `Document Type:: ${paper.document_type}`,
      `Capture Mode:: ${paper.capture_mode}`,
      `Article Region:: ${paper.target_region}`,
      `Tags:: #SourceNotes #NewsClippings ${pipeline.literature_note.topics.map(link).join(" ")}`,
      `Aliases:: ${pipeline.literature_note.aliases.map(link).join(", ")}`,
      { text: "Reported Claims::", children: extraction.claims.map(claim => `[${claim.epistemic_status}] ${claim.statement} — ${claim.locator}`) },
      `Synthesis:: ${pipeline.literature_note.synthesis}`,
      { text: "Open Questions::", children: pipeline.literature_note.open_questions }
    ]
  } : {
    text: `📝 QEC Reading Note: ${link(sourcePageKey)}`,
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
        `Source:: ${link(sourcePageKey)}`,
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
- Treat the attached PDF as the only source for document identity, publication metadata, claims, quotations, dates, methods, results, and limitations.
- A PDF may be an image-only scan or screenshot. Read the visible page image and preserve its layout boundaries.
- For newspaper or magazine pages, isolate the requested or filename-indicated article. Exclude browser controls, advertisements, and neighbouring columns.
- Use current-page and active-project context only for Synthesis::, Connections::, Related Concepts::, and suggested Roam links.
- Never invent a missing field; write "Not stated" or "Not applicable" when necessary.
- Preserve reported quantities exactly and distinguish absolute effects from relative effects.
- Separate source claims, attributed statements, contemporary predictions, and RoamPrompt's later interpretation.
- Include Source File:: [[ATTACHED_FILENAME]] near the top of the source note.
- For academic papers, include Method::, Limitations::, Open Questions::, and 5-8 verified Key Citations:: when the bibliography supports them.
- For news sources, use a News Source Note with publication, issue date, byline or wire service, dateline, article region, and reported claims. Do not manufacture scholarly metadata or bibliography entries.
- Default output is one source note followed by up to 3 Schema Z permanent notes; academic papers may produce 3-5.
- The source note and EACH Zettel must be separate ROOT blocks at indentation level 0.
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
  if (file.type !== "application/pdf") return { valid: false, error: "Only PDF documents are currently supported." };
  if (!file.size) return { valid: false, error: "The selected PDF is empty." };
  if (file.size > MAX_INLINE_PDF_BYTES) {
    return { valid: false, error: "This PDF is larger than the 10 MB inline limit. Large-document upload is not yet supported." };
  }
  return { valid: true, error: null };
}

export function buildDocumentInstruction(userText, fileName) {
  const request = userText.trim() || "Identify the intended source item and create a source-grounded note from this document.";
  return DOCUMENT_GROUNDING_PROMPT.replace("ATTACHED_FILENAME", fileName) + "\n\nUSER REQUEST:\n" + request;
}

function pdfFileName(label, url) {
  const labelledName = String(label || "").trim().split("/").pop();
  if (/\.pdf$/i.test(labelledName)) return labelledName;
  try {
    const decodedPath = decodeURIComponent(new URL(url).pathname);
    const pathName = decodedPath.split("/").pop();
    if (/\.pdf$/i.test(pathName)) return pathName;
  } catch (error) {
    console.warn("Could not derive the attached PDF filename", error);
  }
  return "roam-attachment.pdf";
}

function looksLikePdf(label, url) {
  if (/\.pdf$/i.test(String(label || "").trim())) return true;
  try {
    return /\.pdf(?:$|[?&#])/i.test(decodeURIComponent(url));
  } catch (error) {
    return /\.pdf(?:$|[?&#])/i.test(url);
  }
}

export function findPdfAttachment(blockText) {
  const text = String(blockText || "");
  const component = text.match(/\{\{\s*(?:\[\[)?pdf(?:\]\])?\s*:\s*(https?:\/\/[^}]+?)\s*\}\}/i);
  if (component) return { url: component[1].trim(), name: pdfFileName("", component[1].trim()) };

  const markdownLinks = text.matchAll(/!?\[([^\]]*)\]\((https?:\/\/[^)]+)\)/gi);
  for (const match of markdownLinks) {
    const label = match[1].trim();
    const url = match[2].trim();
    if (looksLikePdf(label, url)) {
      return { url, name: pdfFileName(label, url) };
    }
  }

  const bareUrls = text.match(/https?:\/\/[^\s<>()]+/gi) || [];
  for (const rawUrl of bareUrls) {
    const url = rawUrl.replace(/[.,;]+$/, "");
    if (looksLikePdf("", url)) {
      return { url, name: pdfFileName("", url) };
    }
  }
  return null;
}

export function collectPdfAttachments(blockRows) {
  const attachments = [];
  const seenUrls = new Set();
  for (const row of blockRows || []) {
    const blockUid = Array.isArray(row) ? row[0] : row?.uid;
    const blockText = Array.isArray(row) ? row[1] : row?.string;
    const reference = findPdfAttachment(blockText);
    if (!blockUid || !reference || seenUrls.has(reference.url)) continue;
    seenUrls.add(reference.url);
    attachments.push({ ...reference, blockUid });
  }
  return attachments;
}

async function downloadPdfAttachment(reference) {
  let response;
  try {
    response = await fetch(reference.url);
  } catch (error) {
    throw new Error("The PDF link could not be downloaded from this device. Open the attachment once to confirm access, or use Attach PDF.");
  }
  if (!response.ok) throw new Error(`The attached PDF download failed (HTTP ${response.status}). Open the attachment once to confirm access, or use Attach PDF.`);
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_INLINE_PDF_BYTES) throw new Error("This PDF is larger than the 10 MB inline limit.");
  const blob = await response.blob();
  const mimeType = String(blob.type || "").split(";")[0].toLowerCase();
  if (mimeType && !["application/pdf", "application/octet-stream"].includes(mimeType)) {
    throw new Error(`The focused attachment returned ${mimeType}, not a PDF.`);
  }
  const file = new File([blob], reference.name, { type: "application/pdf" });
  const validation = validatePdfDescriptor(file);
  if (!validation.valid) throw new Error(validation.error);
  return file;
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
export const ROAMPROMPT_COMMAND_LABELS = [
  "Trigger RoamPrompt",
  "RoamPrompt: Open Chat Window",
  "RoamPrompt: Read PDF on Current Page",
  "RoamPrompt: Weekly Review Agent"
];

export const WEEKLY_REVIEW_WINDOW_DAYS = 7;
export const WEEKLY_REVIEW_MAX_ITEMS_PER_TYPE = 50;
export const WEEKLY_REVIEW_DISCLOSURE = [
  "RoamPrompt Weekly Review",
  "",
  "Purpose: create a reviewable weekly report that groups recent quote material, reproduces open tasks for migration, and drafts a short synthesis.",
  "",
  "Setup: add [[Quotes]] to quote blocks and use Roam's open [[TODO]] task syntax. [[Wisdom & Quotes]] is an optional marker for quotes you have already curated; those blocks are excluded.",
  "",
  "Why Gemini receives the entries: semantic grouping and synthesis require the language model to read the selected block strings. This analysis is not performed locally.",
  "",
  "Data sent: up to 50 newest [[Quotes]] block strings and 50 newest open [[TODO]] block strings created during the past 7 days, using your Gemini API key.",
  "",
  "Destination: the generated report replaces the Roam bullet currently in focus. Original Quote and TODO blocks remain where they are; RoamPrompt does not automatically move them to other pages.",
  "",
  "Continue?"
].join("\n");

export function selectRecentWeeklyItems(rows, since, limit = WEEKLY_REVIEW_MAX_ITEMS_PER_TYPE) {
  return (rows || [])
    .map(result => result?.[0])
    .filter(block => typeof block?.string === "string" && block.string.trim() && block["create-time"] >= since)
    .sort((left, right) => right["create-time"] - left["create-time"])
    .slice(0, limit)
    .map(block => block.string);
}

export function chooseInsertionTargetUid(preferredUid, fallbackUids, targetExists) {
  for (const uid of [preferredUid, ...(fallbackUids || [])]) {
    if (typeof uid === "string" && uid.trim() && targetExists(uid)) return uid;
  }
  return "";
}

function roamTargetExists(uid) {
  try {
    return Boolean(window.roamAlphaAPI.pull("[:block/uid]", [":block/uid", uid]));
  } catch (error) {
    console.warn("Could not validate Roam insertion target", error);
    return false;
  }
}

function resolveCurrentInsertionTargetUid(preferredUid = "") {
  const focusedUid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"] || "";
  const openUid = window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid() || "";
  const todayUid = window.roamAlphaAPI.util?.dateToPageUid?.(new Date()) || "";
  return chooseInsertionTargetUid(preferredUid, [focusedUid, openUid, todayUid], roamTargetExists);
}

function requireExistingInsertionTarget(uid) {
  if (!roamTargetExists(uid)) {
    throw new Error("The original Roam insertion target is no longer available. Close this review, click the destination page or block, and run RoamPrompt again.");
  }
  return uid;
}

function getBlockString(blockUid) {
  if (!blockUid) return "";
  try {
    const query = `[:find (pull ?b [:block/string]) :where [?b :block/uid "${blockUid}"]]`;
    return window.roamAlphaAPI.q(query)?.[0]?.[0]?.string || "";
  } catch (error) {
    console.warn("Could not read the candidate PDF block", error);
    return "";
  }
}

async function openChatForTarget(extensionAPI, targetUid) {
  const apiKey = extensionAPI.settings.get("gemini-api-key");
  if (!apiKey) { alert("Please set your Gemini API Key in Settings."); return; }
  if (!extensionAPI.settings.get("gemini-data-consent")) { alert("Enable Gemini data transfer in RoamPrompt Settings before processing content."); return; }

  const resolvedTargetUid = resolveCurrentInsertionTargetUid(targetUid);
  if (!resolvedTargetUid) {
    alert("RoamPrompt could not find a valid insertion destination. Open a Roam page or click inside a block, then try again.");
    return;
  }

  let attachedPdf = null;
  const pdfReference = findPdfAttachment(getBlockString(resolvedTargetUid));
  if (pdfReference) {
    try {
      attachedPdf = await downloadPdfAttachment(pdfReference);
    } catch (error) {
      alert(`RoamPrompt could not load the PDF attached to this block: ${error.message}`);
      return;
    }
  }
  createChatModal(apiKey, resolvedTargetUid, extensionAPI, attachedPdf);
}

function containingPageUid(candidateUid) {
  if (!candidateUid) return "";
  const pageResult = window.roamAlphaAPI.q(
    `[:find ?pageUid :where [?b :block/uid "${candidateUid}"] [?b :block/page ?p] [?p :block/uid ?pageUid]]`
  );
  if (pageResult?.[0]?.[0]) return pageResult[0][0];
  const pageEntity = window.roamAlphaAPI.q(
    `[:find ?uid :where [?p :block/uid "${candidateUid}"] [?p :node/title] [?p :block/uid ?uid]]`
  );
  return pageEntity?.[0]?.[0] || "";
}

export function chooseCurrentPageUid(openUid, focusedUid, todayUid, resolvePageUid) {
  for (const candidateUid of [focusedUid, openUid]) {
    const pageUid = resolvePageUid(candidateUid);
    if (pageUid) return pageUid;
  }
  return todayUid || "";
}

function findPdfAttachmentsOnPage(openUid, focusedUid) {
  try {
    const todayUid = window.roamAlphaAPI.util?.dateToPageUid?.(new Date()) || "";
    const pageUid = chooseCurrentPageUid(openUid, focusedUid, todayUid, containingPageUid);
    if (!pageUid) return [];
    const pageRows = window.roamAlphaAPI.q(
      `[:find ?uid ?string :where [?p :block/uid "${pageUid}"] [?b :block/page ?p] [?b :block/uid ?uid] [?b :block/string ?string]]`
    ) || [];
    const descendantRows = window.roamAlphaAPI.q(
      `[:find ?uid ?string :where [?p :block/uid "${pageUid}"] [?b :block/parents ?p] [?b :block/uid ?uid] [?b :block/string ?string]]`
    ) || [];
    return collectPdfAttachments([...pageRows, ...descendantRows]);
  } catch (error) {
    console.warn("Could not scan the current page for PDF attachments", error);
    return [];
  }
}

function createPdfPicker(attachments, extensionAPI) {
  document.getElementById("roamprompt-pdf-picker")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "roamprompt-pdf-picker";
  Object.assign(overlay.style, { position: "fixed", inset: "0", backgroundColor: "rgba(0,0,0,0.5)", zIndex: "10000", display: "flex", justifyContent: "center", alignItems: "center" });
  const panel = document.createElement("div");
  Object.assign(panel.style, { width: "520px", maxWidth: "90vw", maxHeight: "75vh", overflowY: "auto", background: "#fff", borderRadius: "10px", padding: "20px", fontFamily: "sans-serif", boxShadow: "0 12px 30px rgba(0,0,0,.3)" });
  const title = document.createElement("h3");
  title.innerText = "Choose a PDF to read";
  title.style.marginTop = "0";
  panel.appendChild(title);
  for (const attachment of attachments) {
    const button = document.createElement("button");
    button.type = "button";
    button.innerText = `📄 ${attachment.name}`;
    Object.assign(button.style, { display: "block", width: "100%", marginBottom: "8px", padding: "10px", textAlign: "left", border: "1px solid #cad3d8", borderRadius: "6px", background: "#f7f9fa", cursor: "pointer" });
    button.onclick = async () => {
      overlay.remove();
      await openChatForTarget(extensionAPI, attachment.blockUid);
    };
    panel.appendChild(button);
  }
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.innerText = "Cancel";
  Object.assign(cancel.style, { float: "right", marginTop: "8px", padding: "8px 12px" });
  cancel.onclick = () => overlay.remove();
  panel.appendChild(cancel);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

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
          description: "Allow RoamPrompt to send selected content and disclosed workflow context directly to Google Gemini. Weekly Review separately confirms and sends at most 50 recent Quotes and 50 recent open TODO block strings.",
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
      callback: async () => {
        const focusedBlock = window.roamAlphaAPI.ui.getFocusedBlock();
        const targetUid = resolveCurrentInsertionTargetUid(focusedBlock?.["block-uid"] || "");
        if (!targetUid) {
          alert("RoamPrompt could not find a valid insertion destination. Open a Roam page or click inside a block, then try again.");
          return;
        }
        await openChatForTarget(extensionAPI, targetUid);
      }
    });

    // TOOL 3: CURRENT-PAGE PDF READER
    extensionAPI.ui.commandPalette.addCommand({
      label: "RoamPrompt: Read PDF on Current Page",
      callback: async () => {
        const openUid = window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
        const focusedUid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
        const attachments = findPdfAttachmentsOnPage(openUid, focusedUid);
        if (!attachments.length) {
          alert("RoamPrompt found no PDF attachment on the current page.");
          return;
        }
        if (attachments.length === 1) {
          await openChatForTarget(extensionAPI, attachments[0].blockUid);
          return;
        }
        createPdfPicker(attachments, extensionAPI);
      }
    });

    // TOOL 4: WEEKLY REVIEW AGENT
    extensionAPI.ui.commandPalette.addCommand({
      label: "RoamPrompt: Weekly Review Agent",
      callback: async () => {
        const apiKey = extensionAPI.settings.get("gemini-api-key");
        if (!apiKey) { alert("Please set your Gemini API Key in Settings."); return; }
        if (!extensionAPI.settings.get("gemini-data-consent")) { alert("Enable Gemini data transfer in RoamPrompt Settings before processing content."); return; }

        const focusedBlock = window.roamAlphaAPI.ui.getFocusedBlock();
        if (focusedBlock == null) { alert("Please click inside a bullet point on your Daily Notes page to run the Weekly Review."); return; }
        const blockUid = focusedBlock["block-uid"];
        if (!confirm(WEEKLY_REVIEW_DISCLOSURE)) return;

        const originalText = getBlockString(blockUid);
        try {
          await window.roamAlphaAPI.updateBlock({"block": {"uid": blockUid, "string": "⏳ AI Agent is scanning your recent Quotes and TODOs..."}});
        } catch (error) {
          alert(`Weekly Review could not update its destination block: ${error.message}`);
          return;
        }
        const oneWeekAgo = Date.now() - (WEEKLY_REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000);

        // 1. Datalog: Find recent Unprocessed Quotes
        let unprocessedQuotes = [];
        try {
          let quotesQuery = window.roamAlphaAPI.q(`
            [:find (pull ?b [:block/string :block/create-time])
             :where
             [?b :block/refs ?qPage] [?qPage :node/title "Quotes"]
             [?b :block/create-time ?created]
             [(>= ?created ${oneWeekAgo})]
             (not [?b :block/refs ?wqPage] [?wqPage :node/title "Wisdom & Quotes"])]
          `);
          unprocessedQuotes = selectRecentWeeklyItems(quotesQuery, oneWeekAgo);
        } catch(e) { console.warn("Quote query failed", e); }

        // 2. Datalog: Find Open TODOs from the last 7 days
        let openTodos = [];
        try {
          let todoQuery = window.roamAlphaAPI.q(`
            [:find (pull ?b [:block/string :block/create-time])
             :where
             [?b :block/refs ?todoPage] [?todoPage :node/title "TODO"]
             [?b :block/create-time ?created]
             [(>= ?created ${oneWeekAgo})]
             (not [?b :block/refs ?donePage] [?donePage :node/title "DONE"])]
          `);
          openTodos = selectRecentWeeklyItems(todoQuery, oneWeekAgo);
        } catch(e) { console.warn("TODO query failed", e); }

        const weeklyPrompt = `
You are a Weekly Review Agent. Analyze the user's data from the past 7 days and output a strictly formatted reflection.
Format the output EXACTLY like this using tabs for indentation:

📅 Weekly Reflection & Migration Report
	💎 CURATED MASTERPIECES (Review, then optionally move into [[Wisdom & Quotes]])
		[Group unprocessed quotes under appropriate thematic headers: Philosophy & Governance, Execution & Strategy, Cognition & Learning, or AI & Systems]
		💡 Quote: [[Exact quoted expression in its original language and script]]
			Verbatim:: "[The exact verbatim quote text]"
			Author:: [[Author Name]]
			Source:: [[Source Name]]
			Tags:: #Quotes [Relevant Tags]
			Related Concepts:: [Suggest 2 active project links or concepts based on the quote]
			Takeaway:: [1-sentence synthesis of why this matters]
	🎯 Tasks to Review and Migrate
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

          const plan = parseRoamLines(extractGeminiText(data));
          requireExistingInsertionTarget(blockUid);
          await insertPlanTransaction(createRoamWriteAdapter(), blockUid, plan, { replaceRoot: true, originalText, preserveOriginal: false });
        } catch (error) {
          try {
            if (roamTargetExists(blockUid)) await window.roamAlphaAPI.updateBlock({"block": {"uid": blockUid, "string": originalText}});
          } catch (restoreError) {
            console.error("Weekly Review could not restore its destination block", restoreError);
          }
          alert(`Weekly Review failed: ${error.message}`);
        }
      }
    });
  },
  onunload: () => {
    document.getElementById("roamprompt-modal")?.remove();
    document.getElementById("roamprompt-review-modal")?.remove();
    document.getElementById("roamprompt-pdf-picker")?.remove();
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

  if (!roamTargetExists(targetUid)) {
    alert("The original Roam insertion target is no longer available. Close this window, click the destination page or block, and run RoamPrompt again.");
    return false;
  }
  const resolvedTargetUid = targetUid;

  let pageTitle = "Unknown Page";
  try {
    const blockQuery = window.roamAlphaAPI.q(`[:find ?title :where [?b :block/uid "${resolvedTargetUid}"] [?b :block/page ?p] [?p :node/title ?title]]`);
    if (blockQuery.length > 0) pageTitle = blockQuery[0][0];
    else {
      const pageQuery = window.roamAlphaAPI.q(`[:find ?title :where [?p :block/uid "${resolvedTargetUid}"] [?p :node/title ?title]]`);
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
    requireExistingInsertionTarget(resolvedTargetUid);
    await insertPlanTransaction(createRoamWriteAdapter(), resolvedTargetUid, plan, {
      replaceRoot: isReplaceRoot,
      originalText: userText,
      preserveOriginal: isReplaceRoot
    });
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
  const focus = userText || "General source capture. Prefer the article or item indicated by the filename and the visually dominant headline.";
  const sourceParts = [
    { text: `Classify this document and extract a verified source model from this PDF. Source filename: ${documentMetadata.name}. User focus: ${focus}` },
    pdfPart
  ];
  let extraction;
  let extractionRetried = false;
  try {
    extraction = await callStructuredGemini(apiKey, SOURCE_SYSTEM_INSTRUCTION, sourceParts, SOURCE_EXTRACTION_SCHEMA);
  } catch (error) {
    if (!/invalid structured JSON/i.test(error.message)) throw error;
    extractionRetried = true;
    extraction = await callStructuredGemini(
      apiKey,
      SOURCE_SYSTEM_INSTRUCTION,
      [{ text: "The first response was not valid structured JSON. Reinspect the same visual document and return only schema-valid JSON." }, ...sourceParts],
      SOURCE_EXTRACTION_SCHEMA
    );
  }
  if (extraction?.paper) extraction.paper.source_file = documentMetadata.name;
  let extractionCheck = validateExtraction(extraction);
  const ambiguousSelection = extractionCheck.errors.some(message => /target article is ambiguous/.test(message));
  if (!extractionCheck.valid && !ambiguousSelection && !extractionRetried) {
    extraction = await callStructuredGemini(
      apiKey,
      SOURCE_SYSTEM_INSTRUCTION,
      [
        { text: `The first extraction failed source verification: ${extractionCheck.errors.join(" ")} Reinspect the original page, keep neighbouring columns separate, and repair only from visible evidence.` },
        ...sourceParts
      ],
      SOURCE_EXTRACTION_SCHEMA
    );
    if (extraction?.paper) extraction.paper.source_file = documentMetadata.name;
    extractionCheck = validateExtraction(extraction);
  }
  if (!extractionCheck.valid) {
    throw new Error("Source verification failed: " + extractionCheck.errors.join(" "));
  }

  const existingTitles = getExistingPermanentNoteTitles();
  const lockedWorkflow = extraction.paper.document_type === "academic_paper"
    ? "LOCKED WORKFLOW: Create exactly one source-grounded QEC literature note and 3-5 candidate atomic permanent notes. Preserve bibliographic identity, evidence locators, verified key citations, epistemic status, and human review."
    : NEWS_DOCUMENT_TYPES.includes(extraction.paper.document_type)
      ? "LOCKED WORKFLOW: Create exactly one news source note and up to 3 candidate atomic permanent notes. Preserve publication identity, issue date, byline or wire-service attribution, dateline, article-region and paragraph locators, source-claim status, and human review. Keep reported events, attributed statements, and contemporary predictions distinct."
      : "LOCKED WORKFLOW: Create one source-grounded document note and up to 3 candidate atomic permanent notes. Preserve provenance, epistemic status, and human review.";
  const pipeline = await callStructuredGemini(
    apiKey,
    ZETTEL_SYSTEM_INSTRUCTION,
    [{
      text: `${lockedWorkflow}
User focus: ${focus}
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
  if (typeof targetUid !== "string" || !targetUid.trim()) throw new Error("Roam insertion target is missing.");
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

export async function insertPlanTransaction(adapter, targetUid, plan, options = {}) {
  if (typeof targetUid !== "string" || !targetUid.trim()) throw new Error("Roam insertion target is missing.");
  const { replaceRoot = false, originalText = "", preserveOriginal = false } = options;
  const createdUids = [];
  let rootUpdated = false;
  let currentRootUid = null;
  let parentMap = {};
  let rootCount = 0;

  try {
    for (const item of plan) {
      if (item.level === 0) {
        rootCount += 1;
        if (replaceRoot && rootCount === 1) {
          currentRootUid = targetUid;
          await adapter.updateBlock(targetUid, item.text);
          rootUpdated = true;
        } else {
          currentRootUid = adapter.generateUid();
          await adapter.createBlock(targetUid, currentRootUid, item.text);
          createdUids.push(currentRootUid);
        }
        parentMap = { 0: currentRootUid };
        continue;
      }

      if (!currentRootUid) throw new Error("Generated note has no root block.");
      const uid = adapter.generateUid();
      const parentUid = parentMap[item.level - 1] || currentRootUid;
      await adapter.createBlock(parentUid, uid, item.text);
      createdUids.push(uid);
      parentMap[item.level] = uid;
    }

    if (replaceRoot && preserveOriginal) {
      const backupUid = adapter.generateUid();
      await adapter.createBlock(targetUid, backupUid, `**🔒 Original Text:** ${originalText}`);
      createdUids.push(backupUid);
    }
    return { inserted: createdUids.length, createdUids, rootUpdated };
  } catch (error) {
    const rollbackErrors = [];
    for (const uid of [...createdUids].reverse()) {
      try { await adapter.deleteBlock(uid); }
      catch (rollbackError) { rollbackErrors.push({ uid, message: rollbackError.message }); }
    }
    if (rootUpdated) {
      try { await adapter.updateBlock(targetUid, originalText); }
      catch (rollbackError) { rollbackErrors.push({ uid: targetUid, message: rollbackError.message }); }
    }
    const detail = rollbackErrors.length
      ? ` Rollback was incomplete for ${rollbackErrors.length} operation(s).`
      : " All changes were rolled back.";
    throw new Error(`Roam insertion failed: ${error.message}.${detail}`);
  }
}

function createRoamWriteAdapter() {
  return {
    generateUid: () => window.roamAlphaAPI.util.generateUID(),
    createBlock: (parentUid, uid, string) => window.roamAlphaAPI.createBlock({
      location: { "parent-uid": parentUid, order: "last" },
      block: { uid, string }
    }),
    updateBlock: (uid, string) => window.roamAlphaAPI.updateBlock({ block: { uid, string } }),
    deleteBlock: uid => window.roamAlphaAPI.deleteBlock({ block: { uid } })
  };
}

async function insertStructuredRoots(targetUid, roots) {
  requireExistingInsertionTarget(targetUid);
  return insertTreeTransaction(createRoamWriteAdapter(), targetUid, roots);
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
  const source = result.extraction.paper;
  identity.innerText = NEWS_DOCUMENT_TYPES.includes(source.document_type)
    ? `${source.document_type.replaceAll("_", " ")} detected · ${source.publication_name} · ${source.publication_date} · ${source.title} · Region: ${source.target_region}`
    : `${source.document_type.replaceAll("_", " ")} detected · ${source.title} (${source.publication_year}) · Study period: ${source.study_period}`;
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
      await insertStructuredRoots(requireExistingInsertionTarget(targetUid), roots);
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

function createChatModal(apiKey, targetUid, extensionAPI, initialPdf = null) {
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
  documentLabel.innerText = "Drop one supported PDF here, or";
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
    submitBtn.innerText = pdfAttachment ? "Reading document..." : "Synthesizing...";
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
  if (initialPdf) acceptPdf(initialPdf);
  textarea.focus();
}
