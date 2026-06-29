import type { CubeColor } from "./dashboard";

export type EdgeVisionStatus = {
  status: string;
  profile: string;
  source: "simulation" | "opencv-file" | "opencv-camera" | string;
  cameraAllowed: boolean;
  lastSnapshotAt: string | null;
  lastError: string | null;
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
  counts: Record<CubeColor, number>;
  detections: EdgeVisionDetection[];
  imageUrl: string | null;
  lastError: string | null;
};

export type EdgeVisionPanelData = {
  enabled: boolean;
  status: EdgeVisionStatus | null;
  snapshot: EdgeVisionSnapshot | null;
  error: string | null;
  baseUrl: string | null;
};
