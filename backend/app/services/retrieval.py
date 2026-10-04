import json
import re
from pathlib import Path


_CORPUS_PATH = Path(__file__).resolve().parents[2] / "knowledge" / "health.json"
_TOKEN_PATTERN = re.compile(r"[a-z]{3,}")
_STOP_WORDS = {
    "about", "after", "also", "and", "are", "been", "before", "being", "can",
    "could", "does", "for", "from", "have", "help", "how", "into", "just",
    "like", "many", "more", "most", "much", "over", "same", "should", "some",
    "that", "them", "then", "there", "these", "they", "this", "those", "what",
    "when", "where", "which", "while", "with", "would", "your",
}


def _load_documents() -> list[dict[str, str]]:
    with _CORPUS_PATH.open(encoding="utf-8") as corpus_file:
        documents = json.load(corpus_file)
    if not isinstance(documents, list):
        raise ValueError("The health knowledge corpus must be a list.")
    return documents


def retrieve(question: str, limit: int = 3) -> list[dict[str, str]]:
    query_terms = {
        token for token in _TOKEN_PATTERN.findall(question.lower())
        if token not in _STOP_WORDS
    }
    if not query_terms:
        return []

    ranked: list[tuple[int, dict[str, str]]] = []
    for document in _load_documents():
        document_terms = {
            token for token in _TOKEN_PATTERN.findall(
                f"{document['title']} {document['keywords']} {document['content']}".lower()
            )
            if token not in _STOP_WORDS
        }
        score = len(query_terms & document_terms)
        if score:
            ranked.append((score, document))

    ranked.sort(key=lambda item: item[0], reverse=True)
    return [document for _, document in ranked[:limit]]
