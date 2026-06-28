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
        return self._request("POST", "/sessions", json={"truckCode": truck_code})

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
        return self._request("POST", "/robot/actions", json=payload)

    def get_operational_dashboard(self) -> dict[str, Any]:
        return self._request("GET", "/dashboard/operational")

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
