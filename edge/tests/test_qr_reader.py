from __future__ import annotations

import unittest

import numpy as np

from src.vision.qr_reader import QrReader


class FakeQrDetector:
    def __init__(self, value: str) -> None:
        self.value = value

    def detectAndDecode(self, _frame):
        return self.value, None, None


class QrReaderTests(unittest.TestCase):
    def setUp(self) -> None:
        self.frame = np.zeros((80, 80, 3), dtype=np.uint8)

    def test_valid_qr_returns_truck_code(self) -> None:
        result = QrReader(
            allowed_truck_codes=("TRUCK-001",),
            detector=FakeQrDetector("TRUCK-001"),
        ).read(self.frame)

        self.assertTrue(result.detected)
        self.assertTrue(result.is_valid)
        self.assertEqual("TRUCK-001", result.truck_code)

    def test_absent_qr_returns_empty_result(self) -> None:
        result = QrReader(detector=FakeQrDetector("")).read(self.frame)

        self.assertFalse(result.detected)
        self.assertFalse(result.is_valid)
        self.assertIsNone(result.raw_value)
        self.assertIsNone(result.truck_code)

    def test_invalid_or_disallowed_qr_is_not_a_truck(self) -> None:
        for value in ("not-a-truck", "TRUCK-999"):
            with self.subTest(value=value):
                result = QrReader(
                    allowed_truck_codes=("TRUCK-001",),
                    detector=FakeQrDetector(value),
                ).read(self.frame)
                self.assertTrue(result.detected)
                self.assertFalse(result.is_valid)
                self.assertEqual(value, result.raw_value)
                self.assertIsNone(result.truck_code)


if __name__ == "__main__":
    unittest.main()

