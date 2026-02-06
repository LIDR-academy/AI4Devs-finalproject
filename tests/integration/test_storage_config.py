"""
T-005-INFRA: Test de infraestructura TDD - Supabase Storage.

Este test verifica que el bucket 'raw-uploads' existe y es accesible.
En fase ROJA, este test debe FALLAR porque el bucket NO ha sido configurado aún.
"""
import os
import pytest
from supabase import create_client, Client
from io import BytesIO


@pytest.fixture
def supabase_client() -> Client:
    """
    Fixture que crea un cliente de Supabase usando variables de entorno.
    
    Variables necesarias:
    - SUPABASE_URL: URL de tu instancia de Supabase (ej: https://xxxxx.supabase.co)
    - SUPABASE_KEY: Service role key o anon key del proyecto Supabase
    
    Returns:
        Client: Cliente de Supabase configurado
    """
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        pytest.skip("SUPABASE_URL y SUPABASE_KEY deben estar configurados")
    
    return create_client(url, key)


def test_upload_bucket_access(supabase_client: Client):
    """
    T-005-INFRA: Verifica que el bucket 'raw-uploads' existe y permite operaciones básicas.
    
    Pasos:
    1. Crea un archivo de prueba en memoria
    2. Intenta subirlo al bucket 'raw-uploads'
    3. Verifica que el archivo existe (listado o URL)
    4. Limpia el archivo de prueba
    
    EXPECTATIVA FASE ROJA:
    Este test DEBE FALL AR porque el bucket 'raw-uploads' NO existe todavía.
    El error esperado será algo como: "Bucket not found" o "Storage bucket does not exist"
    """
    bucket_name = "raw-uploads"
    test_filename = "test_infra.txt"
    test_content = b"This is a TDD infrastructure test file"
    
    try:
        # 2. Intentar subir el archivo al bucket
        # NOTA: En fase ROJA esto debe fallar con excepción tipo 'Bucket not found'
        response = supabase_client.storage.from_(bucket_name).upload(
            path=test_filename,
            file=test_content,  # Usar bytes directamente en lugar de BytesIO
            file_options={"content-type": "text/plain"}
        )
        
        # 3. Verificar que el archivo fue subido correctamente
        assert response is not None, "La respuesta de upload no debe ser None"
        
        # 4. Verificar que podemos listar el archivo
        files = supabase_client.storage.from_(bucket_name).list()
        file_names = [f["name"] for f in files]
        assert test_filename in file_names, f"El archivo {test_filename} debe estar en el bucket"
        
        # 5. Verificar que podemos obtener una URL pública o firmada
        public_url = supabase_client.storage.from_(bucket_name).get_public_url(test_filename)
        assert public_url is not None, "Debe poder generar una URL para el archivo"
        assert bucket_name in public_url, "La URL debe contener el nombre del bucket"
        
    finally:
        # CLEANUP: Intentar borrar el archivo de prueba
        # (solo se ejecutará si el upload fue exitoso)
        try:
            supabase_client.storage.from_(bucket_name).remove([test_filename])
        except Exception:
            # Si falla el borrado, no es crítico para el test
            pass
