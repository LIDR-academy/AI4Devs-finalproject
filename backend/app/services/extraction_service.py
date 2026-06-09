from app.services.openai_service import OpenAIService


class ExtractionService:
    def __init__(self):
        self.openai_service = OpenAIService()

    def extract_from_note(self, note_text: str) -> list[dict]:
        return self.openai_service.extract_events(note_text)
