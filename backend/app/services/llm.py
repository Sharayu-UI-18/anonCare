import os

from google import genai
from google.genai import types


SYSTEM_PROMPT = """You are HerHealth's health-information assistant.

Provide general, evidence-based health information, not diagnosis or treatment.
Never diagnose, prescribe medication, recommend dosage, or create treatment plans.
Use only the supplied trusted context for medical facts.
Do not invent facts or sources.
If the context is insufficient, clearly say so.
Use simple, non-judgmental language.
Do not infer identity or request unnecessary personal information.
Keep answers concise.
"""


async def generate_answer(question: str, context: str, personal_context: str = "") -> str:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    model = "gemini-3.5-flash-lite"

    try:
        client = genai.Client(api_key=api_key)

        prompt = f"""Trusted medical context:

{context}

{personal_context}User question:
{question}

Answer the user's question using only the trusted medical context above.
If general user context is given, use it only to tailor tone and relevance, never to diagnose.
"""

        response = await client.aio.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.2,
            ),
        )

        answer = response.text

        if not answer or not answer.strip():
            raise ValueError("Gemini returned an empty answer.")

        return answer.strip()

    except Exception as error:
        print("GEMINI ERROR:", repr(error))
        raise ValueError("Gemini request failed.") from error