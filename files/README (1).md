# EoOS Index 2026 Chatbot Data — Read Me First

## Quick correction on terminology
LangChain doesn't "train" the OpenAI model itself — OpenAI's models stay frozen. What LangChain
gives you is **RAG (Retrieval-Augmented Generation)**: your report gets split into chunks,
each chunk is turned into an embedding vector, and stored in a vector database. At query time,
LangChain retrieves the most relevant chunks and stuffs them into the prompt so the LLM answers
*grounded* in the EoOS report instead of guessing. That's almost certainly what you want for a
"chatbot for the report" — it's cheaper, more accurate, and instantly updatable (no retraining
needed if the report changes).

If you specifically wanted OpenAI fine-tuning instead (a different, rarely-needed approach for
this use case), say so and the data would need reshaping into `{"messages": [...]}` format —
happy to do that too, but RAG is the right default here.

## What's in this package

**`eoos_chunks.jsonl`** — 164 knowledge chunks extracted from the full 212-page report
(`Ease_of_Operating_Schools_Index_2026_CCS.pdf`), cleaned of running headers/footers. This is
what you embed and load into your vector store. Each line is one JSON object:

```json
{
  "id": "eoos2026_chunk_072",
  "source": "The Ease of Operating Schools (EoOS) Index 2026 - Centre for Civil Society",
  "section": "State Profiles (State-wise Scorecards)",
  "approx_pdf_page_range": [91, 92],
  "state": "Bihar",
  "text": "Bihar EoOS Index 2026 - State Profile SCORECARD ..."
}
```

- `section` tags which chapter/part of the report the chunk came from (Front Matter, each of the
  10 chapters, State Profiles, Annexures).
- `state` is only present on the ~97 chunks that fall inside a specific state's scorecard page
  (all 30 states/UTs covered) — useful if you want to let users filter or filter-boost retrieval
  by state (e.g., metadata filtering in Pinecone/Chroma/FAISS).
- `approx_pdf_page_range` is an approximate 1-indexed PDF page range for citation/"see page X"
  purposes — treat it as approximate, since layout-based extraction can shift line counts on
  dense tables.

**`eoos_qa_pairs.jsonl`** — 31 hand-verified Q&A pairs covering the report's core facts
(rankings, methodology, domains/indicators, limitations, state scores). Two uses:
1. **Evaluation set** — after you build the RAG pipeline, run these questions through it and
   check the answers match, to catch retrieval/prompting bugs before launch.
2. **Few-shot examples** — drop 3-5 of these into your system prompt to show the model the tone
   and precision you want (short, cited, no invented numbers).

## Known limitation to flag
The report is two-column laid out in the original PDF, and text extraction occasionally
interleaves the two columns mid-sentence on dense pages (mostly in the narrative chapters, not
the tables). It doesn't break the facts, but a chunk's prose can read slightly choppy. This
is normal for PDF-to-text extraction and won't meaningfully hurt embedding/retrieval quality —
if you want cleaner prose, the fix is manual proofreading of just the ~25 narrative chapter
chunks (state-profile scorecards are mostly tabular and unaffected).

## Suggested next steps on your end
1. Load `eoos_chunks.jsonl` into a LangChain `DocumentLoader` (e.g. `JSONLoader`), one
   `Document` per line, with `metadata = {section, state, source, approx_pdf_page_range}`.
2. Embed with `OpenAIEmbeddings` and store in a vector DB (Chroma is the simplest to start).
3. Build a `RetrievalQA` or LCEL chain with a system prompt instructing the model to answer only
   from retrieved context and say "not covered in the report" when it doesn't know.
4. Run `eoos_qa_pairs.jsonl` through the chain as your first eval pass.

## Update: Comparative Analysis Spreadsheet (CSV) added

You uploaded `Comparative_Analysis_Spreadsheet_-_EoOS_Index_2026_-_June_11__2026_-_Analysis.csv` —
this is the raw scoring matrix behind the report (all 30 states x 164 sub-indicators x 6 domains).
It's now parsed into two more files:

**`eoos_scoring_data.jsonl`** — 4,920 records, one per (state, sub-indicator) pair. Each has both
structured fields (`domain`, `indicator`, `sub_indicator`, `state`, `response`, `score`,
`scoring_rule`) AND a pre-written natural-language `text` field, e.g.:

> "In Bihar, under the domain 'DOMAIN 2: Ease of Regulatory Compliance' (indicator: Compliances
> during School Establishment), for the sub-indicator 'Requirement of NoC from Local
> Govt./Authority', the recorded response is 'Not Mentioned' (score: 0). Scoring rule: Yes=0,
> No=1, Maybe=0.5, Not Mentioned=0."

This is what lets your chatbot answer granular questions like "does Karnataka require an NoC to
establish a school?" — the report PDF chunks only have narrative summaries, not this level of
detail per sub-indicator.

**`eoos_scoring_summaries.jsonl`** — 870 records: domain-level and indicator-level average scores
per state (0-1 normalised scale), e.g. "Bihar's average score for the indicator 'Regulatory
Transparency' is 0.68." Useful for comparison questions ("which domain is Odisha weakest in?").

Load both alongside `eoos_chunks.jsonl` into the same vector store — same embedding/retrieval
pipeline, just more documents.

## On "make the chatbot know everything about ccs.in and studentfirst.in"

I checked both sites directly. Important reality check before you point a crawler at them:

- **studentfirst.in** is a JS-rendered interactive dashboard (state rankings, live weightage
  customization) — there's essentially no static/crawlable text content beyond the app shell.
  Its actual "knowledge" *is* the EoOS report + this scoring CSV, which you already have fully
  covered in the three JSONL files above. There isn't much more to scrape here.
- **ccs.in** is a real content-rich site — About, programs (education/livelihood/governance),
  research library, blog posts, team pages. It doesn't have an easily discoverable sitemap, so
  getting "everything in depth" here properly needs an actual crawler script (follow internal
  links from the homepage/nav, respect robots.txt, extract each page's main text, chunk it the
  same way as the PDF), not one-off page fetches — a handful of fetches would only get you the
  homepage and whatever it happens to link to.

Say the word and I'll write you a Python crawler script (requests + BeautifulSoup) that walks
ccs.in and outputs a new JSONL in the same schema as `eoos_chunks.jsonl` — you (or Antigravity)
can run it locally and re-run it whenever the site updates.

