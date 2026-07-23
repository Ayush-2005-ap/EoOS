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

Say the word if you want the actual LangChain ingestion + chatbot code — happy to write it.
