# main.py 
# 1) creates the FastAPI app
# 2) plugs in the products router

from fastapi import FastAPI
from app.api import products

app = FastAPI(title="glowrithm API 🪷")

# plug in the products router
app.include_router(products.router, prefix="/products")