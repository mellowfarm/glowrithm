# chain.py loads the FAISS index from disk
# takes a user query
# retrieves top 4 relevant chunks 
# injects them into a prompt
# sends to GPT-4o (ChatOpenAI)
# returns the answer

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

def filter_docs(docs, query):
    query = query.lower()

    # category keywords
    categories = ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 
                  'foundation', 'concealer', 'mascara', 'lipstick', 'blush']
    matched_category = next((c for c in categories if c in query), None)

    # price filter 
    price_filter = None
    if 'under $' in query:
        price_filer = float(query.split('under $')[1].split()[0])

    filtered = docs

    if matched_category:
        filtered = [d for d in filtered if matched_category in d.metadata.get('category', '').lower()]
    
    if price_filter:
        filtered = [d for d in filtered if float(d.metadata.get('price', '9999').replace('$', '').split()[0]) <= price_filter]

    return filtered if filtered else docs

def get_chain():
    # load api key
    load_dotenv()

    # load FAISS index
    embeddings = OpenAIEmbeddings()
    vectorstore = FAISS.load_local(
        "data/faiss_index",
        embeddings,
        allow_dangerous_deserialization=True
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": 20}) 

    PRODUCT_PROMPT = ChatPromptTemplate.from_template("""                                 
    You are a knowledgeable and friendly beauty assistant for glowrithm. 
    Use ONLY the product information below to answer the question.
    If you can't find relevant products, say so honestly.
    
    Product context:
    {context}
    
    User question: {question}
    
    Respond with 2-3 product recommendations. For each include:
    - product name + brand
    - why it suits their needs
    - price 
    - key ingredients if relevant
    """)

    def get_answer(query):
        docs = retriever.invoke(query)
        filtered = filter_docs(docs, query)
        context = "\n\n".join([
            f"{d.page_content}\nCategory: {d.metadata.get('category', '')}\nPrice: {d.metadata.get('price', '')}"
            for d in filtered
        ])

        
        chain = (
            PRODUCT_PROMPT
            | ChatOpenAI(model="gpt-4o", temperature=0.3)
            | StrOutputParser()
        )
        
        return chain.invoke({"context": context, "question": query})

    return get_answer

