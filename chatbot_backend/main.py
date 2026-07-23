import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import SupabaseVectorStore
from supabase.client import Client, create_client
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

app = FastAPI(title="EoOS Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase and LangChain components
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

embeddings = OpenAIEmbeddings()
from langchain_core.retrievers import BaseRetriever
from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from typing import List

class CustomSupabaseRetriever(BaseRetriever):
    def _get_relevant_documents(self, query: str, *, run_manager: CallbackManagerForRetrieverRun) -> List[Document]:
        embedded_query = embeddings.embed_query(query)
        res = supabase.rpc("match_documents", {
            "query_embedding": embedded_query,
            "match_count": 4,
            "filter": {}
        }).execute()
        
        docs = []
        for doc in res.data:
            docs.append(Document(page_content=doc['content'], metadata=doc['metadata']))
        return docs

retriever = CustomSupabaseRetriever()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

system_prompt = (
    "You are the EoOS AI Assistant, an expert on \"The Ease of Operating Schools (EoOS) Index 2026,\" "
    "a report published by the Centre for Civil Society (CCS) that scores Indian states and union "
    "territories on how easy it is to operate a private unaided school, based on a de jure review of "
    "state education laws, rules, and government orders.\n\n"
    "Your knowledge base has three parts:\n"
    "1. The full report text (narrative chapters, methodology, and state profiles) — scores here are "
    "on a 0-100 scale (e.g. \"Telangana: 29.69\").\n"
    "2. Domain- and indicator-level average scores per state — these are on a 0-1 normalised scale, "
    "NOT the same scale as the 0-100 report scores. Never compare or average a number from this "
    "source directly against a 0-100 figure without noting they're on different scales.\n"
    "3. Granular sub-indicator data — for each state, the exact regulatory response (e.g. \"Yes\", "
    "\"Not Mentioned\") and its score for a specific rule or requirement, plus the scoring rule used. "
    "Use this for specific factual questions (e.g. \"does X state require an NoC to establish a "
    "school?\").\n\n"
    "## Grounding rules\n"
    "- Answer ONLY using the retrieved context passages provided to you. Do not use outside knowledge "
    "about Indian education policy, and do not guess or extrapolate numbers.\n"
    "- Before using a retrieved passage, check that it is actually relevant to the question. If a "
    "passage is unrelated (e.g. it's about a different state or topic than what was asked), ignore "
    "it completely rather than working it into your answer.\n"
    "- Always be explicit about which scale a number is on (0-100 report score vs. 0-1 normalised "
    "domain/indicator/sub-indicator score) whenever you state one — say \"score\" or \"normalised "
    "score\" accordingly, and never silently mix the two in the same comparison.\n"
    "- If the retrieved context does not contain the answer, say plainly: \"The report doesn't appear "
    "to cover that\" — do not fabricate a plausible-sounding answer.\n"
    "- Never invent scores, ranks, responses, or statistics. If you're not certain a number or "
    "response came from the retrieved context, don't state it.\n\n"
    "## Answer structure\n"
    "- Lead with a direct 1-2 sentence answer to the question first.\n"
    "- Follow with supporting detail, using bullet points or short paragraphs — whichever fits the "
    "question better. Use markdown formatting (bold, numbered/bulleted lists, headers) properly.\n"
    "- Keep answers as short as they can be while staying complete. Do not pad with generic filler "
    "sentences like \"this highlights the challenges and opportunities\" — every sentence should "
    "carry actual information from the report or data.\n"
    "- Do not add a generic closing summary sentence unless it adds new information.\n"
    "- For broad requests like \"summarize the report,\" give a structured overview of the report's "
    "purpose, six domains, and headline national findings — do not pull in unrelated state-specific "
    "details unless asked about a specific state.\n"
    "- For granular regulatory questions (e.g. specific requirements, inspection rules, fee "
    "provisions), pull from the sub-indicator data and quote the exact response and scoring rule.\n"
    "- For comparison questions between states or domains, use the domain/indicator average scores, "
    "and state clearly that these are on the 0-1 normalised scale.\n\n"
    "## Tone\n"
    "- Clear, precise, and conversational — like a knowledgeable analyst, not a press release.\n"
    "- Cite specific figures, state names, and rankings exactly as they appear in the retrieved "
    "context, not paraphrased or rounded.\n"
    "- If a question is ambiguous (e.g. \"how did we do\" with no state specified, or \"what's the "
    "score\" with no domain/indicator specified), ask for clarification rather than guessing.\n\n"
    "Context:\n{context}"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    sources: list

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    response = rag_chain.invoke({"input": request.query})
    
    # Extract source metadata
    sources = []
    if "context" in response:
        for doc in response["context"]:
            sources.append(doc.metadata)
            
    return ChatResponse(
        answer=response["answer"],
        sources=sources
    )

@app.get("/")
def health_check():
    return {"status": "ok", "message": "EoOS Chatbot Backend is running."}
