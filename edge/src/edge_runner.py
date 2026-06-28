from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from api_client import BackendClient
from simulation.qr_simulator import simulate_truck_qr
from simulation.robot_simulator import simulate_pick_drop
from simulation.vision_simulator import simulate_cube_detection


DEFAULT_BACKEND_URL = "http://localhost:3000"
DEFAULT_CONFIG_PATH = Path("config/edge.config.example.json")


def load_config(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as file:
        config = json.load(file)

    if not isinstance(config, dict):
        raise ValueError("Edge config must be a JSON object")

    mode = config.get("mode", "simulation")
    if mode != "simulation":
        raise ValueError("Entrega 2 edge runner only supports mode=simulation")

    return config


def print_step(title: str, payload: Any) -> None:
    print(f"\n== {title} ==")
    print(json.dumps(payload, indent=2, ensure_ascii=False))


def run_edge_flow(backend_url: str, config_path: Path) -> dict[str, Any]:
    config = load_config(config_path)
    client = BackendClient(backend_url)

    health = client.health()
    print_step("Backend health", health)

    truck_code = str(config.get("truckCode", "TRUCK-001"))
    qr_result = simulate_truck_qr(truck_code)
    print_step("QR simulation", qr_result)

    if not qr_result["isValidTruckCode"]:
        raise ValueError(f"Invalid simulated truck code: {truck_code}")

    session_response = client.create_session(truck_code)
    session = session_response["session"]
    session_id = session["id"]
    print_step("Session created", session)

    vision_result = simulate_cube_detection(config)
    print_step("Vision simulation", vision_result)

    cubes_response = client.register_cubes(
        session_id=session_id,
        source=vision_result["source"],
        cubes=vision_result["cubes"],
    )
    print_step("Cubes registered", cubes_response["session"])

    robot_payload = simulate_pick_drop(config, session_id)
    print_step("Robot simulation payload", robot_payload)

    robot_response = client.register_robot_action(robot_payload)
    print_step("Robot action registered", robot_response["action"])

    dashboard = client.get_operational_dashboard()
    print_step("Operational dashboard", dashboard)

    return {
        "truckCode": truck_code,
        "sessionId": session_id,
        "sessionCode": session.get("code"),
        "cubesSent": len(vision_result["cubes"]),
        "robotActionCode": robot_response["action"].get("code"),
        "dashboardCounts": dashboard.get("counts"),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run RoboDock AI Edge in simulation mode.")
    parser.add_argument("--backend-url", help="Backend base URL. Defaults to BACKEND_URL or localhost.")
    parser.add_argument("--config", help="Path to edge simulation config JSON.")
    args = parser.parse_args()

    load_dotenv()

    backend_url = args.backend_url or os.getenv("BACKEND_URL", DEFAULT_BACKEND_URL)
    config_path = Path(args.config or os.getenv("EDGE_CONFIG_PATH", str(DEFAULT_CONFIG_PATH)))

    print("RoboDock AI Edge - simulation mode")
    print(f"Backend URL: {backend_url}")
    print(f"Config path: {config_path}")

    summary = run_edge_flow(backend_url, config_path)
    print_step("Simulation summary", summary)


if __name__ == "__main__":
    main()
