import {
  assertRecord,
  cubeColors,
  optionalInteger,
  optionalNumber,
  oneOf,
  validateTruckCode
} from "../../lib/validators";
import { HttpError } from "../../lib/http-error";

export type StartSessionInput = {
  truckCode: string;
};

export type CubeInput = {
  color: "red" | "blue" | "green" | "yellow";
  confidence?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  metadata?: Record<string, unknown>;
};

export const parseStartSessionInput = (body: unknown): StartSessionInput => {
  const input = assertRecord(body, "body");
  return {
    truckCode: validateTruckCode(input.truckCode)
  };
};

export const parseCubesInput = (body: unknown): CubeInput[] => {
  const input = assertRecord(body, "body");
  const rawCubes = Array.isArray(input.cubes) ? input.cubes : input.detections;

  if (!Array.isArray(rawCubes) || rawCubes.length === 0) {
    throw new HttpError(400, "cubes must be a non-empty array");
  }

  return rawCubes.map((rawCube, index) => {
    const cube = assertRecord(rawCube, `cubes[${index}]`);
    const metadata = cube.metadata === undefined ? undefined : assertRecord(cube.metadata, `cubes[${index}].metadata`);

    return {
      color: oneOf(cube.color, `cubes[${index}].color`, cubeColors),
      confidence: optionalNumber(cube.confidence, `cubes[${index}].confidence`),
      x: optionalInteger(cube.x, `cubes[${index}].x`),
      y: optionalInteger(cube.y, `cubes[${index}].y`),
      w: optionalInteger(cube.w, `cubes[${index}].w`),
      h: optionalInteger(cube.h, `cubes[${index}].h`),
      metadata: {
        ...(metadata ?? {}),
        source: typeof input.source === "string" ? input.source : "simulation"
      }
    };
  });
};
