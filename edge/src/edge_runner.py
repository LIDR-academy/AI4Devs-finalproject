from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

try:
    from .api_client import BackendClient
    from .config import EdgeConfig, load_edge_config
    from .models import EdgeRunProfile
    from .simulation.qr_simulator import simulate_truck_qr
    from .simulation.robot_simulator import simulate_pick_drop
    from .simulation.vision_simulator import simulate_cube_detection
except ImportError:  # Direct execution via python src\edge_runner.py
    from api_client import BackendClient
    from config import EdgeConfig, load_edge_config
    from models import EdgeRunProfile
    from simulation.qr_simulator import simulate_truck_qr
    from simulation.robot_simulator import simulate_pick_drop
    from simulation.vision_simulator import simulate_cube_detection


DEFAULT_BACKEND_URL = "http://localhost:3000"
DEFAULT_CONFIG_PATH = Path("config/edge.config.example.json")


def load_config(path: Path) -> EdgeConfig:
    return load_edge_config(path)


def print_step(title: str, payload: Any) -> None:
    print(f"\n== {title} ==")
    print(json.dumps(payload, indent=2, ensure_ascii=False))


def run_edge_flow(backend_url: str, config_path: Path) -> dict[str, Any]:
    config = load_config(config_path)
    if config.profile is not EdgeRunProfile.SIMULATION:
        raise ValueError(
            f"Edge profile={config.profile.value} is recognized but not executable in this foundation. "
            "No camera or serial adapter was opened."
        )

    simulation_config = config.raw
    client = BackendClient(backend_url)

    health = client.health()
    print_step("Backend health", health)

    truck_code = config.truck_code
    qr_result = simulate_truck_qr(truck_code)
    print_step("QR simulation", qr_result)

    if not qr_result["isValidTruckCode"]:
        raise ValueError(f"Invalid simulated truck code: {truck_code}")

    session_response = client.create_session(truck_code)
    session = session_response["session"]
    session_id = session["id"]
    print_step("Session created", session)

    vision_result = simulate_cube_detection(simulation_config)
    print_step("Vision simulation", vision_result)

    cubes_response = client.register_cubes(
        session_id=session_id,
        source=vision_result["source"],
        cubes=vision_result["cubes"],
    )
    print_step("Cubes registered", cubes_response["session"])

    robot_payload = simulate_pick_drop(simulation_config, session_id)
    print_step("Robot simulation payload", robot_payload)

    robot_response = client.register_robot_action(robot_payload)
    print_step("Robot action registered", robot_response["action"])

    dashboard = client.get_operational_dashboard()
    print_step("Operational dashboard", dashboard)

    return {
        "truckCode": truck_code,
        "profile": config.profile.value,
        "sessionId": session_id,
        "sessionCode": session.get("code"),
        "cubesSent": len(vision_result["cubes"]),
        "robotActionCode": robot_response["action"].get("code"),
        "dashboardCounts": dashboard.get("counts"),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run RoboDock AI Edge with an explicit execution profile.")
    parser.add_argument("--backend-url", help="Backend base URL. Defaults to BACKEND_URL or localhost.")
    parser.add_argument("--config", help="Path to Edge config JSON.")
    args = parser.parse_args()

    load_dotenv()

    backend_url = args.backend_url or os.getenv("BACKEND_URL", DEFAULT_BACKEND_URL)
    config_path = Path(args.config or os.getenv("EDGE_CONFIG_PATH", str(DEFAULT_CONFIG_PATH)))

    config = load_config(config_path)

    print(f"RoboDock AI Edge - profile={config.profile.value}")
    print(f"Backend URL: {backend_url}")
    print(f"Config path: {config_path}")

    summary = run_edge_flow(backend_url, config_path)
    print_step("Simulation summary", summary)


if __name__ == "__main__":
    main()
