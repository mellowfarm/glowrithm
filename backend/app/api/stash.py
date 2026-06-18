from openai import OpenAI
from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv
import json

load_dotenv()

class ScanRequest(BaseModel):
    image: str

class ScanResponse(BaseModel):
    name: str
    brand: str
    category: str
    ingredients: str

router = APIRouter()

@router.post("/scan")
def scan_product(request: ScanRequest) -> ScanResponse:
    client = OpenAI()
    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={ "type": "json_object" },
        messages=[
            {
                "role": "system",
                "content": "You extract skincare product info from label images and return JSON."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": { "url": f"data:image/jpeg;base64,{request.image}" }
                    },
                    {
                        "type": "text",
                        "text": 'Extract product info from this skincare label. Return JSON with keys: "name", "brand", "category" (moisturizer/serum/sunscreen/toner/cleanser/etc), "ingredients" (comma separated). Use empty string if not found.'
                    }
                ]
            }
        ]
    )
    data = json.loads(response.choices[0].message.content)
    return ScanResponse(**data)