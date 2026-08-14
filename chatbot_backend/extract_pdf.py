import os
import json
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

pdf_path = "../client/public/EoOS_Report_2026.pdf"
output_path = "../files/eoos_chunks.jsonl"

print(f"Loading {pdf_path}...")
loader = PyPDFLoader(pdf_path)
documents = loader.load()

print(f"Loaded {len(documents)} pages.")

print("Chunking documents...")
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    is_separator_regex=False,
)
chunks = text_splitter.split_documents(documents)
print(f"Created {len(chunks)} chunks.")

print(f"Writing to {output_path}...")
with open(output_path, "w", encoding="utf-8") as f:
    for i, chunk in enumerate(chunks):
        record = {
            "id": f"eoos2026_chunk_{i:03d}",
            "text": chunk.page_content,
            "source": "The Ease of Operating Schools (EoOS) Index 2026 - Centre for Civil Society",
            "approx_pdf_page_range": [chunk.metadata.get("page", 0) + 1]
        }
        f.write(json.dumps(record) + "\n")

print("Done extracting!")
