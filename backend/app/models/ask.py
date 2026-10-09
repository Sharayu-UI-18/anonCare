
from typing import Literal

from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1000)
    language: Literal["English", "Hindi", "Marathi"] = "English"
    anonymous: bool = True


class Source(BaseModel):
    title: str
    url: str


class AskResponse(BaseModel):
    answer: str
    sources: list[Source]
    disclaimer: str
    should_consult_doctor: bool
    urgent: bool = False
