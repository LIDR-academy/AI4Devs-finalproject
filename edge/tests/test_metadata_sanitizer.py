from __future__ import annotations

import json
import unittest
from unittest.mock import Mock, patch

from src.api_client import BackendClient
from src.metadata_sanitizer import sanitize_metadata_for_backend


class MetadataSanitizerTests(unittest.TestCase):
    def test_sanitizes_firmware_response_with_null_and_keeps_done(self) -> None:
        metadata = {
            "firmwareResponse": "UU\x01\x07\x00DONE",
            "selectedCubeColor": "red",
        }

        sanitized = sanitize_metadata_for_backend(metadata)

        self.assertEqual("UU<0x01><0x07><0x00>DONE", sanitized["firmwareResponse"])
        self.assertIn("DONE", sanitized["firmwareResponse"])
        self.assertTrue(sanitized["firmwareResponseSanitized"])
        self.assertEqual(9, sanitized["firmwareResponseRawLength"])
        self.assertTrue(sanitized["firmwareResponseHadControlChars"])
        self.assertEqual(3, sanitized["firmwareResponseControlCharCount"])
        self.assertTrue(sanitized["metadataSanitized"])

    def test_does_not_mark_clean_firmware_response(self) -> None:
        sanitized = sanitize_metadata_for_backend({"firmwareResponse": "DONE"})

        self.assertEqual("DONE", sanitized["firmwareResponse"])
        self.assertNotIn("firmwareResponseSanitized", sanitized)
        self.assertNotIn("metadataSanitized", sanitized)

    def test_recursively_sanitizes_multi_cube_metadata_without_flattening(self) -> None:
        metadata = {
            "multiCubeRunId": "multi-run-001",
            "raw\x00key": "value",
            "attempts": [{"attempt": 1, "note": "fallo\x02control"}],
            "firmwareResponses": [
                {"step": "ready", "firmwareResponse": "DONE"},
                {"step": "pick", "firmwareResponse": "UU\x00DONE"},
            ],
            "physicalConfirmation": {"status": "CONFIRMED"},
        }

        sanitized = sanitize_metadata_for_backend(metadata)

        self.assertEqual("multi-run-001", sanitized["multiCubeRunId"])
        self.assertEqual("value", sanitized["raw<0x00>key"])
        self.assertEqual("fallo<0x02>control", sanitized["attempts"][0]["note"])
        self.assertEqual("UU<0x00>DONE", sanitized["firmwareResponses"][1]["firmwareResponse"])
        self.assertEqual({"status": "CONFIRMED"}, sanitized["physicalConfirmation"])
        self.assertTrue(sanitized["firmwareResponses"][1]["firmwareResponseSanitized"])
        self.assertNotIn("\x00", json.dumps(sanitized, ensure_ascii=False))

    def test_backend_client_sends_robot_action_without_real_null_character(self) -> None:
        response = Mock()
        response.status_code = 200
        response.json.return_value = {"action": {"id": "action-1"}}
        response.text = "{}"

        with patch("src.api_client.requests.request", return_value=response) as request:
            BackendClient("http://backend.test").register_robot_action(
                {
                    "sessionId": "session-id",
                    "metadata": {
                        "firmwareResponses": [
                            {"firmwareResponse": "UU\x00DONE"},
                        ]
                    },
                }
            )

        sent_payload = request.call_args.kwargs["json"]
        sent_metadata = sent_payload["metadata"]
        self.assertEqual("UU<0x00>DONE", sent_metadata["firmwareResponses"][0]["firmwareResponse"])
        self.assertTrue(sent_metadata["firmwareResponses"][0]["firmwareResponseSanitized"])
        self.assertNotIn("\x00", json.dumps(sent_payload, ensure_ascii=False))


if __name__ == "__main__":
    unittest.main()
