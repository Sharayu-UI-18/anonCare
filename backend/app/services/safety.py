
import re

DISCLAIMER = (
    "This information is for general education only and is not a diagnosis or medical advice."
)

UNCERTAINTY_ANSWER = (
    "I don’t have enough reliable information in my trusted sources to answer "
    "that question. A healthcare professional can give advice specific to you."
)

EMERGENCY_ANSWER = (
    "Your symptoms may need urgent assessment. Please contact your local "
    "emergency number or go to the nearest emergency department now, especially "
    "if you feel faint, have severe pain, or are bleeding heavily. If you can, "
    "ask someone nearby to stay with you."
)

# Emergency phrases in English, Hindi, and Marathi.
# Devanagari alternatives cover common ways users may describe symptoms.
_EMERGENCY_PATTERN = re.compile(
    r"severe\s+(?:(?:abdominal|pelvic|period)\s+)?pain|"
    r"unbearable\s+pain|heavy\s+bleeding|bleeding\s+heavily|"
    r"soaking\s+(?:(?:a|through)\s+)?(?:pad|tampon)|"
    r"\bfaint(?:ed|ing)?\b|passed\s+out|"
    r"can't\s+breathe|cannot\s+breathe|difficulty\s+breathing|chest\s+pain|"
    r"सीने\s+में\s+दर्द|छाती\s+में\s+दर्द|"
    r"साँस\s+लेने\s+में\s+(?:बहुत\s+)?(?:कठिनाई|दिक्कत|परेशानी)|"
    r"सांस\s+लेने\s+में\s+(?:बहुत\s+)?(?:कठिनाई|दिक्कत|परेशानी)|"
    r"बहुत\s+तेज़\s+दर्द|असहनीय\s+दर्द|"
    r"बहुत\s+ज़्यादा\s+खून\s+बहना|बहुत\s+ज्यादा\s+खून\s+बहना|"
    r"बेहोश(?:\s+होना|\s+हो\s+गई|\s+हो\s+गया)?|"
    r"छातीत\s+(?:खूप\s+)?दुखत|छातीत\s+तीव्र\s+वेदना|"
    r"श्वास\s+घेण्यास\s+(?:खूप\s+)?(?:त्रास|अडचण)|"
    r"दम\s+लागणे|तीव्र\s+वेदना|असह्य\s+वेदना|"
    r"खूप\s+रक्तस्राव|जास्त\s+रक्तस्राव|"
    r"बेशुद्ध\s+पडणे",
    re.IGNORECASE,
)

_DIAGNOSIS_PATTERN = re.compile(
    r"\byou\s+(?:(?:definitely|certainly|clearly|probably|possibly|"
    r"might|may|could)\s+)?"
    r"(?:have|suffer from|are diagnosed with|are pregnant|"
    r"might be pregnant|may be pregnant|could be pregnant)\b",
    re.IGNORECASE,
)

_PRESCRIPTION_PATTERN = re.compile(
    r"\b(?:(?:you should|you can|you may|consider|please)\s+)?"
    r"(?:take|start|stop|increase|decrease|use|try|prescribe|recommend|suggest)\s+"
    r"(?:(?:the|a|an|your)\s+)?"
    r"(?:[a-z-]+\s+){0,3}\d+\s*(?:mg|mcg|micrograms?|milligrams?)\b"
    r"|\b(?:(?:you should|you can|you may|consider|please)\s+)?"
    r"(?:take|start|stop|increase|decrease|use|try|prescribe|recommend|suggest)\s+"
    r"(?:(?:the|a|an|your)\s+)?"
    r"(?:medication|medicine|drug|painkiller|supplement|hormone|"
    r"contraceptive|antibiotic|ibuprofen|acetaminophen|paracetamol|"
    r"aspirin|naproxen|metformin|progesterone|birth control pills?)\b",
    re.IGNORECASE,
)

_CONSULT_PATTERN = re.compile(
    r"\b(?:persistent|persistently|worsening|severe|unusually heavy|"
    r"missed (?:more than one|several) periods?|pcos|pregnan(?:t|cy)|"
    r"consult (?:a |your )?(?:doctor|clinician|healthcare professional)|"
    r"contact (?:a |your )?(?:doctor|clinician|healthcare professional)|"
    r"speak to (?:a |your )?(?:doctor|clinician|healthcare professional))\b",
    re.IGNORECASE,
)


def is_emergency(question: str) -> bool:
    return bool(_EMERGENCY_PATTERN.search(question))


def is_unsafe_generated_answer(answer: str) -> bool:
    return bool(
        _DIAGNOSIS_PATTERN.search(answer)
        or _PRESCRIPTION_PATTERN.search(answer)
    )


def should_consult_doctor(question: str, answer: str) -> bool:
    return bool(
        _CONSULT_PATTERN.search(question)
        or _CONSULT_PATTERN.search(answer)
    )
