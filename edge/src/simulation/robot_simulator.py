from __future__ import annotations

from typing import Any


def simulate_pick_drop(config: dict[str, Any], session_id: str) -> dict[str, Any]:
    robot_config = config.get("robot", {})
    metadata = robot_config.get("metadata", {})

    if not isinstance(metadata, dict):
        metadata = {}

    return {
        "sessionId": session_id,
        "actionType": str(robot_config.get("actionType", "PICK_AND_DROP")),
        "status": str(robot_config.get("status", "SUCCESS")),
        "mode": "simulation",
        "color": robot_config.get("color", "red"),
        "metadata": {
            "dryRun": True,
            "source": "edge-simulation",
            **metadata,
        },
    }
