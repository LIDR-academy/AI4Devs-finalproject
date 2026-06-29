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
  profile: ExecutionProfile | null;
  dryRun: boolean | null;
  visionSource: string | null;
  selectedCube: SelectedCube | null;
  dropZoneCode: string | null;
  positionOrder: number | null;
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
  activeSession: ActiveSession | null;
  counts: CubeCounts;
  lastActions: RobotAction[];
  profile?: ExecutionProfile | null;
  dryRun?: boolean | null;
  visionSource?: string | null;
  selectedCube?: SelectedCube | null;
  dropZoneCode?: string | null;
  lastError?: { code: string | null; message: string | null } | null;
  updatedAt?: string | null;
};
