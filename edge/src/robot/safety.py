from __future__ import annotations

import math

import numpy as np

try:
    from ..config import PickupRobotCalibration, WorkspaceLimits
    from ..models import CubeDetection, ImagePoint, RobotPose
except ImportError:
    from config import PickupRobotCalibration, WorkspaceLimits
    from models import CubeDetection, ImagePoint, RobotPose


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
    pose, _ = map_cube_to_pick_pose_with_metadata(cube, calibration, pick_z)
    return pose


def map_cube_to_pick_pose_with_metadata(
    cube: CubeDetection,
    calibration: PickupRobotCalibration,
    pick_z: float,
) -> tuple[RobotPose, ImagePoint | None]:
    center_x, center_y = cube.center
    if calibration.visual is not None:
        pickup_position_cm = map_frame_point_to_pickup_cm(center_x, center_y, calibration)
        robot_xy = map_pickup_cm_to_robot_xy(
            pickup_position_cm.x,
            pickup_position_cm.y,
            calibration,
        )
        return RobotPose(x=robot_xy.x, y=robot_xy.y, z=pick_z), pickup_position_cm

    if calibration.image_roi is None:
        raise RobotSafetyError(
            "MISSING_VISUAL_CALIBRATION",
            "visual pickup calibration is required unless legacy imageRoi is configured",
        )

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
    return RobotPose(x=round(x, 3), y=round(y, 3), z=pick_z), None


def map_frame_point_to_pickup_cm(
    x_px: float,
    y_px: float,
    calibration: PickupRobotCalibration,
) -> ImagePoint:
    visual = calibration.visual
    if visual is None:
        raise RobotSafetyError("MISSING_VISUAL_CALIBRATION", "visual calibration with cornersPx is required")

    source = (
        visual.top_left,
        visual.top_right,
        visual.bottom_right,
        visual.bottom_left,
    )
    destination = (
        ImagePoint(0.0, 0.0),
        ImagePoint(visual.pickup_width_cm, 0.0),
        ImagePoint(visual.pickup_width_cm, visual.pickup_height_cm),
        ImagePoint(0.0, visual.pickup_height_cm),
    )
    matrix = _homography_matrix(source, destination)
    mapped = matrix @ np.array([float(x_px), float(y_px), 1.0], dtype=float)
    if abs(float(mapped[2])) < 1e-9:
        raise RobotSafetyError("INVALID_VISUAL_CALIBRATION", "homography produced an invalid point")
    x_cm = float(mapped[0] / mapped[2])
    y_cm = float(mapped[1] / mapped[2])
    tolerance_cm = max(visual.cube_size_cm * 0.5, 0.5)
    if (
        x_cm < -tolerance_cm
        or y_cm < -tolerance_cm
        or x_cm > visual.pickup_width_cm + tolerance_cm
        or y_cm > visual.pickup_height_cm + tolerance_cm
    ):
        raise RobotSafetyError(
            "CUBE_OUTSIDE_CALIBRATION",
            "cube center is outside calibrated pickup cornersPx area",
        )
    x_cm = max(0.0, min(visual.pickup_width_cm, x_cm))
    y_cm = max(0.0, min(visual.pickup_height_cm, y_cm))
    return ImagePoint(round(x_cm, 3), round(y_cm, 3))


def map_pickup_cm_to_robot_xy(
    x_cm: float,
    y_cm: float,
    calibration: PickupRobotCalibration,
) -> ImagePoint:
    visual = calibration.visual
    if visual is None:
        raise RobotSafetyError("MISSING_VISUAL_CALIBRATION", "visual calibration dimensions are required")
    u = max(0.0, min(1.0, x_cm / visual.pickup_width_cm))
    v = max(0.0, min(1.0, y_cm / visual.pickup_height_cm))
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
    return ImagePoint(round(x, 3), round(y, 3))


def _homography_matrix(
    source: tuple[ImagePoint, ImagePoint, ImagePoint, ImagePoint],
    destination: tuple[ImagePoint, ImagePoint, ImagePoint, ImagePoint],
) -> np.ndarray:
    rows: list[list[float]] = []
    values: list[float] = []
    for src, dst in zip(source, destination):
        x = float(src.x)
        y = float(src.y)
        u = float(dst.x)
        v = float(dst.y)
        rows.append([x, y, 1.0, 0.0, 0.0, 0.0, -u * x, -u * y])
        values.append(u)
        rows.append([0.0, 0.0, 0.0, x, y, 1.0, -v * x, -v * y])
        values.append(v)
    try:
        solved = np.linalg.solve(np.array(rows, dtype=float), np.array(values, dtype=float))
    except np.linalg.LinAlgError as exc:
        raise RobotSafetyError("INVALID_VISUAL_CALIBRATION", "cornersPx cannot build a homography") from exc
    return np.array(
        [
            [solved[0], solved[1], solved[2]],
            [solved[3], solved[4], solved[5]],
            [solved[6], solved[7], 1.0],
        ],
        dtype=float,
    )
