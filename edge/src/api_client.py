from __future__ import annotations

from typing import Any

import requests


class BackendApiError(RuntimeError):
    """Raised when the backend returns an unexpected response."""


class BackendClient:
    def __init__(self, base_url: str, timeout_seconds: float = 10.0) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def health(self) -> dict[str, Any]:
        return self._request("GET", "/health")

    def create_session(self, truck_code: str) -> dict[str, Any]:
        data = self._request("POST", "/sessions", json={"truckCode": truck_code})
        session = self._require_object(data, "session", "create_session")
        self._require_any_key(session, ("id",), "create_session session")
        return data

    def register_cubes(self, session_id: str, source: str, cubes: list[dict[str, Any]]) -> dict[str, Any]:
        return self._request(
            "POST",
            f"/sessions/{session_id}/cubes",
            json={
                "source": source,
                "cubes": cubes,
            },
        )

    def register_robot_action(self, payload: dict[str, Any]) -> dict[str, Any]:
        data = self._request("POST", "/robot/actions", json=payload)
        action = self._require_object(data, "action", "register_robot_action")
        self._require_any_key(action, ("id", "code"), "register_robot_action action")
        return data

    def get_operational_dashboard(self) -> dict[str, Any]:
        data = self._request("GET", "/dashboard/operational")
        counts = self._require_object(data, "counts", "get_operational_dashboard")
        self._require_any_key(counts, ("total",), "get_operational_dashboard counts")
        return data

    def _request(self, method: str, path: str, **kwargs: Any) -> dict[str, Any]:
        url = f"{self.base_url}{path}"
        try:
            response = requests.request(method, url, timeout=self.timeout_seconds, **kwargs)
        except requests.RequestException as exc:
            raise BackendApiError(f"Backend request failed: {method} {url}: {exc}") from exc

        if response.status_code >= 400:
            raise BackendApiError(
                f"Backend returned HTTP {response.status_code} for {method} {url}: {response.text}"
            )

        try:
            data = response.json()
        except ValueError as exc:
            raise BackendApiError(f"Backend returned non-JSON response for {method} {url}") from exc

        if not isinstance(data, dict):
            raise BackendApiError(f"Backend returned unexpected JSON type for {method} {url}")

        return data

    def _require_object(self, data: dict[str, Any], key: str, operation: str) -> dict[str, Any]:
        value = data.get(key)
        if not isinstance(value, dict):
            raise BackendApiError(f"Backend response for {operation} must include object '{key}'")
        return value

    def _require_any_key(self, data: dict[str, Any], keys: tuple[str, ...], operation: str) -> None:
        if not any(key in data for key in keys):
            expected = " or ".join(f"'{key}'" for key in keys)
            raise BackendApiError(f"Backend response for {operation} must include {expected}")
