
import httpx
from fastapi import APIRouter, HTTPException
from app.services.classifier import QueryCategory, classify_query
from app.services.intent_classifier import classify_intent
from app.models.ask import AskRequest, AskResponse, Source
from app.services.privacy import describe_context, redact_identifiers
from app.services.llm import generate_answer
from app.services.retrieval import retrieve
from app.services.safety import (
    DISCLAIMER,
    EMERGENCY_ANSWER,
    UNCERTAINTY_ANSWER,
    is_emergency,
    is_unsafe_generated_answer,
    should_consult_doctor,
)

router = APIRouter()
MEDICAL_ATTENTION_ANSWER = (
    "Your concern may need advice from a healthcare professional. "
    "Please use the existing Medical Help option to find appropriate support. "
    "If your symptoms are severe or rapidly worsening, seek urgent medical care."
)

EMOTIONAL_SUPPORT_ANSWER = (
    "I'm sorry you're going through this. Your feelings matter, and you "
    "don't have to work through everything alone. If you're comfortable, "
    "you can share a little more about what's troubling you. "
    "If you feel unsafe or might harm yourself, contact emergency services "
    "or someone you trust who can help you right now."
)

def _format_context(documents: list[dict[str, str]]) -> str:
    return "\n\n".join(
        f"Source: {document['title']} ({document['url']})\n{document['content']}"
        for document in documents
    )


@router.post("/api/ask", response_model=AskResponse)
async def ask_question(request: AskRequest) -> AskResponse:
    question = redact_identifiers(request.question.strip())
    if not question:
        raise HTTPException(
            status_code=422,
            detail="Question must not be blank.",
        )

    # Handle emergencies before retrieval or AI generation.
    if is_emergency(question):
        return AskResponse(
            answer=EMERGENCY_ANSWER,
            sources=[],
            disclaimer=DISCLAIMER,
            should_consult_doctor=True,
            urgent=True,
        )
    # Classify intent, falling back to deterministic rules if Gemini fails.
    try:
        intent = await classify_intent(question)
        category = QueryCategory(intent["primary_category"])
        urgency = intent["urgency"]
    except Exception:
        category = classify_query(question)
        urgency = "routine"

    # Emergency classification takes priority over other intents.
    if urgency == "emergency":
        return AskResponse(
            answer=EMERGENCY_ANSWER,
            sources=[],
            disclaimer=DISCLAIMER,
            should_consult_doctor=True,
            urgent=True,
        )

    # Route medical concerns to the existing Medical Help option.
    if category == QueryCategory.MEDICAL_ATTENTION:
        return AskResponse(
            answer=MEDICAL_ATTENTION_ANSWER,
            sources=[],
            disclaimer=DISCLAIMER,
            should_consult_doctor=True,
            urgent=(urgency == "urgent"),
        )

    # Handle emotional-support requests without generating medical advice.
    if category == QueryCategory.EMOTIONAL_SUPPORT:
        return AskResponse(
            answer=EMOTIONAL_SUPPORT_ANSWER,
            sources=[],
            disclaimer=DISCLAIMER,
            should_consult_doctor=False,
            urgent=False,
        )
    documents = retrieve(question)
    sources = [
        Source(title=document["title"], url=document["url"])
        for document in documents
    ]

    if not documents:
        return AskResponse(
            answer=UNCERTAINTY_ANSWER,
            sources=[],
            disclaimer=DISCLAIMER,
            should_consult_doctor=True,
        )

    context = _format_context(documents)
    history = [turn.model_dump() for turn in request.history]

    try:
        personal_context = describe_context(request.context)
        answer_options = {
            "language": request.language,
            "history": history,
        }
        if personal_context:
            answer_options["personal_context"] = personal_context
        generated_answer = await generate_answer(
            question,
            context,
            **answer_options,
        )
    except (httpx.HTTPError, KeyError, ValueError) as error:
        raise HTTPException(
            status_code=502,
            detail="The answer service is temporarily unavailable. Please try again.",
        ) from error

    if generated_answer is None:
        answer = (
            "Here is general information from the trusted sources listed below:\n\n"
            + "\n\n".join(document["content"] for document in documents)
        )
    elif is_unsafe_generated_answer(generated_answer):
        answer = (
            "I can’t determine a diagnosis or recommend medication. "
            "Please consult a healthcare professional for advice about your concern."
        )
    else:
        answer = generated_answer

    return AskResponse(
        answer=answer,
        sources=sources,
        disclaimer=DISCLAIMER,
        should_consult_doctor=(
            is_unsafe_generated_answer(generated_answer or "")
            or should_consult_doctor(question, generated_answer or "")
        ),
        urgent=False,
    )
