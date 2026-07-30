import io
from typing import Protocol

from openai import APIConnectionError, APIError, OpenAI

from app.exceptions import AIProviderError

WHISPER_MODEL = "whisper-1"
CLASSIFICATION_MODEL = "gpt-4o-mini"


class IOpenAIClient(Protocol):
    """Seam between the orchestrator and the OpenAI SDK.

    All methods return raw JSON/text strings — parsing and validation stay
    in AIOrchestratorService so that layer is independently unit-testable
    with a FakeOpenAIClient, without ever touching the network.
    """

    def transcribe_audio(self, audio_bytes: bytes, filename: str) -> str: ...

    def classify_clinical_text(self, transcript: str, system_prompt: str) -> str: ...

    def classify_clinical_image(self, image_base64: str, system_prompt: str) -> str: ...


class OpenAIClientWrapper:
    def __init__(self, api_key: str):
        self._client = OpenAI(api_key=api_key)

    def transcribe_audio(self, audio_bytes: bytes, filename: str) -> str:
        try:
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = filename
            result = self._client.audio.transcriptions.create(
                model=WHISPER_MODEL,
                file=audio_file,
            )
            return result.text
        except (APIConnectionError, APIError) as exc:
            raise AIProviderError(f"Whisper transcription failed: {exc}") from exc

    def classify_clinical_text(self, transcript: str, system_prompt: str) -> str:
        try:
            response = self._client.chat.completions.create(
                model=CLASSIFICATION_MODEL,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": transcript},
                ],
            )
            return response.choices[0].message.content or "{}"
        except (APIConnectionError, APIError) as exc:
            raise AIProviderError(f"Clinical text classification failed: {exc}") from exc

    def classify_clinical_image(self, image_base64: str, system_prompt: str) -> str:
        try:
            response = self._client.chat.completions.create(
                model=CLASSIFICATION_MODEL,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Extrae la información clínica de este documento fotografiado.",
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
                            },
                        ],
                    },
                ],
            )
            return response.choices[0].message.content or "{}"
        except (APIConnectionError, APIError) as exc:
            raise AIProviderError(f"Clinical image classification failed: {exc}") from exc
