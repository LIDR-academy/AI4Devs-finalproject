"""Clinical event extraction from free-text notes.

Two strategies, chosen automatically:

1. **LLM** — if an OpenAI-compatible endpoint is configured (``LLM_BASE_URL`` +
   ``LLM_API_KEY``), the note is sent to a chat-completions API using the
   prompt in ``app/prompts/event_extraction.txt``.
2. **Rule-based fallback** — a deterministic clinical keyword extractor that
   runs with no external dependency, so the MVP is fully executable offline.

Every returned event carries provenance (``source_quote``, ``confidence``) and
the strategy used (``extraction_source``) for auditability.
"""

import json
import logging
from pathlib import Path

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

_PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "event_extraction.txt"

_CATEGORIES = {"diagnosis", "medication", "lab", "procedure", "symptom", "allergy", "other"}

# Spanish/English clinical keywords -> category. Order matters: first match wins.
_KEYWORDS: list[tuple[str, str]] = [
    # symptoms
    ("cefalea", "symptom"), ("dolor", "symptom"), ("nausea", "symptom"),
    ("náusea", "symptom"), ("fotofobia", "symptom"), ("fiebre", "symptom"),
    ("tos", "symptom"), ("mareo", "symptom"), ("fatiga", "symptom"),
    ("vómito", "symptom"), ("disnea", "symptom"), ("malestar", "symptom"),
    ("astenia", "symptom"),
    # diagnosis
    ("diagnóstico", "diagnosis"), ("diagnostico", "diagnosis"),
    ("hipertensión", "diagnosis"), ("hipertension", "diagnosis"),
    ("diabetes", "diagnosis"), ("migraña", "diagnosis"), ("gripe", "diagnosis"),
    ("infección", "diagnosis"), ("neumonía", "diagnosis"), ("covid", "diagnosis"),
    ("asma", "diagnosis"),
    # medication
    ("analgesia", "medication"), ("analgésico", "medication"),
    ("paracetamol", "medication"), ("ibuprofeno", "medication"),
    ("antibiótico", "medication"), ("amoxicilina", "medication"),
    ("insulina", "medication"), ("se indica", "medication"),
    ("se prescribe", "medication"), ("tratamiento con", "medication"),
    # laboratory
    ("analítica", "lab"), ("hemograma", "lab"), ("glucosa", "lab"),
    ("colesterol", "lab"), ("resultado", "lab"), ("prueba", "lab"),
    # procedure
    ("cirugía", "procedure"), ("intervención", "procedure"),
    ("radiografía", "procedure"), ("ecografía", "procedure"),
    ("resonancia", "procedure"), ("sutura", "procedure"),
    ("control", "procedure"), ("revisión", "procedure"),
    ("seguimiento", "procedure"),
    # allergy
    ("alergia", "allergy"), ("alérgico", "allergy"),
]


class LLMService:
    def extract_events(self, note_text: str, context: str = "") -> tuple[list[dict], str]:
        """Return (events, extraction_source)."""
        note_text = (note_text or "").strip()
        if not note_text:
            return [], "empty"

        if settings.llm_base_url and settings.llm_api_key:
            events = self._extract_with_llm(note_text, context)
            if events is not None:
                return self._normalize(events), "llm"
            logger.warning("LLM extraction failed; using rule-based fallback")

        return self._extract_rule_based(note_text), "rule-based"

    # -- LLM strategy ------------------------------------------------------
    def _extract_with_llm(self, note_text: str, context: str) -> list[dict] | None:
        try:
            system_prompt = _PROMPT_PATH.read_text(encoding="utf-8")
        except OSError:
            system_prompt = "Extract clinical events as JSON."

        user_content = note_text
        if context:
            user_content = f"Longitudinal patient context:\n{context}\n\nNote:\n{note_text}"

        payload = {
            "model": settings.llm_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            "temperature": 0,
        }
        url = f"{settings.llm_base_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.llm_api_key}",
            "Content-Type": "application/json",
        }
        try:
            with httpx.Client(timeout=settings.llm_timeout_seconds) as client:
                response = client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
            return self._parse_json_events(content)
        except (httpx.HTTPError, KeyError, ValueError) as exc:
            logger.warning("LLM request error: %s", exc)
            return None

    @staticmethod
    def _parse_json_events(content: str) -> list[dict]:
        content = content.strip()
        if content.startswith("```"):
            content = content.strip("`")
            content = content.split("\n", 1)[1] if "\n" in content else content
        data = json.loads(content)
        if isinstance(data, dict):
            data = data.get("events", [])
        return data if isinstance(data, list) else []

    # -- Rule-based strategy ----------------------------------------------
    def _extract_rule_based(self, note_text: str) -> list[dict]:
        fragments = [
            frag.strip()
            for frag in note_text.replace("\n", ". ").replace(";", ".").split(".")
            if frag.strip()
        ]
        events: list[dict] = []
        seen: set[tuple[str, str]] = set()

        for fragment in fragments:
            lowered = fragment.lower()
            for keyword, category in _KEYWORDS:
                if keyword in lowered:
                    key = (category, keyword)
                    if key in seen:
                        continue
                    seen.add(key)
                    events.append(
                        {
                            "category": category,
                            "title": keyword.capitalize(),
                            "description": fragment,
                            "source_quote": fragment,
                            "confidence": 0.55,
                            "event_date": None,
                        }
                    )
        return events

    # -- normalization -----------------------------------------------------
    def _normalize(self, events: list[dict]) -> list[dict]:
        normalized: list[dict] = []
        for raw in events:
            if not isinstance(raw, dict):
                continue
            category = str(raw.get("category", "other")).lower()
            if category not in _CATEGORIES:
                category = "other"
            title = str(raw.get("title") or "").strip()
            if not title:
                continue
            try:
                confidence = float(raw.get("confidence", 0.0))
            except (TypeError, ValueError):
                confidence = 0.0
            normalized.append(
                {
                    "category": category,
                    "title": title[:256],
                    "description": str(raw.get("description") or ""),
                    "source_quote": str(raw.get("sourceQuote") or raw.get("source_quote") or ""),
                    "confidence": max(0.0, min(1.0, confidence)),
                    "event_date": raw.get("eventDate") or raw.get("event_date"),
                }
            )
        return normalized
