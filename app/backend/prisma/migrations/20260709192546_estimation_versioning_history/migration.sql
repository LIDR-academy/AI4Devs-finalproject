-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Complexity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "complexity" "Complexity" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UseCase" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UseCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "totalHours" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "assumptions" TEXT NOT NULL,
    "risks" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estimation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "estimationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleEstimate" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RoleEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenEstimate" (
    "id" TEXT NOT NULL,
    "estimationId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TokenEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRole" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UseCase_projectId_idx" ON "UseCase"("projectId");

-- CreateIndex
CREATE INDEX "Estimation_projectId_idx" ON "Estimation"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Estimation_projectId_version_key" ON "Estimation"("projectId", "version");

-- CreateIndex
CREATE INDEX "Phase_estimationId_idx" ON "Phase"("estimationId");

-- CreateIndex
CREATE INDEX "RoleEstimate_phaseId_idx" ON "RoleEstimate"("phaseId");

-- CreateIndex
CREATE INDEX "TokenEstimate_estimationId_idx" ON "TokenEstimate"("estimationId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentRole_key_key" ON "AgentRole"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AgentRole_name_key" ON "AgentRole"("name");

-- AddForeignKey
ALTER TABLE "UseCase" ADD CONSTRAINT "UseCase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimation" ADD CONSTRAINT "Estimation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_estimationId_fkey" FOREIGN KEY ("estimationId") REFERENCES "Estimation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleEstimate" ADD CONSTRAINT "RoleEstimate_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenEstimate" ADD CONSTRAINT "TokenEstimate_estimationId_fkey" FOREIGN KEY ("estimationId") REFERENCES "Estimation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
