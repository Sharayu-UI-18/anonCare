from enum import Enum
import re


class QueryCategory(str, Enum):
    HEALTH_INFORMATION = "health_information"
    EMOTIONAL_SUPPORT = "emotional_support"
    ADDITIONAL_ASSISTANCE = "additional_assistance"
    MEDICAL_ATTENTION = "medical_attention"


# English, Hindi, Marathi, and common transliterations.
EMOTIONAL_PATTERNS = [
    # English
    r"\banxious\b",
    r"\banxiety\b",
    r"\blonely\b",
    r"\bloneliness\b",
    r"\boverwhelmed\b",
    r"\bstressed\b",
    r"\bdepressed\b",
    r"\bsad\b",
    r"\bscared\b",
    r"\bpanicking\b",
    r"\bemotional support\b",

    # Hindi
    r"घबराहट",
    r"अकेला महसूस",
    r"अकेली महसूस",
    r"तनाव",
    r"उदास",
    r"डर लग",

    # Marathi
    r"घाबरल्यासारखं",
    r"एकटं वाटतं",
    r"तणाव",
    r"उदास",
    r"भीती वाट",

    # Hindi/Marathi transliteration
    r"\bghabrahat\b",
    r"\bakela\b",
    r"\bakeli\b",
    r"\btanav\b",
    r"\btension\b",
    r"\budas\b",
    r"\bbhay\b",
    r"\bkhup stress\b",
]

ASSISTANCE_PATTERNS = [
    # English
    r"\bexplain\b",
    r"\bsummarize\b",
    r"\bsimplify\b",
    r"\bhelp me understand\b",
    r"\btranslate\b",
    r"\bwhat does .+ mean\b",

    # Hindi
    r"समझाओ",
    r"समझाइए",
    r"अनुवाद",
    r"सरल भाषा",

    # Marathi
    r"समजावून सांगा",
    r"समजाव",
    r"भाषांतर",
    r"सोप्या भाषेत",

    # Transliteration
    r"\bsamjhao\b",
    r"\bsamjha\b",
    r"\bsamjun sang\b",
    r"\bsopya bhashet\b",
]

MEDICAL_ATTENTION_PATTERNS = [
    # Symptoms or explicit requests for professional assessment
    r"\bheavy bleeding\b",
    r"\bbleeding heavily\b",
    r"\bunusually heavy bleeding\b",
    r"\bworsening pain\b",
    r"\bpersistent pain\b",
    r"\bneed a doctor\b",
    r"\bshould i see a doctor\b",
    r"\bmedical attention\b",
    r"\bsee a healthcare professional\b",

    # Hindi
    r"बहुत ज्यादा खून",
    r"बहुत ज़्यादा खून",
    r"डॉक्टर को दिखाना",
    r"डॉक्टर से मिलना",

    # Marathi
    r"खूप जास्त रक्तस्राव",
    r"जास्त रक्तस्राव",
    r"डॉक्टरांना दाखव",
    r"डॉक्टरांचा सल्ला",

    # Transliteration
    r"\bbahut zyada khoon\b",
    r"\bkhup jast raktasrav\b",
    r"\bdoctor la dakhav\b",
    r"\bdoctor cha salla\b",
]


def _matches_any(query: str, patterns: list[str]) -> bool:
    return any(
        re.search(pattern, query, re.IGNORECASE)
        for pattern in patterns
    )


def classify_query(question: str) -> QueryCategory:
    query = question.strip()

    # The dedicated safety layer will handle emergency responses.
    # This category is not a substitute for emergency detection.
    if _matches_any(query, MEDICAL_ATTENTION_PATTERNS):
        return QueryCategory.MEDICAL_ATTENTION

    if _matches_any(query, EMOTIONAL_PATTERNS):
        return QueryCategory.EMOTIONAL_SUPPORT

    if _matches_any(query, ASSISTANCE_PATTERNS):
        return QueryCategory.ADDITIONAL_ASSISTANCE

    return QueryCategory.HEALTH_INFORMATION