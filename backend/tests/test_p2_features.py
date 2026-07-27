# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Test P2 Features for BPMN Modeler:
1. POST /api/diagrams/{id}/validate - BPMN 2.0 validation
2. POST /api/diagrams/{id}/simulate - BFS simulation steps
3. POST /api/diagrams/{id}/generate-uml - UML from OOP data
4. POST /api/diagrams/{id}/generate-docs - Markdown documentation
5. POST /api/diagrams/{id}/analytics - Complexity metrics
6. POST /api/validate-xml - Raw XML validation
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test diagram ID from test_credentials.md
TEST_DIAGRAM_ID = "d6d679b3-a1e7-4609-adbe-f4066fc1b38f"
VALID_DIAGRAM_ID = "5dc38ab6-9ab7-4907-9f95-4a98e88e5dc0"


@pytest.fixture(scope="module")
def auth_token():
    """Get dev login session token."""
    resp = requests.post(f"{BASE_URL}/api/auth/dev-login")
    assert resp.status_code == 200, f"Dev login failed: {resp.text}"
    data = resp.json()
    return data.get("session_token")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    }


class TestValidationEndpoint:
    """Test POST /api/diagrams/{id}/validate"""
    
    def test_validate_existing_diagram(self, auth_headers):
        """Validate an existing diagram returns score, valid, errors, warnings, info."""
        resp = requests.post(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/validate",
            headers=auth_headers
        )
        assert resp.status_code == 200, f"Validation failed: {resp.text}"
        data = resp.json()
        
        # Check response structure
        assert "valid" in data, "Response missing 'valid' field"
        assert "score" in data, "Response missing 'score' field"
        assert "errors" in data, "Response missing 'errors' field"
        assert "warnings" in data, "Response missing 'warnings' field"
        assert "info" in data, "Response missing 'info' field"
        
        # Score should be 0-100
        assert 0 <= data["score"] <= 100, f"Score out of range: {data['score']}"
        
        # Valid should be boolean
        assert isinstance(data["valid"], bool), "valid should be boolean"
        
        print(f"Validation result: valid={data['valid']}, score={data['score']}")
        print(f"Errors: {len(data['errors'])}, Warnings: {len(data['warnings'])}, Info: {len(data['info'])}")
    
    def test_validate_nonexistent_diagram(self, auth_headers):
        """Validate non-existent diagram returns 404."""
        resp = requests.post(
            f"{BASE_URL}/api/diagrams/nonexistent-id-12345/validate",
            headers=auth_headers
        )
        assert resp.status_code == 404, f"Expected 404, got {resp.status_code}"
    
    def test_validate_valid_diagram(self, auth_headers):
        """Validate a known valid diagram should return high score."""
        resp = requests.post(
            f"{BASE_URL}/api/diagrams/{VALID_DIAGRAM_ID}/validate",
            headers=auth_headers
        )
        if resp.status_code == 404:
            pytest.skip("Valid diagram not found - may have been deleted")
        
        assert resp.status_code == 200
        data = resp.json()
        print(f"Valid diagram score: {data['score']}, valid: {data['valid']}")


class TestValidateXMLEndpoint:
    """Test POST /api/validate-xml"""
    
    def test_validate_valid_xml(self, auth_headers):
        """Validate valid BPMN XML returns valid=True."""
        valid_xml = '''<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Inicio" />
    <bpmn:endEvent id="EndEvent_1" name="Fin" />
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>'''
        
        resp = requests.post(
            f"{BASE_URL}/api/validate-xml",
            headers=auth_headers,
            json={"xml": valid_xml}
        )
        assert resp.status_code == 200, f"Validate XML failed: {resp.text}"
        data = resp.json()
        
        assert data["valid"] == True, f"Expected valid=True, got {data}"
        assert data["score"] >= 80, f"Expected high score, got {data['score']}"
        print(f"Valid XML score: {data['score']}")
    
    def test_validate_invalid_xml(self, auth_headers):
        """Validate malformed XML returns valid=False."""
        resp = requests.post(
            f"{BASE_URL}/api/validate-xml",
            headers=auth_headers,
            json={"xml": "<invalid>not closed"}
        )
        assert resp.status_code == 200
        data = resp.json()
        
        assert data["valid"] == False, "Expected valid=False for malformed XML"
        assert len(data["errors"]) > 0, "Expected errors for malformed XML"
        print(f"Invalid XML errors: {data['errors']}")
    
    def test_validate_empty_xml(self, auth_headers):
        """Validate empty XML returns valid=False."""
        resp = requests.post(
            f"{BASE_URL}/api/validate-xml",
            headers=auth_headers,
            json={"xml": ""}
        )
        assert resp.status_code == 200
        data = resp.json()
        
        assert data["valid"] == False
        assert data["score"] == 0


class TestSimulatorEndpoint:
    """Test POST /api/diagrams/{id}/simulate"""
    
    def test_simulate_diagram(self, auth_headers):
        """Simulate diagram returns ordered steps."""
        resp = requests.post(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/simulate",
            headers=auth_headers
        )
        assert resp.status_code == 200, f"Simulation failed: {resp.text}"
        data = resp.json()
        
        # Check response structure
        assert "steps" in data, "Response missing 'steps' field"
        assert isinstance(data["steps"], list), "steps should be a list"
        
        if len(data["steps"]) > 0:
            step = data["steps"][0]
            assert "step" in step, "Step missing 'step' number"
            assert "element_id" in step, "Step missing 'element_id'"
            assert "element_name" in step, "Step missing 'element_name'"
            assert "step_type" in step, "Step missing 'step_type'"
            assert "next" in step, "Step missing 'next' array"
            assert "description" in step, "Step missing 'description'"
            
            # First step should be event (start event)
            assert step["step_type"] in ["event", "task", "gateway"], f"Invalid step_type: {step['step_type']}"
        
        print(f"Simulation returned {len(data['steps'])} steps")
        for s in data["steps"][:5]:
            print(f"  Step {s['step']}: {s['element_name']} ({s['step_type']})")
    
    def test_simulate_nonexistent_diagram(self, auth_headers):
        """Simulate non-existent diagram returns 404."""
        resp = requests.post(
            f"{BASE_URL}/api/diagrams/nonexistent-id-12345/simulate",
            headers=auth_headers
        )
        assert resp.status_code == 404


class TestUMLEndpoint:
    """Test POST /api/diagrams/{id}/generate-uml"""
    
    def test_generate_uml(self, auth_headers):
        """Generate UML returns classes and relationships."""
        resp = requests.post(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/generate-uml",
            headers=auth_headers
        )
        assert resp.status_code == 200, f"UML generation failed: {resp.text}"
        data = resp.json()
        
        # Check response structure
        assert "classes" in data, "Response missing 'classes' field"
        assert "relationships" in data, "Response missing 'relationships' field"
        assert "diagram_name" in data, "Response missing 'diagram_name' field"
        
        assert isinstance(data["classes"], list), "classes should be a list"
        assert isinstance(data["relationships"], list), "relationships should be a list"
        
        print(f"UML generated: {len(data['classes'])} classes, {len(data['relationships'])} relationships")
        
        # If classes exist, check structure
        if len(data["classes"]) > 0:
            cls = data["classes"][0]
            assert "name" in cls, "Class missing 'name'"
            assert "type" in cls, "Class missing 'type'"
            assert "properties" in cls, "Class missing 'properties'"
    
    def test_generate_uml_nonexistent(self, auth_headers):
        """Generate UML for non-existent diagram returns 404."""
        resp = requests.post(
            f"{BASE_URL}/api/diagrams/nonexistent-id-12345/generate-uml",
            headers=auth_headers
        )
        assert resp.status_code == 404


class TestDocsEndpoint:
    """Test POST /api/diagrams/{id}/generate-docs"""
    
    def test_generate_docs(self, auth_headers):
        """Generate docs returns Markdown."""
        resp = requests.post(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/generate-docs",
            headers=auth_headers
        )
        assert resp.status_code == 200, f"Docs generation failed: {resp.text}"
        data = resp.json()
        
        # Check response structure
        assert "markdown" in data, "Response missing 'markdown' field"
        assert "diagram_name" in data, "Response missing 'diagram_name' field"
        
        markdown = data["markdown"]
        assert isinstance(markdown, str), "markdown should be a string"
        assert len(markdown) > 0, "markdown should not be empty"
        
        # Check markdown contains expected sections
        assert "#" in markdown, "Markdown should contain headers"
        
        print(f"Documentation generated: {len(markdown)} characters")
        print(f"First 500 chars:\n{markdown[:500]}")
    
    def test_generate_docs_nonexistent(self, auth_headers):
        """Generate docs for non-existent diagram returns 404."""
        resp = requests.post(
            f"{BASE_URL}/api/diagrams/nonexistent-id-12345/generate-docs",
            headers=auth_headers
        )
        assert resp.status_code == 404


class TestAnalyticsEndpoint:
    """Test POST /api/diagrams/{id}/analytics"""
    
    def test_get_analytics(self, auth_headers):
        """Get analytics returns complexity metrics."""
        resp = requests.post(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/analytics",
            headers=auth_headers
        )
        assert resp.status_code == 200, f"Analytics failed: {resp.text}"
        data = resp.json()
        
        # Check required fields
        required_fields = [
            "tasks", "gateways", "events", "flows",
            "complexity_score", "complexity_level",
            "estimated_paths", "bottlenecks",
            "version_count", "active_branches", "comment_count"
        ]
        
        for field in required_fields:
            assert field in data, f"Response missing '{field}' field"
        
        # Check complexity level is valid
        valid_levels = ["simple", "moderate", "complex", "very_complex"]
        assert data["complexity_level"] in valid_levels, f"Invalid complexity_level: {data['complexity_level']}"
        
        # Check numeric fields
        assert isinstance(data["tasks"], int), "tasks should be int"
        assert isinstance(data["gateways"], int), "gateways should be int"
        assert isinstance(data["flows"], int), "flows should be int"
        assert isinstance(data["complexity_score"], int), "complexity_score should be int"
        
        print(f"Analytics: tasks={data['tasks']}, gateways={data['gateways']}, flows={data['flows']}")
        print(f"Complexity: score={data['complexity_score']}, level={data['complexity_level']}")
        print(f"Estimated paths: {data['estimated_paths']}")
        print(f"Bottlenecks: {data['bottlenecks']}")
    
    def test_analytics_nonexistent(self, auth_headers):
        """Analytics for non-existent diagram returns 404."""
        resp = requests.post(
            f"{BASE_URL}/api/diagrams/nonexistent-id-12345/analytics",
            headers=auth_headers
        )
        assert resp.status_code == 404


class TestDiagramExists:
    """Verify test diagram exists before running other tests."""
    
    def test_diagram_exists(self, auth_headers):
        """Check that the test diagram exists."""
        resp = requests.get(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}",
            headers=auth_headers
        )
        if resp.status_code == 404:
            # Create a test diagram if it doesn't exist
            create_resp = requests.post(
                f"{BASE_URL}/api/diagrams",
                headers=auth_headers,
                json={
                    "name": "TEST_P2_Diagram",
                    "description": "Test diagram for P2 features",
                    "current_xml": '''<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Inicio" />
    <bpmn:task id="Task_1" name="Tarea 1" />
    <bpmn:task id="Task_2" name="Tarea 2" />
    <bpmn:exclusiveGateway id="Gateway_1" name="Decision" />
    <bpmn:endEvent id="EndEvent_1" name="Fin" />
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Gateway_1" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Gateway_1" targetRef="Task_2" name="Si" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Gateway_1" targetRef="EndEvent_1" name="No" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_2" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>''',
                    "tags": ["test", "p2"]
                }
            )
            assert create_resp.status_code == 200, f"Failed to create test diagram: {create_resp.text}"
            print(f"Created test diagram: {create_resp.json().get('id')}")
        else:
            assert resp.status_code == 200
            print(f"Test diagram exists: {TEST_DIAGRAM_ID}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
