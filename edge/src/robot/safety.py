from __future__ import annotations

import math

try:
    from ..config import PickupRobotCalibration, WorkspaceLimits
    from ..models import CubeDetection, RobotPose
except ImportError:
    from config import PickupRobotCalibration, WorkspaceLimits
    from models import CubeDetection, RobotPose


class RobotSafetyError(ValueError):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        super().__init__(f"{code}: {message}")


def validate_pose(pose: RobotPose, workspace: WorkspaceLimits, label: str) -> None:
    coordinates = (pose.x, pose.y, pose.z)
    if not all(math.isfinite(value) for value in coordinates):
        raise RobotSafetyError("INVALID_POSE", f"{label} contains a non-finite coordinate")
    if not (
        workspace.min_x <= pose.x <= workspace.max_x
        and workspace.min_y <= pose.y <= workspace.max_y
        and workspace.min_z <= pose.z <= workspace.max_z
    ):
        raise RobotSafetyError("POSE_OUT_OF_WORKSPACE", f"{label} is outside configured workspace")


def map_cube_to_pick_pose(
    cube: CubeDetection,
    calibration: PickupRobotCalibration,
    pick_z: float,
) -> RobotPose:
    center_x, center_y = cube.center
    roi = calibration.image_roi
    if not (
        roi.x <= center_x <= roi.x + roi.w
        and roi.y <= center_y <= roi.y + roi.h
    ):
        raise RobotSafetyError(
            "CUBE_OUTSIDE_CALIBRATION",
            "cube center is outside calibrated pickup image ROI",
        )

    u = (center_x - roi.x) / roi.w
    v = (center_y - roi.y) / roi.h
    corners = {
        "top_left": calibration.top_left,
        "top_right": calibration.top_right,
        "bottom_left": calibration.bottom_left,
        "bottom_right": calibration.bottom_right,
    }
    weights = {
        "top_left": (1.0 - u) * (1.0 - v),
        "top_right": u * (1.0 - v),
        "bottom_left": (1.0 - u) * v,
        "bottom_right": u * v,
    }
    x = sum(corners[name].x * weight for name, weight in weights.items())
    y = sum(corners[name].y * weight for name, weight in weights.items())
    return RobotPose(x=round(x, 3), y=round(y, 3), z=pick_z)

