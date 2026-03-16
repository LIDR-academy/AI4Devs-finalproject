"""Integration tests for Swagger/OpenAPI documentation endpoints."""

import tempfile
import unittest
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app


class TestSwaggerDocs(unittest.TestCase):
    """Validate Swagger UI and exported API specification."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "swagger_test.db"

        class SwaggerTestConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(SwaggerTestConfig)
        self.client = self.app.test_client()

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def _spec_paths_with_base(self, spec: dict) -> set[str]:
        """Return normalized full paths including API base path prefix."""
        base_path = str(spec.get("basePath") or "").rstrip("/")
        normalized: set[str] = set()
        for raw_path in (spec.get("paths") or {}):
            if not isinstance(raw_path, str):
                continue
            path = raw_path if raw_path.startswith("/") else f"/{raw_path}"
            if base_path and path.startswith(base_path + "/"):
                normalized.add(path)
            elif base_path:
                normalized.add(f"{base_path}{path}")
            else:
                normalized.add(path)
        return normalized

    def test_swagger_ui_is_accessible(self) -> None:
        """Swagger UI should be served at /swagger."""
        response = self.client.get("/swagger")
        self.assertEqual(response.status_code, 200)
        body = response.get_data(as_text=True).lower()
        self.assertIn("swagger", body)

    def test_swagger_json_contains_expected_top_level_keys(self) -> None:
        """Exported JSON spec should include metadata and schema definitions."""
        response = self.client.get("/swagger.json")
        self.assertEqual(response.status_code, 200)

        spec = response.get_json()
        self.assertIsInstance(spec, dict)
        self.assertEqual(spec.get("openapi"), "3.0.3")
        self.assertEqual(spec.get("basePath"), "/api/v1")
        self.assertIn("paths", spec)
        self.assertIn("definitions", spec)
        self.assertIn("securityDefinitions", spec)
        self.assertIn("ApiKeyAuth", spec["securityDefinitions"])
        self.assertIn("ErrorEnvelope", spec["definitions"])

    def test_all_api_endpoints_are_documented(self) -> None:
        """Swagger spec should include all exposed API routes for v1."""
        response = self.client.get("/swagger.json")
        self.assertEqual(response.status_code, 200)
        spec = response.get_json()

        documented_paths = self._spec_paths_with_base(spec)
        expected_paths = {
            "/api/v1/users/register",
            "/api/v1/users/status",
            "/api/v1/users/renew/challenge",
            "/api/v1/users/renew",
            "/api/v1/users/admin",
            "/api/v1/users/admin/audit-logs",
            "/api/v1/users/revoke",
            "/api/v1/users/reactivate",
            "/api/v1/files/upload",
            "/api/v1/files/upload/status/{task_id}",
            "/api/v1/files/retrieve/{cid}",
            "/api/v1/files/pin/{cid}",
            "/api/v1/files/unpin/{cid}",
            "/api/v1/tasks/{task_id}/status",
            "/api/v1/tasks/failed",
            "/api/v1/tasks/failed/{failure_id}/replay",
        }

        missing = expected_paths - documented_paths
        self.assertFalse(missing, f"Missing documented paths: {sorted(missing)}")

    def test_register_endpoint_has_request_schema(self) -> None:
        """Register endpoint should document request body and responses."""
        response = self.client.get("/swagger.json")
        self.assertEqual(response.status_code, 200)
        spec = response.get_json()

        register_path = (spec.get("paths") or {}).get("/users/register")
        self.assertIsInstance(register_path, dict)
        post_operation = register_path.get("post")
        self.assertIsInstance(post_operation, dict)

        parameters = post_operation.get("parameters") or []
        self.assertTrue(parameters)
        body_params = [p for p in parameters if p.get("in") == "body"]
        self.assertTrue(body_params)
        body_schema = body_params[0].get("schema") or {}
        self.assertEqual(body_schema.get("$ref"), "#/definitions/RegisterRequest")

        responses = post_operation.get("responses") or {}
        self.assertIn("201", responses)
        self.assertIn("422", responses)


if __name__ == "__main__":
    unittest.main()
