# RAGAS = library that automatically evaluates your RAG pipeline
# metrics:
# faithfulness -> does the ans only use info from the retrieved context? (0 to 1, higher = less hallucination)
# answer relevancy -> does the answer actually address the question? (0 to 1, higher = more on-topic)

import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from app.rag.chain import get_chain
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

load_dotenv()

# test dataset
questions = [
    "what serum is good for acne prone skin?",
    "recommend a moisturizer under $40",
    "give me sunscreen recommendations for oily skin under $50 i break out alot",
    "give me mascara recommendations that are waterproof",
    "blush suitable for sensitive dry skin",
]

client = OpenAI()

def score_faithfulness(context, answer):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": f"""You are evaluating whether an answer is faithful to its source context.
                Context:
                {context}
                Answer:
                {answer}
                Does the answer ONLY use information from the context, or does it add outside knowledge?
                Respond with JSON: {{"score": 0.0-1.0, "reason": "one sentence"}}
                1.0 = fully grounded in context, 0.0 = completely hallucinated
                """
            }
        ],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

def score_answer_relevancy(question, answer):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": f"""
                    You are evaluating whether an answer is relevant to the question asked.
                    Question:
                    {question}
                    Answer:
                    {answer}
                    Does the answer actually address what was asked?
                    Respond with JSON: {{"score": 0.0-1.0, "reason": "one sentence"}}
                    1.0 = perfectly addresses the question, 0.0 = completely irrelevant
                """
            }
        ], 
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

embeddings = OpenAIEmbeddings()
vectorstore = FAISS.load_local("data/faiss_index", embeddings, allow_dangerous_deserialization=True)
retriever = vectorstore.as_retriever(search_kwargs={"k":20})
chain = get_chain()

for q in questions:
    print(f"\nQ: {q}")

    docs = retriever.invoke(q)
    answer = chain(q)
    context = "\n\n".join([
        f"{d.page_content}\nCategory: {d.metadata.get('category', '')}\nPrice: {d.metadata.get('price', '')}"
        for d in docs
    ])


    faithfulness = score_faithfulness(context, answer)
    relevancy = score_answer_relevancy(q, answer)

    print(f"faithfulness: {faithfulness['score']} - {faithfulness['reason']}")
    print(f"relevancy: {relevancy['score']} - {relevancy['reason']}")