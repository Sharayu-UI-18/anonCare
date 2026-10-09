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
Keep answers concise: at most 150 words, using short paragraphs or a few bullets.
Use earlier conversation only to understand follow-up questions, never as a source of medical facts.
"""


TEMPERATURE = 0.3
MAX_OUTPUT_TOKENS = 400
RECENT_TURNS = 4
SUMMARY_CHARS_PER_TURN = 120


def _clip(text: str, limit: int) -> str:
    text = " ".join(text.split())
    return text if len(text) <= limit else text[: limit - 1] + "…"


def format_history(history: list[dict[str, str]] | None) -> str:
    """Keep the latest turns verbatim and compress older ones into a short summary."""
    if not history:
        return ""
    older, recent = history[:-RECENT_TURNS], history[-RECENT_TURNS:]
    parts = []
    if older:
        summary = "; ".join(
            f"{turn['role']}: {_clip(turn['content'], SUMMARY_CHARS_PER_TURN)}"
            for turn in older
        )
        parts.append(f"Summary of earlier conversation: {summary}")
    if recent:
        parts.append(
            "Recent conversation:\n"
            + "\n".join(f"{t['role']}: {_clip(t['content'], 500)}" for t in recent)
        )
    return "\n\n".join(parts)


async def generate_answer(
    question: str, context: str, history: list[dict[str, str]] | None = None
) -> str:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    model = "gemini-3.5-flash-lite"

    try:
        client = genai.Client(api_key=api_key)

        history_text = format_history(history)
        history_block = f"{history_text}\n\n" if history_text else ""

        prompt = f"""Trusted medical context:

{context}

{history_block}User question:
{question}

Answer the user's question using only the trusted medical context above.
Be concise (under 150 words).
"""

        response = await client.aio.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=TEMPERATURE,
                max_output_tokens=MAX_OUTPUT_TOKENS,
            ),
        )

        answer = response.text

        if not answer or not answer.strip():
            raise ValueError("Gemini returned an empty answer.")

        return answer.strip()

    except Exception as error:
        print("GEMINI ERROR:", repr(error))
        raise ValueError("Gemini request failed.") from error