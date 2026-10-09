import json
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.services.classifier import QueryCategory
load_dotenv()

INTENT_SYSTEM_PROMPT = """
You are the intent classifier for HerHealth, a women's health assistant.

Classify the user's message into exactly one primary category:

1. health_information:
   The user wants general women's health information or an explanation
   of symptoms, periods, reproductive health, or health conditions.

2. emotional_support:
   The user expresses anxiety, sadness, loneliness, fear, stress,
   or needs emotional reassurance.

3. additional_assistance:
   The user wants help understanding, simplifying, translating,
   or summarizing information, including medical terminology or reports.

4. medical_attention:
   The user requests a doctor's advice, describes symptoms that may
   require professional assessment, or asks whether they should seek care.

Rules:
- Understand English, Hindi, Marathi, and transliterated or code-mixed text.
- Choose the category based on the user's intent, not isolated keywords.
- If multiple categories apply, choose the most safety-relevant primary
  category. Mention the other applicable categories in secondary_categories.
- Do not diagnose the user.
- Do not provide medical advice or generate a response to the user.
- Do not classify an emergency as routine.
- If intent is unclear, use health_information and set uncertain to true.
- Return valid JSON only.

Required JSON format:
{
  "primary_category": "health_information",
  "secondary_categories": [],
  "language": "english",
  "urgency": "routine",
  "uncertain": false
}

Allowed primary categories:
health_information, emotional_support, additional_assistance, medical_attention

Allowed secondary categories:
health_information, emotional_support, additional_assistance, medical_attention

Allowed language values:
english, hindi, marathi, mixed, other

Allowed urgency values:
routine, urgent, emergency
"""


async def classify_intent(question: str) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    client = genai.Client(api_key=api_key)

    response = await client.aio.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
        contents=f"Classify this user message:\n{question}",
        config=types.GenerateContentConfig(
            system_instruction=INTENT_SYSTEM_PROMPT,
            temperature=0,
            response_mime_type="application/json",
        ),
    )

    if not response.text:
        raise ValueError("Gemini returned an empty classification.")

    result = json.loads(response.text)

    allowed_categories = {category.value for category in QueryCategory}

    if result.get("primary_category") not in allowed_categories:
        raise ValueError("Invalid primary category.")

    secondary = result.get("secondary_categories", [])
    if not isinstance(secondary, list):
        raise ValueError("Invalid secondary categories.")

    if any(category not in allowed_categories for category in secondary):
        raise ValueError("Invalid secondary category.")

    if result.get("language") not in {
        "english", "hindi", "marathi", "mixed", "other"
    }:
        raise ValueError("Invalid language.")

    if result.get("urgency") not in {
        "routine", "urgent", "emergency"
    }:
        raise ValueError("Invalid urgency.")

    if not isinstance(result.get("uncertain"), bool):
        raise ValueError("Invalid uncertainty flag.")

    return result