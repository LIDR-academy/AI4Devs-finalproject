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
        min_fill_ratio: float,
        morphology_kernel_size: int = 5,
    ) -> None:
        if set(hsv_ranges) != set(SUPPORTED_COLORS):
            raise ValueError(f"hsv_ranges must define exactly {sorted(SUPPORTED_COLORS)}")
        if min_area <= 0 or max_area < min_area:
            raise ValueError("Area limits are invalid")
        if not 0 <= min_fill_ratio <= 1:
            raise ValueError("min_fill_ratio must be between 0 and 1")
        if morphology_kernel_size <= 0:
            raise ValueError("morphology_kernel_size must be positive")

        self.hsv_ranges = hsv_ranges
        self.min_area = min_area
        self.max_area = max_area
        self.min_fill_ratio = min_fill_ratio
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
                box_area = w * h
                fill_ratio = contour_area / box_area if box_area else 0.0
                if w <= 0 or h <= 0 or fill_ratio < self.min_fill_ratio:
                    continue

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
                            "sizeValid": True,
                            "coordinateSpace": "frame-pixels",
                        },
                    )
                )

        color_order = {color: index for index, color in enumerate(SUPPORTED_COLORS)}
        return tuple(
            sorted(
                detections,
                key=lambda item: (color_order[item.color], item.x, item.y, item.w, item.h),
            )
        )

