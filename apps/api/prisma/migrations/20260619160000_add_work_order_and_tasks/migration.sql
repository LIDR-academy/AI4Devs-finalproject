-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('EN_PROCESO', 'LISTA_PARA_ENTREGA', 'OWNER_CONTACTED', 'ENTREGADA');

-- CreateEnum
CREATE TYPE "WorkOrderTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "ownerClientId" TEXT NOT NULL,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'EN_PROCESO',
    "entryReason" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL,
    "assignedMechanicId" TEXT,
    "createdById" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "ownerContactedAt" TIMESTAMP(3),
    "ownerContactedById" TEXT,
    "visitDiagnosis" TEXT,
    "visitRepairSummary" TEXT,
    "visitPartsUsed" TEXT,
    "visitAdditionalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderTask" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "WorkOrderTaskStatus" NOT NULL DEFAULT 'PENDING',
    "cost" DECIMAL(12,2),
    "costNotes" TEXT,
    "diagnosis" TEXT,
    "repairPerformed" TEXT,
    "partsUsed" TEXT,
    "additionalNotes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkOrder_vehicleId_status_idx" ON "WorkOrder"("vehicleId", "status");

-- CreateIndex
CREATE INDEX "WorkOrder_checkedInAt_idx" ON "WorkOrder"("checkedInAt");

-- CreateIndex
CREATE INDEX "WorkOrderTask_workOrderId_idx" ON "WorkOrderTask"("workOrderId");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_ownerClientId_fkey" FOREIGN KEY ("ownerClientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assignedMechanicId_fkey" FOREIGN KEY ("assignedMechanicId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_ownerContactedById_fkey" FOREIGN KEY ("ownerContactedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderTask" ADD CONSTRAINT "WorkOrderTask_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
