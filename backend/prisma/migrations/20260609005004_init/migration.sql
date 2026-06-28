-- DropForeignKey
ALTER TABLE "DetectedCube" DROP CONSTRAINT "DetectedCube_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "RobotAction" DROP CONSTRAINT "RobotAction_sessionId_fkey";

-- AddForeignKey
ALTER TABLE "DetectedCube" ADD CONSTRAINT "DetectedCube_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UnloadSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RobotAction" ADD CONSTRAINT "RobotAction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UnloadSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
