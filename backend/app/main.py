# main.py 
# 1) creates the FastAPI app
# 2) plugs in the products router

from fastapi import FastAPI
from app.api import products, ingredients, stash

app = FastAPI(title="glowrithm API 🪷")

# plug in the products router
app.include_router(products.router, prefix="/products")
app.include_router(ingredients.router, prefix="/ingredients")
app.include_router(stash.router, prefix="/stash")