from __future__ import annotations

from typing import Any


def _safe_control_string(value: str) -> tuple[str, int]:
    changed = 0
    output: list[str] = []
    for character in value:
        code = ord(character)
        if (code < 32 and character not in ("\n", "\r", "\t")) or code == 127:
            output.append(f"<0x{code:02X}>")
            changed += 1
        else:
            output.append(character)
    return "".join(output), changed


def sanitize_metadata_for_backend(value: Any) -> Any:
    sanitized, changed, fields = _sanitize_value(value, "metadata")
    if isinstance(sanitized, dict) and changed:
        sanitized = {
            **sanitized,
            "metadataSanitized": True,
            "sanitizedFields": fields,
        }
    return sanitized


def sanitize_robot_action_payload(payload: dict[str, Any]) -> dict[str, Any]:
    sanitized = dict(payload)
    metadata = sanitized.get("metadata")
    if isinstance(metadata, dict):
        sanitized["metadata"] = sanitize_metadata_for_backend(metadata)
    return sanitized


def _sanitize_value(value: Any, path: str) -> tuple[Any, bool, list[str]]:
    if isinstance(value, str):
        sanitized, control_count = _safe_control_string(value)
        return sanitized, control_count > 0, [path] if control_count > 0 else []
    if isinstance(value, list):
        changed = False
        fields: list[str] = []
        items: list[Any] = []
        for index, item in enumerate(value):
            sanitized_item, item_changed, item_fields = _sanitize_value(item, f"{path}[{index}]")
            changed = changed or item_changed
            fields.extend(item_fields)
            items.append(sanitized_item)
        return items, changed, fields
    if isinstance(value, tuple):
        sanitized_list, changed, fields = _sanitize_value(list(value), path)
        return sanitized_list, changed, fields
    if isinstance(value, dict):
        changed = False
        fields: list[str] = []
        sanitized_dict: dict[str, Any] = {}
        for key, child in value.items():
            raw_key_string = str(key)
            key_string, key_control_count = _safe_control_string(raw_key_string)
            key_changed = key_control_count > 0
            child_path = f"{path}.{key_string}"
            sanitized_child, child_changed, child_fields = _sanitize_value(child, child_path)
            sanitized_dict[key_string] = sanitized_child
            changed = changed or key_changed or child_changed
            if key_changed:
                fields.append(child_path)
            fields.extend(child_fields)
            if key_string == "firmwareResponse" and isinstance(child, str) and child_changed:
                _sanitized_string, control_count = _safe_control_string(child)
                sanitized_dict["firmwareResponseSanitized"] = True
                sanitized_dict["firmwareResponseRawLength"] = len(child)
                sanitized_dict["firmwareResponseHadControlChars"] = True
                sanitized_dict["firmwareResponseControlCharCount"] = control_count
        return sanitized_dict, changed, fields
    return value, False, []
