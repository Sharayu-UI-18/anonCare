import httpx
from fastapi import APIRouter, HTTPException

from app.models.ask import AskRequest, AskResponse, Source
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


def _format_context(documents: list[dict[str, str]]) -> str:
    return "\n\n".join(
        f"Source: {document['title']} ({document['url']})\n{document['content']}"
        for document in documents
    )


@router.post("/api/ask", response_model=AskResponse)
async def ask_question(request: AskRequest) -> AskResponse:
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=422, detail="Question must not be blank.")

    if is_emergency(question):
    	return AskResponse(
        	answer=EMERGENCY_ANSWER,
        	sources=[],
        	disclaimer=DISCLAIMER,
        	should_consult_doctor=True,
        	urgent=True,
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
    try:
        generated_answer = await generate_answer(question, context)
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
