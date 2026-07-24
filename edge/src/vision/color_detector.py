from __future__ import annotations

from typing import Any

import cv2
import numpy as np

try:
    from ..models import CubeDetection, HsvRange, RegionOfInterest, SUPPORTED_COLORS
    from .capture import crop_frame
except ImportError:
    from models import CubeDetection, HsvRange, RegionOfInterest, SUPPORTED_COLORS
    from vision.capture import crop_frame


class ColorDetector:
    def __init__(
        self,
        hsv_ranges: dict[str, tuple[HsvRange, ...]],
        *,
        min_area: float,
        max_area: float,
        min_width: float = 8.0,
        max_width: float = 160.0,
        min_height: float = 8.0,
        max_height: float = 160.0,
        min_fill_ratio: float = 0.45,
        min_aspect_ratio: float = 0.5,
        max_aspect_ratio: float = 2.0,
        overlap_threshold: float = 0.35,
        size_valid: bool = True,
        morphology_kernel_size: int = 5,
    ) -> None:
        if set(hsv_ranges) != set(SUPPORTED_COLORS):
            raise ValueError(f"hsv_ranges must define exactly {sorted(SUPPORTED_COLORS)}")
        if min_area <= 0 or max_area < min_area:
            raise ValueError("Area limits are invalid")
        if min_width <= 0 or max_width < min_width:
            raise ValueError("Width limits are invalid")
        if min_height <= 0 or max_height < min_height:
            raise ValueError("Height limits are invalid")
        if not 0 <= min_fill_ratio <= 1:
            raise ValueError("min_fill_ratio must be between 0 and 1")
        if min_aspect_ratio <= 0 or max_aspect_ratio < min_aspect_ratio:
            raise ValueError("Aspect ratio limits are invalid")
        if not 0 <= overlap_threshold <= 1:
            raise ValueError("overlap_threshold must be between 0 and 1")
        if morphology_kernel_size <= 0:
            raise ValueError("morphology_kernel_size must be positive")

        self.hsv_ranges = hsv_ranges
        self.min_area = min_area
        self.max_area = max_area
        self.min_width = min_width
        self.max_width = max_width
        self.min_height = min_height
        self.max_height = max_height
        self.min_fill_ratio = min_fill_ratio
        self.min_aspect_ratio = min_aspect_ratio
        self.max_aspect_ratio = max_aspect_ratio
        self.overlap_threshold = overlap_threshold
        self.size_valid = size_valid
        self.kernel = np.ones(
            (morphology_kernel_size, morphology_kernel_size),
            dtype=np.uint8,
        )

    def detect(
        self,
        frame: Any,
        roi: RegionOfInterest | None = None,
    ) -> tuple[CubeDetection, ...]:
        region, offset_x, offset_y = crop_frame(frame, roi)
        hsv_frame = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
        detections: list[CubeDetection] = []

        for color in SUPPORTED_COLORS:
            mask = np.zeros(hsv_frame.shape[:2], dtype=np.uint8)
            for hsv_range in self.hsv_ranges[color]:
                lower = np.array(hsv_range.lower, dtype=np.uint8)
                upper = np.array(hsv_range.upper, dtype=np.uint8)
                mask = cv2.bitwise_or(mask, cv2.inRange(hsv_frame, lower, upper))

            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, self.kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, self.kernel)
            contours, _hierarchy = cv2.findContours(
                mask,
                cv2.RETR_EXTERNAL,
                cv2.CHAIN_APPROX_SIMPLE,
            )

            for contour in contours:
                contour_area = float(cv2.contourArea(contour))
                if contour_area < self.min_area or contour_area > self.max_area:
                    continue

                x, y, w, h = cv2.boundingRect(contour)
                if not self._is_size_valid(w, h):
                    continue

                box_area = w * h
                fill_ratio = contour_area / box_area if box_area else 0.0
                if w <= 0 or h <= 0 or fill_ratio < self.min_fill_ratio:
                    continue
                aspect_ratio = w / h

                detections.append(
                    CubeDetection(
                        color=color,
                        x=x + offset_x,
                        y=y + offset_y,
                        w=w,
                        h=h,
                        confidence=None,
                        metadata={
                            "area": round(contour_area, 3),
                            "fillRatio": round(fill_ratio, 4),
                            "aspectRatio": round(aspect_ratio, 4),
                            "sizeValid": self.size_valid,
                            "coordinateSpace": "frame-pixels",
                            "roiLimited": roi is not None,
                        },
                    )
                )

        color_order = {color: index for index, color in enumerate(SUPPORTED_COLORS)}
        detections = self._deduplicate(detections)
        return tuple(
            sorted(
                detections,
                key=lambda item: (color_order[item.color], item.x, item.y, item.w, item.h),
            )
        )

    def _is_size_valid(self, width: int, height: int) -> bool:
        if width <= 0 or height <= 0:
            return False
        if width < self.min_width or width > self.max_width:
            return False
        if height < self.min_height or height > self.max_height:
            return False
        aspect_ratio = width / height
        return self.min_aspect_ratio <= aspect_ratio <= self.max_aspect_ratio

    def _deduplicate(self, detections: list[CubeDetection]) -> list[CubeDetection]:
        if self.overlap_threshold <= 0 or len(detections) < 2:
            return detections

        ranked = sorted(
            detections,
            key=lambda item: (
                float(item.metadata.get("area", item.area)),
                item.confidence if item.confidence is not None else 0.0,
            ),
            reverse=True,
        )
        kept: list[CubeDetection] = []
        for candidate in ranked:
            if all(self._iou(candidate, existing) <= self.overlap_threshold for existing in kept):
                kept.append(candidate)
        return kept

    @staticmethod
    def _iou(first: CubeDetection, second: CubeDetection) -> float:
        left = max(first.x, second.x)
        top = max(first.y, second.y)
        right = min(first.x + first.w, second.x + second.w)
        bottom = min(first.y + first.h, second.y + second.h)
        intersection_width = max(0, right - left)
        intersection_height = max(0, bottom - top)
        intersection = intersection_width * intersection_height
        if intersection <= 0:
            return 0.0
        union = first.area + second.area - intersection
        return intersection / union if union > 0 else 0.0
