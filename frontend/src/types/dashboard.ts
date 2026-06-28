export type SessionStatus = "IN_PROGRESS" | "COMPLETED" | "ERROR";
export type RobotActionStatus = "PLANNED" | "SUCCESS" | "ERROR";
export type ExecutionMode = "simulation" | "hardware";
export type CubeColor = "red" | "blue" | "green" | "yellow";

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
  createdAt: string;
};

export type OperationalDashboard = {
  activeSession: ActiveSession | null;
  counts: CubeCounts;
  lastActions: RobotAction[];
};
