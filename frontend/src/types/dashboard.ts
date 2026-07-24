export type SessionStatus = "IN_PROGRESS" | "COMPLETED" | "ERROR";
export type RobotActionStatus = "PLANNED" | "SUCCESS" | "ERROR";
export type ExecutionMode = "simulation" | "hardware";
export type CubeColor = "red" | "blue" | "green" | "yellow";
export type ExecutionProfile = "simulation" | "vision-dry-run" | "hardware";

export type SelectedCube = {
  color: CubeColor;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  confidence?: number;
};

export type ExecutionTrace = {
  runId: string | null;
  snapshotSignature?: string | null;
  truckCode?: string | null;
  profile: ExecutionProfile | null;
  dryRun: boolean | null;
  visionSource: string | null;
  selectedCube: SelectedCube | null;
  selectedCubeColor?: string | null;
  selectedCubeCenter?: { x?: number; y?: number } | null;
  selectedCubeBoundingBox?: { x?: number; y?: number; w?: number; h?: number } | null;
  dropZoneCode: string | null;
  dropZonePose?: { x?: number; y?: number; z?: number } | null;
  positionOrder: number | null;
  sequencePreview?: string[];
  commandsPreview?: string[];
  releaseConfirmed: boolean | null;
  statePersisted: boolean | null;
  configVersion: string | null;
  calibrationVersion: string | null;
  errorCode: string | null;
  errorMessage: string | null;
};

export type ActiveSession = {
  id: string;
  code: string;
  status: SessionStatus;
  truckCode: string;
  startedAt: string;
  finishedAt: string | null;
};

export type CubeCounts = Record<CubeColor, number> & {
  total: number;
};

export type RobotAction = {
  id: string;
  code: string;
  actionType: string;
  status: RobotActionStatus;
  mode: ExecutionMode;
  color: CubeColor | null;
  execution?: ExecutionTrace;
  createdAt: string;
  updatedAt?: string;
};

export type OperationalDashboard = {
  operationalState?: "IDLE_CLEAN" | "SESSION_ACTIVE" | string;
  activeSession: ActiveSession | null;
  counts: CubeCounts;
  lastActions: RobotAction[];
  profile?: ExecutionProfile | null;
  dryRun?: boolean | null;
  visionSource?: string | null;
  selectedCube?: SelectedCube | null;
  dropZoneCode?: string | null;
  lastError?: { code: string | null; message: string | null } | null;
  visionSync?: {
    snapshotSignature: string | null;
    source: string | null;
    truckCode: string | null;
    qrDetected: boolean | null;
    qrValid: boolean | null;
    qrStatus: string | null;
    cameraIndex: number | null;
    counts: Record<string, unknown> | null;
    syncedAt: string | null;
  } | null;
  lastVisionSnapshot?: string | null;
  lastVisionTruckCode?: string | null;
  lastVisionCounts?: Record<string, unknown> | null;
  lastVisionError?: { code: string | null; message: string | null } | null;
  updatedAt?: string | null;
};

export type OperationalResetMode = "start-day" | "next-truck";
export type CloseActiveSessionAs = "cancelled" | "completed";

export type OperationalResetResult = {
  status: "OK";
  mode: OperationalResetMode;
  requestedCloseActiveSessionAs: CloseActiveSessionAs;
  effectiveCloseStatus: SessionStatus;
  closeStatusNote: string | null;
  closedSessions: number;
  activeSession: null;
};
