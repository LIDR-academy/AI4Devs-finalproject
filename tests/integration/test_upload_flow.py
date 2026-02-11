import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_generate_presigned_url_happy_path():
    """
    T-001: Verificar que el endpoint devuelve una URL firmada válida
    cuando se envían datos correctos.
    """
    # 1. Prepare Payload
    payload = {
        "filename": "pieza_cubierta_c12.3dm",
        "size": 1024 * 1024 * 50,  # 50MB
        "checksum": "sha256:dummychecksum12345"
    }

    # 2. Execute Request
    response = client.post("/api/upload/url", json=payload)

    # 3. Assertions
    assert response.status_code == 200

    data = response.json()
    assert "upload_url" in data
    assert "file_id" in data
    assert "supabase.co" in data["upload_url"]  # Must be a real Supabase Storage signed URL
    assert data["filename"] == payload["filename"]

def test_generate_presigned_url_invalid_extension():
    """
    T-001: Verificar validación de extensión (solo .3dm permitidos).
    """
    payload = {
        "filename": "documento.pdf",
        "size": 1000,
        "checksum": "dummy"
    }
    
    response = client.post("/api/upload/url", json=payload)
    
    assert response.status_code == 400
    assert "detail" in response.json()
