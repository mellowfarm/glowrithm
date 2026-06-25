# glowrithm 🪷
A mobile beauty assistant powered by RAG, GPT-4o Vision, and React Native.

## Features
- **Product Finder** — RAG-powered search over 9,000+ Sephora products
- **Ingredient Checker** — scan product labels with GPT-4o Vision to analyze ingredients
- **My Stash** — personal product shelf with camera scan and Supabase storage
- **My Routine** — personalized AM/PM skincare routine generated from your stash + skin profile

## Architecture

### Product Finder (RAG Pipeline)
Sephora CSV → per-product Documents → OpenAI Embeddings → FAISS vector store
↓
User query → metadata filter (category + price) → top-20 retrieval → GPT-4o → answer


**Key decisions:**
- One document per product (no chunking) — ingredient lists were getting severed mid-sentence with naive chunking
- Price and category stored as metadata for structured filtering, not embedded as text
- Retrieve top-20 then filter, rather than relying on FAISS filtering alone

### Evaluation
Built a custom LLM-as-a-judge eval harness measuring:
- **Faithfulness** — does the answer only use retrieved context? (no hallucination)
- **Answer relevancy** — does the answer address the question?

| Query | Faithfulness | Relevancy |
|---|---|---|
| serum for acne prone skin | 1.0 | 1.0 |
| moisturizer under $40 | 1.0 | 1.0 |
| sunscreen for oily skin under $50 | 1.0 | 1.0 |
| waterproof mascara | 1.0 | 1.0 |
| blush for sensitive dry skin | 1.0 | 1.0 |

## Tech Stack
- **Frontend:** React Native (Expo)
- **Backend:** FastAPI
- **RAG:** LangChain + FAISS + OpenAI Embeddings
- **LLM:** GPT-4o, GPT-4o Vision
- **Database:** Supabase (Postgres + Storage)


