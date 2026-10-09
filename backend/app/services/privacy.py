import re

from app.models.ask import PersonalContext

_PATTERNS = [
    (re.compile(r"\bHH-[A-Z0-9]{7}\b", re.IGNORECASE), "[id]"),
    (re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+"), "[email]"),
    (re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE), "[link]"),
    (re.compile(r"(?<!\w)\+?\d[\d\s().-]{7,}\d"), "[number]"),
]


def redact_identifiers(text: str) -> str:
    for pattern, replacement in _PATTERNS:
        text = pattern.sub(replacement, text)
    return text


def describe_context(context: PersonalContext | None) -> str:
    """Turn opted-in coarse features into a short sentence for the prompt."""
    if context is None:
        return ""
    parts = []
    if context.cycle_day is not None:
        parts.append(f"day {context.cycle_day} of the cycle")
    if context.cycle_phase != "unknown":
        parts.append(f"{context.cycle_phase} phase")
    if context.sleep_level != "unknown":
        parts.append(f"{context.sleep_level} sleep this week")
    if context.energy_level != "unknown":
        parts.append(f"{context.energy_level} energy this week")
    if context.mood_trend != "unknown":
        parts.append(f"{context.mood_trend} mood trend this week")
    if not parts:
        return ""
    return "General user context (user opted in, derived on-device): " + ", ".join(parts) + ".\n\n"
