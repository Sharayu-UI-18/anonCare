import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.routes import ask
from app.services.retrieval import retrieve

client = TestClient(app)


@pytest.mark.parametrize(
    ("question", "source_title"),
    [
        ("What contraception options can prevent pregnancy?", "NHS: Methods of contraception"),
        ("Could my painful periods be endometriosis?", "NHS: Endometriosis"),
        ("Are hot flushes a symptom of menopause?", "NHS: Menopause and perimenopause symptoms"),
        ("When should I seek help if I cannot conceive?", "NHS: Infertility"),
        ("Where can I get tested for sexually transmitted infections?", "NHS: STI testing and treatment"),
    ],
)
def test_retrieval_finds_added_health_topics(question: str, source_title: str) -> None:
    documents = retrieve(question)

    assert source_title in {document["title"] for document in documents}


def test_health_endpoint() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ask_returns_grounded_fallback_without_llm(monkeypatch) -> None:
    async def no_llm(question: str, context: str) -> None:
        assert "late" in context.lower()
        return None

    monkeypatch.setattr(ask, "generate_answer", no_llm)
    response = client.post(
        "/api/ask",
        json={"question": "Why is my period late?", "anonymous": True},
    )

    assert response.status_code == 200
    body = response.json()
    assert "many reasons" in body["answer"]
    assert body["sources"][0]["title"] == "NHS: Missed or late periods"
    assert "not a diagnosis" in body["disclaimer"]
    assert body["should_consult_doctor"] is False


def test_emergency_question_uses_fixed_guidance_without_llm(monkeypatch) -> None:
    async def should_not_call_llm(question: str, context: str) -> str:
        raise AssertionError("Emergency questions must bypass the LLM.")

    monkeypatch.setattr(ask, "generate_answer", should_not_call_llm)
    response = client.post(
        "/api/ask",
        json={"question": "I have severe pelvic pain and feel faint.", "anonymous": True},
    )

    assert response.status_code == 200
    body = response.json()
    assert "emergency department" in body["answer"]
    assert body["should_consult_doctor"] is True
    assert body["sources"] == []


def test_unsupported_question_returns_uncertainty(monkeypatch) -> None:
    async def should_not_call_llm(question: str, context: str) -> str:
        raise AssertionError("The LLM must not answer without retrieved context.")

    monkeypatch.setattr(ask, "generate_answer", should_not_call_llm)
    response = client.post(
        "/api/ask",
        json={"question": "How do I repair a bicycle tire?", "anonymous": True},
    )

    assert response.status_code == 200
    assert "enough reliable information" in response.json()["answer"]


def test_blank_question_is_rejected() -> None:
    response = client.post(
        "/api/ask",
        json={"question": "   ", "anonymous": True},
    )

    assert response.status_code == 422


def test_unsafe_llm_output_is_replaced(monkeypatch) -> None:
    async def unsafe_answer(question: str, context: str) -> str:
        return "You may have anemia. Take 500 mg of medicine."

    monkeypatch.setattr(ask, "generate_answer", unsafe_answer)
    response = client.post(
        "/api/ask",
        json={"question": "Can PCOS cause a late period?", "anonymous": True},
    )

    assert response.status_code == 200
    body = response.json()
    assert "You may have anemia" not in body["answer"]
    assert body["should_consult_doctor"] is True


def test_tracking_data_is_not_forwarded_to_llm(monkeypatch) -> None:
    async def no_llm(question: str, context: str) -> None:
        assert question == "Why is my period late?"
        assert "sleep" not in context.lower()
        assert "mood" not in context.lower()
        return None

    monkeypatch.setattr(ask, "generate_answer", no_llm)
    response = client.post(
        "/api/ask",
        json={
            "question": "Why is my period late?",
            "anonymous": True,
            "daily_checkins": [{"mood": "low", "sleep_hours": 4}],
            "cycle_history": [{"start_date": "2026-09-01"}],
        },
    )

    assert response.status_code == 200


def test_medication_recommendation_is_replaced(monkeypatch) -> None:
    async def medication_answer(question: str, context: str) -> str:
        return "Take ibuprofen for the pain."

    monkeypatch.setattr(ask, "generate_answer", medication_answer)
    response = client.post(
        "/api/ask",
        json={"question": "What can help with period pain?", "anonymous": True},
    )

    assert response.status_code == 200
    body = response.json()
    assert "ibuprofen" not in body["answer"]
    assert body["should_consult_doctor"] is True
