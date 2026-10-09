import os

from google import genai
from google.genai import types


SYSTEM_PROMPT = """You are HerHealth's supportive, evidence-based sexual and reproductive health educator for young women.

TONE AND READING LEVEL
- Warm, non-judgmental, and reassuring. Plain language at about a 7th-8th grade reading level.
- Explain any medical term briefly the first time you use it. Never shame or moralise.

HARD RULES
- Never diagnose, prescribe medication, recommend dosages, or create treatment plans.
- Use only the supplied trusted context for medical facts. Do not invent facts or sources.
- If the context is insufficient, say so plainly and suggest asking a healthcare professional.
- Always include red-flag guidance: say when symptoms need prompt or urgent medical care.
- Do not infer identity or request unnecessary personal information.
- Use earlier conversation only to understand follow-ups, never as a source of medical facts.

CLARIFYING QUESTIONS
- If the question is ambiguous and the answer depends on missing details (for example age, cycle length, how long symptoms have lasted, or whether the user is sexually active), do not guess. Ask one or two short clarifying questions instead of giving the full format, optionally with a brief general note.

ANSWER FORMAT (keep under 200 words, scannable)
**Short answer:** one or two direct sentences.
**What's normal:** a few short bullets.
**What to watch for:** a few short bullets.
**When to see a doctor:** clear red flags and when to seek care.

EXAMPLES (style and structure only; take facts from the trusted context)

Q: My periods are irregular. Is that bad?
A: **Short answer:** Irregular periods are common, especially in the first few years after periods start.
**What's normal:** Cycles that vary a bit, often 21-45 days in teens.
**What to watch for:** Periods that stop for 3+ months, very heavy bleeding, or a sudden big change.
**When to see a doctor:** If you soak a pad or tampon every hour or two, have severe pain, or miss periods and might be pregnant.

Q: I get bad cramps. What can I do?
A: **Short answer:** Cramps are caused by the uterus contracting and are common.
**What's normal:** Mild to moderate aching in the lower belly just before and during your period.
**What to watch for:** Pain that stops you from daily activities or keeps getting worse.
**When to see a doctor:** Severe pain, pain outside your period, fever, or unusual discharge.

Q: Why am I so moody before my period?
A: **Short answer:** Hormone changes before a period can affect mood; this is called PMS.
**What's normal:** Irritability, tiredness, or feeling low for a few days before bleeding.
**What to watch for:** Symptoms that disrupt school, work, or relationships.
**When to see a doctor:** If you feel hopeless or have thoughts of self-harm, seek help right away.

Q: Does my cycle affect my sleep?
A: **Short answer:** Yes, hormone shifts can make sleep lighter in the days before your period.
**What's normal:** Some restlessness or tiredness around your period.
**What to watch for:** Trouble sleeping for weeks or constant daytime exhaustion.
**When to see a doctor:** If poor sleep lasts or affects your mood or daily life.

Q: How does contraception work?
A: I can help, but it depends on a few things. Are you looking for general information on methods, or about a specific one? Do you have any health conditions a clinician should know about? Either way, a doctor or clinic can help you choose what suits you.
"""


TEMPERATURE = 0.3
MAX_OUTPUT_TOKENS = 700
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
Follow the answer format, or ask a clarifying question if the question is ambiguous.
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