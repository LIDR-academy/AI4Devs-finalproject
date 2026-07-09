from __future__ import annotations

from collections import Counter
from typing import Any

ALLOWED_COLORS = {"red", "blue", "green", "yellow"}


def simulate_cube_detection(config: dict[str, Any]) -> dict[str, Any]:
    vision_config = config.get("vision", {})
    source = str(vision_config.get("source", "simulation"))
    raw_cubes = vision_config.get("cubes", [])

    if not isinstance(raw_cubes, list) or not raw_cubes:
        raise ValueError("vision.cubes must be a non-empty list")

    cubes: list[dict[str, Any]] = []
    for index, raw_cube in enumerate(raw_cubes, start=1):
        if not isinstance(raw_cube, dict):
            raise ValueError(f"vision.cubes[{index}] must be an object")

        color = str(raw_cube.get("color", "")).lower()
        if color not in ALLOWED_COLORS:
            raise ValueError(f"vision.cubes[{index}].color must be one of {sorted(ALLOWED_COLORS)}")

        cubes.append(
            {
                "color": color,
                "x": int(raw_cube.get("x", 0)),
                "y": int(raw_cube.get("y", 0)),
                "w": int(raw_cube.get("w", 0)),
                "h": int(raw_cube.get("h", 0)),
                "confidence": float(raw_cube.get("confidence", 1.0)),
            }
        )

    counts = Counter(cube["color"] for cube in cubes)
    summary = {
        "red": counts.get("red", 0),
        "blue": counts.get("blue", 0),
        "green": counts.get("green", 0),
        "yellow": counts.get("yellow", 0),
        "total": len(cubes),
    }

    return {
        "mode": "simulation",
        "source": source,
        "summary": summary,
        "cubes": cubes,
    }
