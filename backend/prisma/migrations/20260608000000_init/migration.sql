CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ERROR');
CREATE TYPE "CubeColor" AS ENUM ('red', 'blue', 'green', 'yellow');
CREATE TYPE "RobotActionType" AS ENUM ('PICK_AND_DROP');
CREATE TYPE "RobotActionStatus" AS ENUM ('PLANNED', 'SUCCESS', 'ERROR');
CREATE TYPE "ExecutionMode" AS ENUM ('simulation', 'hardware');

CREATE TABLE "Truck" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Truck_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UnloadSession" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "truckId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UnloadSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DetectedCube" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "sessionId" UUID NOT NULL,
    "color" "CubeColor" NOT NULL,
    "confidence" DOUBLE PRECISION,
    "x" INTEGER,
    "y" INTEGER,
    "w" INTEGER,
    "h" INTEGER,
    "metadata" JSONB,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DetectedCube_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RobotAction" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "sessionId" UUID NOT NULL,
    "actionType" "RobotActionType" NOT NULL,
    "status" "RobotActionStatus" NOT NULL,
    "mode" "ExecutionMode" NOT NULL DEFAULT 'simulation',
    "color" "CubeColor",
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RobotAction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Truck_code_key" ON "Truck"("code");
CREATE UNIQUE INDEX "UnloadSession_code_key" ON "UnloadSession"("code");
CREATE INDEX "DetectedCube_sessionId_idx" ON "DetectedCube"("sessionId");
CREATE INDEX "DetectedCube_color_idx" ON "DetectedCube"("color");
CREATE UNIQUE INDEX "DetectedCube_sessionId_code_key" ON "DetectedCube"("sessionId", "code");
CREATE INDEX "RobotAction_sessionId_idx" ON "RobotAction"("sessionId");
CREATE INDEX "RobotAction_status_idx" ON "RobotAction"("status");
CREATE UNIQUE INDEX "RobotAction_sessionId_code_key" ON "RobotAction"("sessionId", "code");

ALTER TABLE "UnloadSession"
  ADD CONSTRAINT "UnloadSession_truckId_fkey"
  FOREIGN KEY ("truckId") REFERENCES "Truck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DetectedCube"
  ADD CONSTRAINT "DetectedCube_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "UnloadSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RobotAction"
  ADD CONSTRAINT "RobotAction_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "UnloadSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
