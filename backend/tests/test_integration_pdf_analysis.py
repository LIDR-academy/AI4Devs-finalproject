"""
Integration tests for PDF Template Analysis feature.

This module contains comprehensive integration tests for the complete workflow
of the PDF template analysis endpoint, testing the full stack from API request
to response with real PDF files.
"""

import pytest
import tempfile
import os
from pathlib import Path
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json
import time

from app.main import app
from app.services.pdf_analysis_service import PDFAnalysisService
from app.schemas.pdf_analysis import TemplateField, AnalysisResponse


class TestPDFAnalysisIntegration:
    """Integration tests for PDF analysis endpoint."""
    
    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)
    
    @pytest.fixture
    def sample_pdf_path(self):
        """Path to sample PDF file."""
        return Path("../exampleTemplates/HorasComplementarias.pdf")
    
    @pytest.fixture
    def sample_pdf_content(self, sample_pdf_path):
        """Load sample PDF content if available."""
        if sample_pdf_path.exists():
            with open(sample_pdf_path, 'rb') as f:
                return f.read()
        return None
    
    def test_complete_workflow_with_real_pdf(self, client, sample_pdf_content):
        """Test complete workflow with real PDF file."""
        if not sample_pdf_content:
            pytest.skip("Sample PDF file not available")
        
        # Make request to endpoint
        files = {'file': ('HorasComplementarias.pdf', sample_pdf_content, 'application/pdf')}
        
        start_time = time.time()
        response = client.post('/api/v1/templates/analyze', files=files)
        end_time = time.time()
        
        # Verify response
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify response structure
        assert 'status' in data
        assert 'data' in data
        assert 'metadata' in data
        
        assert data['status'] == 'success'
        assert isinstance(data['data'], list)
        assert isinstance(data['metadata'], dict)
        
        # Verify metadata
        metadata = data['metadata']
        assert 'total_fields' in metadata
        assert 'processing_time_ms' in metadata
        assert 'document_pages' in metadata
        
        assert isinstance(metadata['total_fields'], int)
        assert isinstance(metadata['processing_time_ms'], int)
        assert isinstance(metadata['document_pages'], int)
        
        assert metadata['total_fields'] > 0
        assert metadata['processing_time_ms'] > 0
        assert metadata['document_pages'] > 0
        
        # Verify processing time is reasonable (less than 5 seconds)
        processing_time_seconds = (end_time - start_time)
        assert processing_time_seconds < 5.0
        
        # Verify field data
        fields = data['data']
        assert len(fields) == metadata['total_fields']
        
        for field in fields:
            # Verify field structure
            assert 'field_id' in field
            assert 'type' in field
            assert 'near_text' in field
            assert 'value_options' in field
            
            # Verify field types
            assert isinstance(field['field_id'], str)
            assert isinstance(field['type'], str)
            assert isinstance(field['near_text'], str)
            assert field['value_options'] is None or isinstance(field['value_options'], list)
            
            # Verify field_id format (should be like A0101, A0102, etc.)
            assert len(field['field_id']) >= 4
            assert field['field_id'][0].isalpha()
            assert field['field_id'][1:].isdigit()
            
            # Verify field type is valid
            assert field['type'] in ['text', 'radiobutton', 'checkbox', 'listbox']
        
        # Verify field ordering (should be in document order)
        field_ids = [field['field_id'] for field in fields]
        # Field IDs should be in ascending order for this document
        sorted_field_ids = sorted(field_ids)
        assert field_ids == sorted_field_ids
        
        print(f"✅ Integration test passed:")
        print(f"   - Fields found: {len(fields)}")
        print(f"   - Processing time: {metadata['processing_time_ms']}ms")
        print(f"   - Document pages: {metadata['document_pages']}")
        print(f"   - Sample fields: {field_ids[:5]}")
    
    def test_meaningful_near_text_extraction(self, client, sample_pdf_content):
        """Test that near_text contains meaningful Spanish descriptive text."""
        if not sample_pdf_content:
            pytest.skip("Sample PDF file not available")
        
        files = {'file': ('HorasComplementarias.pdf', sample_pdf_content, 'application/pdf')}
        response = client.post('/api/v1/templates/analyze', files=files)
        
        assert response.status_code == 200
        data = response.json()
        fields = data['data']
        
        # Verify meaningful text extraction
        meaningful_phrases_found = 0
        spanish_keywords = ['hasta', 'máximo', 'que', 'suponen', 'mínimo', 'días', 'horas']
        
        for field in fields:
            near_text = field['near_text'].lower()
            
            # Check for meaningful Spanish phrases
            if any(keyword in near_text for keyword in spanish_keywords):
                meaningful_phrases_found += 1
            
            # Verify no document codes are present
            assert '4202_11' not in near_text  # Document codes should be filtered out
            assert 'SAC 002' not in near_text
            assert 'DOM (' not in near_text
            
            # Verify reasonable phrase length (2-5 words as specified)
            word_count = len(field['near_text'].split())
            if field['near_text'].strip():  # Only check non-empty text
                assert 1 <= word_count <= 5, f"Field {field['field_id']} has {word_count} words: '{field['near_text']}'"
        
        # Should find meaningful phrases in most fields
        assert meaningful_phrases_found >= len(fields) * 0.5  # At least 50% should have meaningful text
        
        print(f"✅ Meaningful text extraction verified:")
        print(f"   - Fields with meaningful phrases: {meaningful_phrases_found}/{len(fields)}")
        
        # Show examples of meaningful phrases found
        meaningful_examples = []
        for field in fields[:5]:
            if any(keyword in field['near_text'].lower() for keyword in spanish_keywords):
                meaningful_examples.append(f"{field['field_id']}: '{field['near_text']}'")
        
        if meaningful_examples:
            print(f"   - Examples: {meaningful_examples}")
    
    def test_response_format_specification_compliance(self, client, sample_pdf_content):
        """Test that response format matches specification exactly."""
        if not sample_pdf_content:
            pytest.skip("Sample PDF file not available")
        
        files = {'file': ('HorasComplementarias.pdf', sample_pdf_content, 'application/pdf')}
        response = client.post('/api/v1/templates/analyze', files=files)
        
        assert response.status_code == 200
        data = response.json()
        
        # Test exact specification compliance
        expected_root_keys = {'status', 'data', 'metadata'}
        assert set(data.keys()) == expected_root_keys
        
        # Test data array structure
        assert isinstance(data['data'], list)
        for field in data['data']:
            expected_field_keys = {'field_id', 'type', 'near_text', 'value_options'}
            assert set(field.keys()) == expected_field_keys
        
        # Test metadata structure
        expected_metadata_keys = {'total_fields', 'processing_time_ms', 'document_pages'}
        assert set(data['metadata'].keys()) == expected_metadata_keys
        
        # Test that response can be parsed into Pydantic models
        try:
            # This should not raise any validation errors
            analysis_response = AnalysisResponse(**data)
            assert analysis_response.status == 'success'
            assert len(analysis_response.data) > 0
            assert analysis_response.metadata.total_fields > 0
        except Exception as e:
            pytest.fail(f"Response does not match Pydantic model: {e}")
        
        print("✅ Response format specification compliance verified")
    
    def test_error_handling_integration(self, client):
        """Test error handling in complete workflow."""
        
        # Test 1: Invalid file format
        invalid_content = b"This is not a PDF file"
        files = {'file': ('test.txt', invalid_content, 'text/plain')}
        response = client.post('/api/v1/templates/analyze', files=files)
        
        assert response.status_code == 400
        error_data = response.json()
        assert 'detail' in error_data
        assert 'PDF' in error_data['detail'] or 'format' in error_data['detail']
        
        # Test 2: Empty file
        files = {'file': ('empty.pdf', b'', 'application/pdf')}
        response = client.post('/api/v1/templates/analyze', files=files)
        
        assert response.status_code == 400
        error_data = response.json()
        assert 'detail' in error_data
        assert 'empty' in error_data['detail'].lower()
        
        # Test 3: File too large (simulate 11MB file)
        large_content = b'x' * (11 * 1024 * 1024)  # 11MB
        files = {'file': ('large.pdf', large_content, 'application/pdf')}
        response = client.post('/api/v1/templates/analyze', files=files)
        
        assert response.status_code == 413
        error_data = response.json()
        assert 'detail' in error_data
        assert ('size' in error_data['detail'].lower() or 
                'large' in error_data['detail'].lower() or
                'limit' in error_data['detail'].lower())
        
        print("✅ Error handling integration verified")
    
    def test_memory_management_and_cleanup(self, client, sample_pdf_content):
        """Test memory management and resource cleanup."""
        if not sample_pdf_content:
            pytest.skip("Sample PDF file not available")
        
        import psutil
        import os
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Make multiple requests to test memory cleanup
        files = {'file': ('HorasComplementarias.pdf', sample_pdf_content, 'application/pdf')}
        
        for i in range(5):  # Make 5 requests
            response = client.post('/api/v1/templates/analyze', files=files)
            assert response.status_code == 200
        
        # Force garbage collection
        import gc
        gc.collect()
        
        # Check memory usage after requests
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        # Memory increase should be reasonable (less than 50MB)
        max_memory_increase = 50 * 1024 * 1024  # 50MB
        assert memory_increase < max_memory_increase, f"Memory increased by {memory_increase / 1024 / 1024:.2f}MB"
        
        print(f"✅ Memory management verified:")
        print(f"   - Initial memory: {initial_memory / 1024 / 1024:.2f}MB")
        print(f"   - Final memory: {final_memory / 1024 / 1024:.2f}MB")
        print(f"   - Memory increase: {memory_increase / 1024 / 1024:.2f}MB")
    
    def test_concurrent_requests(self, client, sample_pdf_content):
        """Test handling of concurrent requests."""
        if not sample_pdf_content:
            pytest.skip("Sample PDF file not available")
        
        import threading
        import queue
        
        results = queue.Queue()
        
        def make_request():
            """Make a request to the endpoint."""
            try:
                files = {'file': ('HorasComplementarias.pdf', sample_pdf_content, 'application/pdf')}
                response = client.post('/api/v1/templates/analyze', files=files)
                results.put(('success', response.status_code, len(response.json()['data'])))
            except Exception as e:
                results.put(('error', str(e), None))
        
        # Create and start multiple threads
        threads = []
        num_threads = 3
        
        for i in range(num_threads):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Check results
        success_count = 0
        while not results.empty():
            result_type, status_or_error, field_count = results.get()
            if result_type == 'success':
                assert status_or_error == 200
                assert field_count > 0
                success_count += 1
            else:
                pytest.fail(f"Concurrent request failed: {status_or_error}")
        
        assert success_count == num_threads
        print(f"✅ Concurrent requests handled successfully: {success_count}/{num_threads}")
    
    def test_field_ordering_consistency(self, client, sample_pdf_content):
        """Test that field ordering is consistent across multiple requests."""
        if not sample_pdf_content:
            pytest.skip("Sample PDF file not available")
        
        files = {'file': ('HorasComplementarias.pdf', sample_pdf_content, 'application/pdf')}
        
        # Make multiple requests
        field_orders = []
        for i in range(3):
            response = client.post('/api/v1/templates/analyze', files=files)
            assert response.status_code == 200
            
            data = response.json()
            field_ids = [field['field_id'] for field in data['data']]
            field_orders.append(field_ids)
        
        # All requests should return fields in the same order
        first_order = field_orders[0]
        for i, order in enumerate(field_orders[1:], 1):
            assert order == first_order, f"Request {i+1} returned different field order"
        
        print(f"✅ Field ordering consistency verified across {len(field_orders)} requests")
        print(f"   - Field order: {first_order[:5]}...")
    
    @pytest.mark.performance
    def test_performance_benchmarks(self, client, sample_pdf_content):
        """Test performance benchmarks for the endpoint."""
        if not sample_pdf_content:
            pytest.skip("Sample PDF file not available")
        
        files = {'file': ('HorasComplementarias.pdf', sample_pdf_content, 'application/pdf')}
        
        # Measure performance over multiple requests
        processing_times = []
        
        for i in range(5):
            start_time = time.time()
            response = client.post('/api/v1/templates/analyze', files=files)
            end_time = time.time()
            
            assert response.status_code == 200
            
            request_time = (end_time - start_time) * 1000  # Convert to ms
            processing_times.append(request_time)
            
            # Also get reported processing time from response
            data = response.json()
            reported_time = data['metadata']['processing_time_ms']
            
            # Reported time should be reasonable compared to total request time
            assert reported_time < request_time  # Processing time should be less than total request time
        
        # Calculate statistics
        avg_time = sum(processing_times) / len(processing_times)
        max_time = max(processing_times)
        min_time = min(processing_times)
        
        # Performance benchmarks
        assert avg_time < 3000, f"Average processing time too high: {avg_time:.2f}ms"
        assert max_time < 5000, f"Max processing time too high: {max_time:.2f}ms"
        
        print(f"✅ Performance benchmarks verified:")
        print(f"   - Average time: {avg_time:.2f}ms")
        print(f"   - Min time: {min_time:.2f}ms")
        print(f"   - Max time: {max_time:.2f}ms")
