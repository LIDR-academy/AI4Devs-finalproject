# Spec Summary (Lite)

Implement a transactional API endpoint POST /api/v1/templates/analyze that accepts PDF uploads and returns structured AcroForm field analysis in document order. The endpoint provides real-time PDF structure extraction using PyPDF2/pdfplumber without database persistence, returning field IDs, types, nearby text context, and selection options through Pydantic models for integration mapping support.
