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
  error: string | null;
  baseUrl: string | null;
  refreshMs: number;
  lastUpdatedAt: string | null;
};
