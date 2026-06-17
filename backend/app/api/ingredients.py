from openai import OpenAI
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class IngredientRequest(BaseModel): # what goes into endpoint
    image: Optional[str] = None # base64 encoded image string
    ingredients: Optional[str] = None # plain text ingredients list

class IngredientsResponse(BaseModel): # what comes out of endpoint
    ingredients: str 
    analysis: str

router = APIRouter()

@router.post("/check")
def check_ingredients(request: IngredientRequest) -> IngredientsResponse:
    client = OpenAI()
    if request.image:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{request.image}"
                        }
                    },
                    {
                        "type": "text",
                        "text": "Extract ONLY the ingredients list from this product image. Return just the ingredients as a comma-separated list. If no ingredients are visible, say 'not found :-('."
                    }
                ]
            }]
        )

        ingredients_text = response.choices[0].message.content
    else:
        ingredients_text = request.ingredients
    
    analysis_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": f"""
            Analyse these skincare ingredients. Be direct, no preamble.

            {ingredients_text}

            Format your response exactly like this:
            🔬 **ingredient breakdown**

            [for each key ingredient:]
            **[ingredient name]** — [what it does, 1-2 sentences]

            ⚠️ **conflicts & warnings**
            [any ingredient clashes or warnings]

            ✨ **overall verdict**
            [2-3 sentence summary]   
            """
        }]
    )
    analysis = analysis_response.choices[0].message.content
    
    return IngredientsResponse(
        ingredients=ingredients_text,
        analysis=analysis
    )

