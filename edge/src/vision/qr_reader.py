from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

import cv2

try:
    from ..models import RegionOfInterest
    from .capture import crop_frame
except ImportError:
    from models import RegionOfInterest
    from vision.capture import crop_frame


@dataclass(frozen=True)
class QrReadResult:
    raw_value: str | None
    truck_code: str | None
    is_valid: bool
    detected: bool


class QrReader:
    def __init__(
        self,
        pattern: str = r"^TRUCK-.+$",
        allowed_truck_codes: tuple[str, ...] = (),
        detector: Any | None = None,
    ) -> None:
        self.pattern = re.compile(pattern)
        self.allowed_truck_codes = frozenset(allowed_truck_codes)
        self.detector = detector or cv2.QRCodeDetector()

    def read(self, frame: Any, roi: RegionOfInterest | None = None) -> QrReadResult:
        region, _, _ = crop_frame(frame, roi)
        raw_value, _points, _straight = self.detector.detectAndDecode(region)
        normalized = str(raw_value).strip()
        if not normalized:
            return QrReadResult(raw_value=None, truck_code=None, is_valid=False, detected=False)

        matches_pattern = self.pattern.fullmatch(normalized) is not None
        matches_allowlist = (
            not self.allowed_truck_codes or normalized in self.allowed_truck_codes
        )
        is_valid = matches_pattern and matches_allowlist
        return QrReadResult(
            raw_value=normalized,
            truck_code=normalized if is_valid else None,
            is_valid=is_valid,
            detected=True,
        )
