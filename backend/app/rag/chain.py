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
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4}) # retrieve top 4 most similar chunks

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

    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | PRODUCT_PROMPT
        | ChatOpenAI(model="gpt-4o", temperature=0.3)
        | StrOutputParser()
    )

    return chain

    