# products.py is the FastAPI endpoint that ties everything together
# 1) receive the user's query via HTTP POST
# 2) call get_chain() from chain.py
# 3) run the chain with the query
# 4) return the answer as JSON

from fastapi import APIRouter
from pydantic import BaseModel
from app.rag.chain import get_chain

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    response: str

router = APIRouter()

@router.post("/find")
def find_products(request: QueryRequest):
    chain = get_chain()
    answer = chain(request.query)
    return QueryResponse(response=answer)
    