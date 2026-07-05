from __future__ import annotations

try:
    from ..config import RobotPlanningConfig
    from ..models import (
        CubeDetection,
        DetectionSnapshot,
        DropZoneSelection,
        EdgeRunProfile,
        RobotActionPlan,
        RobotActionStep,
        RobotPose,
        SUPPORTED_COLORS,
    )
    from .safety import RobotSafetyError, map_cube_to_pick_pose_with_metadata, validate_pose
except ImportError:
    from config import RobotPlanningConfig
    from models import (
        CubeDetection,
        DetectionSnapshot,
        DropZoneSelection,
        EdgeRunProfile,
        RobotActionPlan,
        RobotActionStep,
        RobotPose,
        SUPPORTED_COLORS,
    )
    from robot.safety import RobotSafetyError, map_cube_to_pick_pose_with_metadata, validate_pose


class RobotPlanningError(ValueError):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        super().__init__(f"{code}: {message}")


class RobotActionPlanner:
    """Pure dry-run planner. It has no filesystem, backend, camera, or serial dependencies."""

    def plan(
        self,
        snapshot: DetectionSnapshot,
        selected_cube: CubeDetection,
        drop_zone: DropZoneSelection,
        config: RobotPlanningConfig,
        profile: EdgeRunProfile,
        *,
        dry_run: bool = True,
    ) -> RobotActionPlan:
        if profile not in {EdgeRunProfile.SIMULATION, EdgeRunProfile.VISION_DRY_RUN}:
            raise RobotPlanningError("UNSAFE_PROFILE", "hardware profile is not allowed by dry-run planner")
        if not dry_run:
            raise RobotPlanningError("DRY_RUN_REQUIRED", "dry_run must be true")
        if not snapshot.run_id or drop_zone.run_id != snapshot.run_id:
            raise RobotPlanningError("RUN_ID_MISMATCH", "snapshot and drop-zone run ids must match")
        if selected_cube not in snapshot.detections:
            raise RobotPlanningError("CUBE_NOT_IN_SNAPSHOT", "selected cube must belong to snapshot")
        if selected_cube.color not in SUPPORTED_COLORS:
            raise RobotPlanningError("UNSUPPORTED_COLOR", "selected cube color is not supported")
        if selected_cube.metadata.get("sizeValid", True) is not True:
            raise RobotPlanningError("INVALID_CUBE", "selected cube is not size-valid")
        if selected_cube.color != drop_zone.slot.color:
            raise RobotPlanningError("COLOR_MISMATCH", "cube and drop-zone colors must match")
        if not drop_zone.slot.active or drop_zone.slot.occupied:
            raise RobotPlanningError("DROP_ZONE_NOT_AVAILABLE", "drop-zone slot is not active and free")
        if not config.enabled:
            raise RobotPlanningError("MISSING_PLANNING_CONFIG", "robot planning is disabled")
        if config.calibration is None:
            raise RobotPlanningError("MISSING_CALIBRATION", "robot calibration is required")
        if (
            snapshot.calibration_version is not None
            and snapshot.calibration_version != config.calibration.version
        ):
            raise RobotPlanningError(
                "CALIBRATION_MISMATCH",
                "snapshot and robot planning calibration versions differ",
            )
        if config.workspace is None:
            raise RobotPlanningError("MISSING_WORKSPACE", "workspace limits are required")
        if config.ready_pose is None or config.reset_pose is None:
            raise RobotPlanningError("MISSING_POSE", "ready and reset poses are required")
        if (
            config.safe_z is None
            or config.pick_z is None
            or config.drop_safe_z is None
            or config.lift_z_delta is None
        ):
            raise RobotPlanningError("MISSING_POSE", "safe/pick/drop Z and lift delta are required")
        if config.safe_z <= config.pick_z:
            raise RobotPlanningError("INVALID_SAFE_Z", "safeZ must be greater than pickZ")
        if config.drop_safe_z <= drop_zone.slot.pose.z:
            raise RobotPlanningError("INVALID_SAFE_Z", "dropSafeZ must be greater than drop target Z")

        try:
            pickup_target, pickup_position_cm = map_cube_to_pick_pose_with_metadata(
                selected_cube,
                config.calibration,
                config.pick_z,
            )
            pickup_safe = RobotPose(pickup_target.x, pickup_target.y, config.safe_z)
            lift_after_pick = RobotPose(
                pickup_target.x,
                pickup_target.y,
                max(config.safe_z, config.pick_z + config.lift_z_delta),
            )
            drop_target = drop_zone.slot.pose
            drop_safe = RobotPose(drop_target.x, drop_target.y, config.drop_safe_z)

            poses = {
                "ready_to_take": config.ready_pose,
                "reset": config.reset_pose,
                "pickup_target": pickup_target,
                "pickup_safe": pickup_safe,
                "lift_after_pick": lift_after_pick,
                "drop_target": drop_target,
                "drop_safe": drop_safe,
            }
            for label, pose in poses.items():
                validate_pose(pose, config.workspace, label)
        except RobotSafetyError as exc:
            raise RobotPlanningError(exc.code, str(exc)) from exc

        steps = (
            RobotActionStep("ready_to_take", config.ready_pose, 0),
            RobotActionStep("reset", config.reset_pose, 0),
            RobotActionStep("cube_safe_pose", pickup_safe, 0),
            RobotActionStep("cube_target_pick", pickup_target, 1),
            RobotActionStep("lift_after_pick", lift_after_pick, 1),
            RobotActionStep("reset_with_cube", config.reset_pose, 1),
            RobotActionStep("drop_safe_pose", drop_safe, 1),
            RobotActionStep("drop_zone_with_cube", drop_target, 1),
            RobotActionStep("drop_zone_release", drop_target, 0),
            RobotActionStep("retract_after_release", drop_safe, 0),
            RobotActionStep("reset_without_cube", config.reset_pose, 0),
            RobotActionStep("ready_to_take_end", config.ready_pose, 0),
        )
        return RobotActionPlan(
            run_id=snapshot.run_id,
            profile=profile,
            dry_run=True,
            selected_cube=selected_cube,
            drop_zone=drop_zone,
            safe_z=config.safe_z,
            pickup_target=pickup_target,
            pickup_safe=pickup_safe,
            pickup_position_cm=pickup_position_cm,
            drop_target=drop_target,
            drop_safe=drop_safe,
            steps=steps,
            metadata={
                "calibrationVersion": config.calibration.version,
                "coordinateSpace": "robot-candidate",
                "pickupPositionCm": pickup_position_cm.as_dict() if pickup_position_cm else None,
                "visualCalibrationVersion": config.calibration.version,
                "visualCalibrationUsed": config.calibration.visual is not None,
                "homographyUsed": config.calibration.visual is not None,
                "serialOpened": False,
                "hardwareMovement": False,
            },
            errors=(),
        )
