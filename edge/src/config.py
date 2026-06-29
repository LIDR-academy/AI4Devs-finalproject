from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    from .models import EdgeRunProfile
except ImportError:  # Direct execution via python src\edge_runner.py
    from models import EdgeRunProfile


class EdgeConfigError(ValueError):
    pass


@dataclass(frozen=True)
class EdgeSafetyConfig:
    dry_run: bool = True
    enable_hardware_motion: bool = False
    human_confirmation_required: bool = True


@dataclass(frozen=True)
class EdgeConfig:
    profile: EdgeRunProfile
    truck_code: str
    drop_zones_path: Path
    safety: EdgeSafetyConfig
    raw: dict[str, Any]


def _require_bool(value: object, field_name: str, default: bool) -> bool:
    if value is None:
        return default
    if not isinstance(value, bool):
        raise EdgeConfigError(f"{field_name} must be a boolean")
    return value


def load_edge_config(path: Path) -> EdgeConfig:
    try:
        with path.open("r", encoding="utf-8") as file:
            raw = json.load(file)
    except (OSError, json.JSONDecodeError) as exc:
        raise EdgeConfigError(f"Could not load Edge config from {path}: {exc}") from exc

    if not isinstance(raw, dict):
        raise EdgeConfigError("Edge config must be a JSON object")

    try:
        profile = EdgeRunProfile.parse(raw.get("profile", raw.get("mode", "simulation")))
    except ValueError as exc:
        raise EdgeConfigError(str(exc)) from exc

    truck_code = str(raw.get("truckCode", "TRUCK-001")).strip()
    if not truck_code:
        raise EdgeConfigError("truckCode must not be empty")

    safety_raw = raw.get("safety", {})
    if not isinstance(safety_raw, dict):
        raise EdgeConfigError("safety must be a JSON object")

    safety = EdgeSafetyConfig(
        dry_run=_require_bool(safety_raw.get("dryRun"), "safety.dryRun", True),
        enable_hardware_motion=_require_bool(
            safety_raw.get("enableHardwareMotion"),
            "safety.enableHardwareMotion",
            False,
        ),
        human_confirmation_required=_require_bool(
            safety_raw.get("humanConfirmationRequired"),
            "safety.humanConfirmationRequired",
            True,
        ),
    )

    drop_zones_raw = raw.get("dropZones", {})
    if not isinstance(drop_zones_raw, dict):
        raise EdgeConfigError("dropZones must be a JSON object")

    drop_zones_value = drop_zones_raw.get("path", "drop_zones.example.json")
    if not isinstance(drop_zones_value, str) or not drop_zones_value.strip():
        raise EdgeConfigError("dropZones.path must be a non-empty string")

    drop_zones_path = Path(drop_zones_value)
    if not drop_zones_path.is_absolute():
        drop_zones_path = path.parent / drop_zones_path

    return EdgeConfig(
        profile=profile,
        truck_code=truck_code,
        drop_zones_path=drop_zones_path,
        safety=safety,
        raw=raw,
    )

