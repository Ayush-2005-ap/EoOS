import os
import json
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from supabase.client import Client, create_client

load_dotenv()

# Setup Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

def main():
    # Clear existing documents to avoid duplicates
    print("Clearing existing documents from Supabase...")
    try:
        # Delete everything where content is not null (which is all rows)
        supabase.table("documents").delete().neq("content", "never_matches_anything").execute()
    except Exception as e:
        print(f"Note: Could not clear table automatically: {e}")

    files_to_load = [
        "../files/eoos_chunks.jsonl",
        "../files/eoos_scoring_data.jsonl",
        "../files/eoos_scoring_summaries.jsonl",
        "../files/eoos_qa_pairs.jsonl"
    ]
    
    docs = []
    for file_path in files_to_load:
        if not os.path.exists(file_path):
            print(f"Warning: {file_path} not found.")
            continue
            
        print(f"Loading {file_path}...")
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                record = json.loads(line)
                
                # Determine content
                if "text" in record:
                    content = record["text"]
                elif "question" in record and "answer" in record:
                    content = f"Q: {record['question']}\nA: {record['answer']}"
                else:
                    content = str(record)
                    
                # Determine metadata
                metadata = {}
                if "source" in record: metadata["source"] = record["source"]
                if "section" in record: metadata["section"] = record["section"]
                if "approx_pdf_page_range" in record: metadata["approx_pdf_page_range"] = record["approx_pdf_page_range"]
                if "state" in record: metadata["state"] = record["state"]
                if "domain" in record: metadata["domain"] = record["domain"]
                if "indicator" in record: metadata["indicator"] = record["indicator"]
                if "sub_indicator" in record: metadata["sub_indicator"] = record["sub_indicator"]
                
                docs.append(Document(page_content=content, metadata=metadata))
                
    print(f"Loaded {len(docs)} documents in total.")

    print("Generating embeddings and storing in Supabase...")
    embeddings = OpenAIEmbeddings()
    
    # Insert documents into Supabase vector store
    SupabaseVectorStore.from_documents(
        docs,
        embeddings,
        client=supabase,
        table_name="documents",
        query_name="match_documents"
    )
    
    print("Successfully ingested all documents into Supabase!")

if __name__ == "__main__":
    main()
