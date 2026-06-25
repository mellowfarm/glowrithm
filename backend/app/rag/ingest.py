# ingest.py is for converting raw CSV data into something the AI can search through quickly
# like building a library index -> do it once, then every search is fast!

import os
import pandas as pd
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

def ingest():
    # load api key
    load_dotenv()

    # load the csv
    df = pd.read_csv("data/sephora_website_dataset.csv", on_bad_lines="skip")
    df = df.dropna(subset=["name", "ingredients"])

    # convert rows into Documents
    # LangChain has its own Document object:
    # a wrapper around page_content (actual text AI reads) and metadata (extra info you want to keep but not embed like name, brand) -> for frontend response! not embedded so no need to parse
    docs = []
    for _, row in df.iterrows(): # df.iterrows gives index , row
        doc = Document(
            page_content=f"""
                Product: {row['name']}
                Brand: {row['brand']}
                Ingredients: {row['ingredients']}
                """.strip(),
            metadata={
                "name": row['name'], 
                "brand": row['brand'],
                "category": row['category'],
                "price": row['price'],
            }
        )
        docs.append(doc)

    # embedding
    embeddings = OpenAIEmbeddings()
    vectorstore = FAISS.from_documents(docs, embeddings) # embeds all docs
    vectorstore.save_local("data/faiss_index") # stores all vectors like a library so we can search through fast! :-)
    
    print("🪷 done!")

if __name__ == "__main__":
    ingest()
