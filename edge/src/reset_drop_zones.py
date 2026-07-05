from __future__ import annotations

import argparse
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    from .config import load_edge_config
except ImportError:
    from config import load_edge_config


class ResetDropZonesError(RuntimeError):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        super().__init__(f"{code}: {message}")


def _backup_path(path: Path, timestamp: str | None = None) -> Path:
    suffix = timestamp or datetime.now().strftime("%Y%m%d-%H%M%S")
    return path.with_name(f"{path.name}.backup-{suffix}")


def reset_drop_zones(
    config_path: Path,
    *,
    reset_all: bool = False,
    color: str | None = None,
    confirm_reset: bool = False,
    backup_timestamp: str | None = None,
) -> dict[str, Any]:
    if not confirm_reset:
        raise ResetDropZonesError("CONFIRMATION_REQUIRED", "Use --confirm-reset to modify drop zones")
    if reset_all == bool(color):
        raise ResetDropZonesError("TARGET_REQUIRED", "Use exactly one target: --all or --color COLOR")

    config = load_edge_config(config_path)
    drop_zones_path = config.drop_zones_path
    try:
        payload = json.loads(drop_zones_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ResetDropZonesError("DROP_ZONES_UNAVAILABLE", f"Could not load drop zones: {exc}") from exc
    if not isinstance(payload, dict):
        raise ResetDropZonesError("DROP_ZONES_INVALID", "Drop zones JSON must be an object keyed by color")

    target_color = color.strip().lower() if color else None
    if target_color is not None and target_color not in payload:
        raise ResetDropZonesError("COLOR_NOT_FOUND", f"Color not found in drop zones: {target_color}")

    total_slots = 0
    reset_count = 0
    affected_colors: set[str] = set()
    for zone_color, slots in payload.items():
        if target_color is not None and zone_color != target_color:
            continue
        if not isinstance(slots, list):
            raise ResetDropZonesError("DROP_ZONES_INVALID", f"Drop zone color {zone_color} must be a list")
        for slot in slots:
            if not isinstance(slot, dict):
                raise ResetDropZonesError("DROP_ZONES_INVALID", f"Drop zone color {zone_color} contains a non-object slot")
            total_slots += 1
            if slot.get("occupied") is True:
                slot["occupied"] = False
                reset_count += 1
                affected_colors.add(zone_color)

    backup = _backup_path(drop_zones_path, backup_timestamp)
    shutil.copy2(drop_zones_path, backup)
    drop_zones_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    return {
        "file": str(drop_zones_path),
        "backup": str(backup),
        "totalSlotsReviewed": total_slots,
        "totalSlotsReset": reset_count,
        "affectedColors": sorted(affected_colors),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Reset RoboDock drop-zone occupancy flags.")
    parser.add_argument("--config", required=True)
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument("--all", action="store_true")
    target.add_argument("--color")
    parser.add_argument("--confirm-reset", action="store_true")
    args = parser.parse_args()

    try:
        summary = reset_drop_zones(
            Path(args.config),
            reset_all=args.all,
            color=args.color,
            confirm_reset=args.confirm_reset,
        )
    except ResetDropZonesError as exc:
        raise SystemExit(str(exc)) from exc
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
