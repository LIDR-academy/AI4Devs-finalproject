#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class BPMNModelerAPITester:
    def __init__(self, base_url="https://process-mapper-ai.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", endpoint=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test_name": name,
            "success": success,
            "details": details,
            "endpoint": endpoint,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}, Expected: {expected_status}"
            
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    self.log_test(name, True, details, endpoint)
                    return True, response_data
                except:
                    print(f"   Response: {response.text[:200]}...")
                    self.log_test(name, True, details, endpoint)
                    return True, {}
            else:
                error_details = f"{details}. Response: {response.text[:200]}"
                self.log_test(name, False, error_details, endpoint)
                return False, {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout", endpoint)
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}", endpoint)
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        # Test root API endpoint
        self.run_test("API Root Health Check", "GET", "", 200)
        
        # Test health endpoint
        self.run_test("Health Check Endpoint", "GET", "health", 200)

    def test_stats_and_tags(self):
        """Test stats and tags endpoints"""
        print("\n" + "="*50)
        print("TESTING STATS AND TAGS")
        print("="*50)
        
        # Test stats endpoint
        self.run_test("Get Stats", "GET", "stats", 200)
        
        # Test tags endpoint
        self.run_test("Get Tags", "GET", "tags", 200)

    def test_diagrams_crud(self):
        """Test diagram CRUD operations"""
        print("\n" + "="*50)
        print("TESTING DIAGRAMS CRUD")
        print("="*50)
        
        # Test get diagrams
        success, diagrams = self.run_test("Get All Diagrams", "GET", "diagrams", 200)
        
        # Test create diagram
        test_diagram = {
            "name": f"Test Diagram {uuid.uuid4().hex[:8]}",
            "description": "Test diagram created by automated test",
            "current_xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_1</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1" />
  </bpmn:process>
</bpmn:definitions>""",
            "tags": ["test", "automated"]
        }
        
        success, created_diagram = self.run_test("Create Diagram", "POST", "diagrams", 201, test_diagram)
        
        if success and created_diagram:
            diagram_id = created_diagram.get('id')
            if diagram_id:
                # Test get specific diagram
                self.run_test("Get Specific Diagram", "GET", f"diagrams/{diagram_id}", 200)
                
                # Test update diagram
                update_data = {
                    "name": f"Updated Test Diagram {uuid.uuid4().hex[:8]}",
                    "description": "Updated description"
                }
                self.run_test("Update Diagram", "PUT", f"diagrams/{diagram_id}", 200, update_data)
                
                # Test diagram versions
                self.run_test("Get Diagram Versions", "GET", f"diagrams/{diagram_id}/versions", 200)
                
                # Test create version
                version_data = {
                    "commit_message": "Test version",
                    "tags": ["v1.0"],
                    "annotations": "Test annotation",
                    "changed_elements": ["StartEvent_1"]
                }
                self.run_test("Create Version", "POST", f"diagrams/{diagram_id}/versions", 201, version_data)
                
                # Test diagram branches
                self.run_test("Get Diagram Branches", "GET", f"diagrams/{diagram_id}/branches", 200)
                
                # Test create branch
                branch_data = {
                    "name": f"test-branch-{uuid.uuid4().hex[:8]}",
                    "description": "Test branch"
                }
                self.run_test("Create Branch", "POST", f"diagrams/{diagram_id}/branches", 201, branch_data)
                
                # Test diagram comments
                self.run_test("Get Diagram Comments", "GET", f"diagrams/{diagram_id}/comments", 200)
                
                # Test create comment
                comment_data = {
                    "element_id": "StartEvent_1",
                    "element_name": "Start Event",
                    "content": "This is a test comment",
                    "mentions": [],
                    "parent_comment_id": None
                }
                self.run_test("Create Comment", "POST", f"diagrams/{diagram_id}/comments", 201, comment_data)
                
                # Test delete diagram (cleanup)
                self.run_test("Delete Diagram", "DELETE", f"diagrams/{diagram_id}", 200)

    def test_oop_classes_crud(self):
        """Test OOP classes CRUD operations"""
        print("\n" + "="*50)
        print("TESTING OOP CLASSES CRUD")
        print("="*50)
        
        # Test get OOP classes
        self.run_test("Get All OOP Classes", "GET", "oop-classes", 200)
        
        # Test create OOP class
        test_class = {
            "name": f"TestClass{uuid.uuid4().hex[:8]}",
            "description": "Test class created by automated test",
            "category": "order",
            "tags": ["test"],
            "properties": [
                {
                    "name": "id",
                    "type": "string",
                    "description": "Unique identifier",
                    "required": True
                },
                {
                    "name": "amount",
                    "type": "number",
                    "description": "Order amount",
                    "required": True
                }
            ]
        }
        
        success, created_class = self.run_test("Create OOP Class", "POST", "oop-classes", 201, test_class)
        
        if success and created_class:
            class_id = created_class.get('id')
            if class_id:
                # Test get specific class
                self.run_test("Get Specific OOP Class", "GET", f"oop-classes/{class_id}", 200)
                
                # Test update class
                update_data = {
                    "name": f"UpdatedTestClass{uuid.uuid4().hex[:8]}",
                    "description": "Updated description"
                }
                self.run_test("Update OOP Class", "PUT", f"oop-classes/{class_id}", 200, update_data)
                
                # Test class versions
                self.run_test("Get OOP Class Versions", "GET", f"oop-classes/{class_id}/versions", 200)
                
                # Test delete class (cleanup)
                self.run_test("Delete OOP Class", "DELETE", f"oop-classes/{class_id}", 200)

    def test_components_crud(self):
        """Test components CRUD operations"""
        print("\n" + "="*50)
        print("TESTING COMPONENTS CRUD")
        print("="*50)
        
        # Test get components
        self.run_test("Get All Components", "GET", "components", 200)
        
        # Test create component
        test_component = {
            "name": f"TestComponent{uuid.uuid4().hex[:8]}",
            "description": "Test component created by automated test",
            "category": "task",
            "xml_fragment": '<bpmn:task id="TestTask" name="Test Task" />',
            "tags": ["test"],
            "is_public": True
        }
        
        success, created_component = self.run_test("Create Component", "POST", "components", 201, test_component)
        
        if success and created_component:
            component_id = created_component.get('id')
            if component_id:
                # Test update component
                update_data = {
                    "name": f"UpdatedTestComponent{uuid.uuid4().hex[:8]}",
                    "description": "Updated description"
                }
                self.run_test("Update Component", "PUT", f"components/{component_id}", 200, update_data)
                
                # Test increment usage
                self.run_test("Increment Component Usage", "POST", f"components/{component_id}/use", 200)
                
                # Test delete component (cleanup)
                self.run_test("Delete Component", "DELETE", f"components/{component_id}", 200)

    def test_ai_endpoints(self):
        """Test AI generation endpoints"""
        print("\n" + "="*50)
        print("TESTING AI ENDPOINTS")
        print("="*50)
        
        # Test BPMN generation
        ai_request = {
            "prompt": "Create a simple order processing workflow with start event, order validation task, and end event",
            "context": "E-commerce order processing"
        }
        
        success, result = self.run_test("AI Generate BPMN", "POST", "ai/generate-bpmn", 200, ai_request)
        if success:
            print(f"   Generated XML length: {len(result.get('xml', ''))}")
        
        # Test code analysis
        code_request = {
            "code": """
def process_order(order):
    if validate_order(order):
        payment = process_payment(order)
        if payment.success:
            ship_order(order)
            send_confirmation(order)
        else:
            cancel_order(order)
    else:
        reject_order(order)
""",
            "language": "python"
        }
        
        success, result = self.run_test("AI Analyze Code", "POST", "ai/analyze-code", 200, code_request)
        if success:
            print(f"   Generated XML length: {len(result.get('xml', ''))}")

    def test_auth_endpoints(self):
        """Test authentication endpoints (without actual auth)"""
        print("\n" + "="*50)
        print("TESTING AUTH ENDPOINTS")
        print("="*50)
        
        # Test auth/me endpoint (should fail without auth)
        self.run_test("Get Current User (No Auth)", "GET", "auth/me", 401)
        
        # Test logout endpoint
        self.run_test("Logout", "POST", "auth/logout", 200)

    def test_favorites_and_notifications(self):
        """Test favorites and notifications endpoints"""
        print("\n" + "="*50)
        print("TESTING FAVORITES AND NOTIFICATIONS")
        print("="*50)
        
        # Test get favorites (should work without auth but return empty)
        self.run_test("Get Favorites", "GET", "favorites", 200)
        
        # Test get notifications (should work without auth but return empty)
        self.run_test("Get Notifications", "GET", "notifications", 200)
        
        # Test get unread count
        self.run_test("Get Unread Notifications Count", "GET", "notifications/unread-count", 200)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting BPMN Modeler API Tests")
        print(f"Base URL: {self.base_url}")
        print(f"API URL: {self.api_url}")
        
        # Run all test suites
        self.test_health_check()
        self.test_stats_and_tags()
        self.test_diagrams_crud()
        self.test_oop_classes_crud()
        self.test_components_crud()
        self.test_ai_endpoints()
        self.test_auth_endpoints()
        self.test_favorites_and_notifications()
        
        # Print summary
        print("\n" + "="*50)
        print("TEST SUMMARY")
        print("="*50)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Return results for further processing
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": (self.tests_passed/self.tests_run)*100,
            "test_results": self.test_results
        }

def main():
    tester = BPMNModelerAPITester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if results["failed_tests"] == 0:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {results['failed_tests']} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())