import type { CubeColor } from "./dashboard";

export type EdgeVisionStatus = {
  status: string;
  profile: string;
  source: "simulation" | "opencv-file" | "opencv-camera" | string;
  configuredCameraIndex: number | null;
  activeCameraIndex: number | null;
  snapshotCameraIndex: number | null;
  cameraAllowed: boolean;
  lastSnapshotAt: string | null;
  lastError: string | null;
  lastVisionSync?: Record<string, unknown> | null;
  lastSyncedSnapshotSignature?: string | null;
  lastDryRunPlan?: Record<string, unknown> | null;
  serialOpened: boolean;
  hardwareMovement: boolean;
};

export type EdgeVisionDetection = {
  color: CubeColor | string;
  x: number;
  y: number;
  w: number;
  h: number;
  center?: { x: number; y: number };
  confidence?: number | null;
};

export type EdgeVisionSnapshot = {
  runId: string | null;
  timestamp: string | null;
  source: string;
  truckCode: string | null;
  snapshotSignature?: string | null;
  qrDetected?: boolean | null;
  qrValid?: boolean | null;
  qrStatus?: string | null;
  qrRoi?: { x: number; y: number; w: number; h: number } | null;
  cargoRoi?: { x: number; y: number; w: number; h: number } | null;
  counts: Record<CubeColor, number>;
  detections: EdgeVisionDetection[];
  imageUrl: string | null;
  snapshotCameraIndex: number | null;
  lastVisionSync?: Record<string, unknown> | null;
  lastError: string | null;
};

export type EdgeVisionPanelData = {
  enabled: boolean;
  status: EdgeVisionStatus | null;
  snapshot: EdgeVisionSnapshot | null;
  multiCubeStatus: EdgeMultiCubeStatus | null;
  error: string | null;
  baseUrl: string | null;
  refreshMs: number;
  lastUpdatedAt: string | null;
};

export type EdgeMultiCubeRunStatus =
  | "idle"
  | "planning"
  | "planned"
  | "executing"
  | "success"
  | "success_with_backend_sync_warnings"
  | "partial_success"
  | "failed";

export type EdgeMultiCubeAction = {
  sequenceNumber: number;
  selectedCubeColor?: string | null;
  dropZoneCode?: string | null;
  positionOrder?: number | null;
  pickupTarget?: Record<string, number> | null;
  pickupOffset?: Record<string, number> | null;
  physicalConfirmation?: Record<string, unknown> | null;
  pickupRetry?: Record<string, unknown> | null;
  status?: string | null;
  commandExecutionStatus?: string | null;
  backendSyncStatus?: string | null;
  backendSyncError?: string | null;
  backendActionCode?: string | null;
  finalPickZUsed?: number | null;
};

export type EdgeMultiCubePlan = {
  status: string;
  runId: string;
  truckCode?: string | null;
  totalDetectedCubes?: number;
  totalPlannedCubes?: number;
  plannedActions?: EdgeMultiCubeAction[];
  skippedCubes?: Array<Record<string, unknown>>;
  physicalConfirmation?: Record<string, unknown>;
  pickupRetry?: Record<string, unknown>;
  evidence?: Record<string, unknown> | null;
  errorMessage?: string | null;
};

export type EdgeMultiCubeResult = EdgeMultiCubePlan & {
  totalExecutedCubes?: number;
  totalPhysicalConfirmedCubes?: number;
  totalBackendSyncedActions?: number;
  totalBackendSyncFailedActions?: number;
  totalFailedPhysicalConfirmations?: number;
  totalAttemptedCubes?: number;
  totalRemainingCubes?: number;
  lastBackendSyncError?: string | null;
  lastPhysicalError?: string | null;
  executedActions?: EdgeMultiCubeAction[];
  errorCode?: string | null;
  errorMessage?: string | null;
};

export type EdgeMultiCubeStatus = {
  status: EdgeMultiCubeRunStatus;
  runId: string | null;
  lastPlan: EdgeMultiCubePlan | null;
  lastResult: EdgeMultiCubeResult | null;
  lastError: string | null;
  updatedAt: string | null;
  executing?: boolean;
  hardwarePortConfigured?: boolean;
};

export type EdgeDropZonesResetResult = {
  status: string;
  dropZonesPath: string;
  backupPath: string;
  totalSlots: number;
  resetSlots: number;
  affectedColors: string[];
};

export type EdgeOperationResetResult = {
  status: string;
  multiCubeStatus: EdgeMultiCubeStatus;
  dropZonesReset: EdgeDropZonesResetResult | null;
  warning?: string | null;
};

export type EdgeMultiCubeSafety = {
  zoneClear: boolean;
  operatorPresent: boolean;
  emergencyStopReady: boolean;
  suctionReady: boolean;
  physicalExecutionConfirmed: boolean;
};
