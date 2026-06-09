# glowrithm architecture 🪷

AI beauty assistant powered by RAG (Retrieval-Augmented Generation).
Instead of relying solely on the LLM's training data, glowrithm retrieves
relevant product + ingredient data from a vector store and grounds the 
answer in real data.

## v1 architecture
USER QUERY: "find me a moisturiser for oily skin under $30"
         ↓
FastAPI endpoint: POST /products/find
         ↓
LangChain chain (chain.py)
    ↓           ↓
embed query    retrieve top 4 chunks from FAISS
    └─────────────────┘
         ↓
prompt template: query + chunks injected
         ↓
OpenAI GPT-4o generates answer
         ↓
JSON response back to frontend

## file responsibilities
ingest.py   → one-time setup, builds FAISS index from CSV
chain.py    → RAG chain, called on every query
products.py → FastAPI endpoint, handles HTTP request/response
main.py     → spins up the FastAPI app, registers routes

## data source
Sephora website dataset (Kaggle) — ~8000 products with ingredients, 
price, rating, category