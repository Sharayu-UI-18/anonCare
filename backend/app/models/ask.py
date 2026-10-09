
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PersonalContext(BaseModel):
    """Coarse, derived features only. Raw logs and identifiers are rejected."""

    model_config = ConfigDict(extra="forbid")

    cycle_phase: Literal["menstrual", "follicular", "ovulatory", "luteal", "unknown"] = "unknown"
    cycle_day: int | None = Field(default=None, ge=1, le=60)
    sleep_level: Literal["low", "typical", "good", "unknown"] = "unknown"
    energy_level: Literal["low", "moderate", "high", "unknown"] = "unknown"
    mood_trend: Literal["low", "mixed", "positive", "unknown"] = "unknown"


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=2000)


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1000)
    language: Literal["English", "Hindi", "Marathi"] = "English"
    history: list[ChatTurn] = Field(default_factory=list, max_length=50)
    anonymous: bool = True
    context: PersonalContext | None = None


class Source(BaseModel):
    title: str
    url: str


class AskResponse(BaseModel):
    answer: str
    sources: list[Source]
    disclaimer: str
    should_consult_doctor: bool
    urgent: bool = False
