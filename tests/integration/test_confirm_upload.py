"""
Integration tests for T-004-BACK: Confirm Upload Webhook

This test suite validates the POST /api/upload/confirm endpoint
that is called after a file has been successfully uploaded to S3.

Test Coverage:
- Happy path: Confirm upload of existing file
- Error handling: File not found in storage
- Event creation in database
- Celery task dispatch (mocked for MVP)
"""
import pytest
from fastapi.testclient import TestClient
from main import app
from supabase import Client

client = TestClient(app)


def test_confirm_upload_happy_path(supabase_client: Client):
    """
    T-004-BACK (FASE ROJA): Verificar confirmación exitosa de archivo subido.
    
    Given: Un archivo ha sido subido exitosamente a Supabase Storage
    When: El frontend llama a POST /api/upload/confirm con file_id y file_key
    Then: 
        - El endpoint retorna 200 OK
        - Verifica existencia del archivo en storage
        - Crea un registro en la tabla 'events'
        - Retorna success=True con event_id
        - (MVP) Retorna task_id indicando que se lanzó procesamiento
    """
    # ARRANGE: Create a test file in Supabase Storage
    bucket_name = "raw-uploads"
    test_file_key = "test/confirm_upload_test.3dm"
    test_content = b"Mock .3dm file content for testing"
    
    # Clean up: Remove test file if it exists from previous run
    try:
        supabase_client.storage.from_(bucket_name).remove([test_file_key])
    except Exception:
        pass  # File doesn't exist, continue
    
    # Upload test file to Supabase Storage
    upload_response = supabase_client.storage.from_(bucket_name).upload(
        path=test_file_key,
        file=test_content,
        file_options={"content-type": "application/x-rhino"}
    )
    
    # Generate a mock file_id (in real flow, this comes from /api/upload/url)
    file_id = "550e8400-e29b-41d4-a716-446655440000"
    
    # ARRANGE: Prepare confirmation payload
    payload = {
        "file_id": file_id,
        "file_key": test_file_key
    }
    
    # ACT: Call the confirm endpoint
    response = client.post("/api/upload/confirm", json=payload)
    
    # ASSERT: Status code should be 200
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    # ASSERT: Response structure
    data = response.json()
    assert "success" in data, "Response missing 'success' field"
    assert data["success"] is True, "Confirmation should be successful"
    assert "message" in data, "Response missing 'message' field"
    assert "event_id" in data, "Response missing 'event_id' field"
    
    # ASSERT: Event was created (verify via database query or response)
    # NOTE: For FASE VERDE, we'll implement actual DB check
    assert data["event_id"] is not None, "event_id should not be null"
    
    # CLEANUP: Remove test file from storage
    supabase_client.storage.from_(bucket_name).remove([test_file_key])


def test_confirm_upload_file_not_found():
    """
    T-004-BACK (FASE ROJA): Verificar manejo de error cuando archivo no existe.
    
    Given: Un file_key que NO existe en Supabase Storage
    When: El frontend intenta confirmar el upload
    Then: El endpoint retorna 404 con mensaje de error apropiado
    """
    # ARRANGE: Payload with non-existent file
    payload = {
        "file_id": "999e8400-e29b-41d4-a716-000000000999",
        "file_key": "non-existent/fake-file.3dm"
    }
    
    # ACT
    response = client.post("/api/upload/confirm", json=payload)
    
    # ASSERT: Should return 404 Not Found
    assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    data = response.json()
    assert "detail" in data, "Error response should contain 'detail' field"
    assert "not found" in data["detail"].lower(), "Error message should indicate file not found"


def test_confirm_upload_invalid_payload():
    """
    T-004-BACK (FASE ROJA): Verificar validación de payload.
    
    Given: Un payload inválido (falta file_key)
    When: Se llama al endpoint
    Then: Retorna 422 Unprocessable Entity (validación Pydantic)
    """
    # ARRANGE: Invalid payload (missing file_key)
    payload = {
        "file_id": "550e8400-e29b-41d4-a716-446655440000"
        # Missing required field 'file_key'
    }
    
    # ACT
    response = client.post("/api/upload/confirm", json=payload)
    
    # ASSERT: Pydantic validation should fail
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    
    data = response.json()
    assert "detail" in data, "Validation error should contain 'detail'"


def test_confirm_upload_creates_event_record(supabase_client: Client):
    """
    T-004-BACK (FASE ROJA): Verificar creación de registro en tabla 'events'.
    
    Given: Un archivo confirmado exitosamente
    When: El endpoint procesa la confirmación
    Then: 
        - Se crea un registro en la tabla 'events' con tipo 'upload.confirmed'
        - El registro contiene file_id, file_key, timestamp
        - El event_id es retornado en la respuesta
    
    NOTE: Este test requiere que exista la tabla 'events' en Supabase.
          Para FASE ROJA, esto fallará. En FASE VERDE, implementaremos la tabla.
    """
    # ARRANGE: Upload test file
    bucket_name = "raw-uploads"
    test_file_key = "test/event_test.3dm"
    test_content = b"Event creation test content"
    
    # Clean up: Remove test file if it exists from previous run
    try:
        supabase_client.storage.from_(bucket_name).remove([test_file_key])
    except Exception:
        pass  # File doesn't exist, continue
    
    supabase_client.storage.from_(bucket_name).upload(
        path=test_file_key,
        file=test_content,
        file_options={"content-type": "application/x-rhino"}
    )
    
    file_id = "660e8400-e29b-41d4-a716-446655440000"
    payload = {
        "file_id": file_id,
        "file_key": test_file_key
    }
    
    # ACT
    response = client.post("/api/upload/confirm", json=payload)
    
    # ASSERT: Verify event was created
    assert response.status_code == 200
    data = response.json()
    event_id = data.get("event_id")
    
    # Query the events table to verify record exists
    # NOTE: This will fail in FASE ROJA if table doesn't exist
    events = supabase_client.table("events").select("*").eq("id", event_id).execute()
    
    assert len(events.data) == 1, "Event record should exist in database"
    event_record = events.data[0]
    assert event_record["file_id"] == file_id, "Event should reference correct file_id"
    assert event_record["event_type"] == "upload.confirmed", "Event type should be 'upload.confirmed'"
    
    # CLEANUP
    supabase_client.storage.from_(bucket_name).remove([test_file_key])
