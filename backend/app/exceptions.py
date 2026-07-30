class AIProviderError(Exception):
    """Raised when the upstream AI provider (OpenAI) fails or times out."""


class AIResponseParsingError(Exception):
    """Raised when the AI provider's JSON response is malformed or fails schema validation."""


class PatientNotFoundError(Exception):
    """Raised when a patient_id does not exist in the repository."""
