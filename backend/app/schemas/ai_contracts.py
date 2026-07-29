from enum import Enum

from pydantic import BaseModel, model_validator


class Routing(str, Enum):
    BASELINE = "BASELINE"
    TIMELINE = "TIMELINE"


class RedFlag(BaseModel):
    active: bool = False
    justification: str | None = None


class BaselineExtraction(BaseModel):
    type: str
    concept: str
    start_date: str | None = None
    details: str | None = None


class EventExtraction(BaseModel):
    title: str
    date: str
    type: str
    clinical_summary: str
    severity: str
    doctor: str | None = None
    medical_center: str | None = None
    department: str | None = None


class AIStructuredResult(BaseModel):
    """The strict JSON contract expected back from the LLM classification call.

    Either `baseline` or `event` must be populated depending on `routing` —
    validated below so a malformed/incomplete LLM response fails fast and
    is surfaced as an AIResponseParsingError by the orchestrator.
    """

    routing: Routing
    baseline: BaselineExtraction | None = None
    event: EventExtraction | None = None
    red_flag: RedFlag = RedFlag()

    @model_validator(mode="after")
    def _check_routing_payload(self) -> "AIStructuredResult":
        if self.routing == Routing.BASELINE and self.baseline is None:
            raise ValueError("routing=BASELINE requires a populated 'baseline' object")
        if self.routing == Routing.TIMELINE and self.event is None:
            raise ValueError("routing=TIMELINE requires a populated 'event' object")
        return self
