from __future__ import annotations


def simulate_truck_qr(truck_code: str = "TRUCK-001") -> dict[str, str | bool]:
    return {
        "mode": "simulation",
        "rawValue": truck_code,
        "truckCode": truck_code,
        "isValidTruckCode": truck_code.startswith("TRUCK-"),
    }
