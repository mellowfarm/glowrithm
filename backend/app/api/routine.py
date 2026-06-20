from openai import OpenAI
from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv
import json

load_dotenv()

class RoutineRequest(BaseModel):
    skin_type: str
    skin_concerns: str
    goals: str
    products: list # list of skincare product dicts

class RoutineResponse(BaseModel):
    am: list # morning steps
    pm: list # evening steps
    gaps: list # missing products
    next_buy: str # one recommendation

router = APIRouter()

@router.post("/create")
def create_routine(request: RoutineRequest) -> RoutineResponse:
    client = OpenAI()
    response = client.chat.completions.create(
        model = "gpt-4o",
        response_format={ "type": "json_object" },
        messages=[
            {
                "role": "system",
                "content": "You are a skincare expert that creates personalized AM/PM routines."
            },
            {
                "role": "user",
                "content": f"""Create a skincare routine for this person.
                skin type: {request.skin_type}
                concerns: {request. skin_concerns}
                goals: {request.goals}
                products they own: {request.products}

                Return JSON with these keys:
                - am: list of morning steps (each step is a string like "1. cleanser - cerave foaming")
                - pm: list of evening steps
                - gaps: list of missing product types they should add
                - next_buy: one specific product recommendation string (personalised to their needs)
                """
            }
        ]
    )
    data = json.loads(response.choices[0].message.content)
    return RoutineResponse(**data)
