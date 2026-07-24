from __future__ import annotations

import json
from pathlib import Path

from src.models import SUPPORTED_COLORS


def valid_drop_zones(slots_per_color: int = 2) -> dict[str, list[dict[str, object]]]:
    payload: dict[str, list[dict[str, object]]] = {}
    for color_index, color in enumerate(SUPPORTED_COLORS):
        payload[color] = [
            {
                "code": f"DROP_{color.upper()}_{order:02d}",
                "color": color,
                "position_order": order,
                "x": color_index * 100 + order,
                "y": -(color_index * 100 + order),
                "z": 80 + order,
                "active": True,
                "occupied": False,
            }
            for order in range(1, slots_per_color + 1)
        ]
    return payload


def write_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

