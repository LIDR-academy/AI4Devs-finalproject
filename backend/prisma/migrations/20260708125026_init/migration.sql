-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "BureaucraticStage" AS ENUM ('PRE_ARRAS', 'ARRAS', 'DUE_DILIGENCE', 'PRE_ESCRITURA', 'ESCRITURA', 'POST_ESCRITURA');

-- CreateEnum
CREATE TYPE "PortalStatus" AS ENUM ('UNKNOWN', 'OK', 'THROTTLED', 'BLOCKED', 'CONFIRMED_BLOCKED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseProcess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ProcessStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentStage" "BureaucraticStage" NOT NULL DEFAULT 'PRE_ARRAS',
    "propertyPrice" DECIMAL(12,2),
    "financialProfile" JSONB,
    "sourceListingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyzedListing" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "previousHash" TEXT,
    "diff" JSONB,
    "transparencyScore" INTEGER NOT NULL,
    "scoreLabel" TEXT NOT NULL,
    "omissions" JSONB,
    "positiveSignals" JSONB,
    "summary" TEXT,
    "declaredAddress" TEXT,
    "coordinates" JSONB,
    "catastroMatch" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyzedListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedFlag" (
    "id" TEXT NOT NULL,
    "analyzedListingId" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checklist" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "documentsNeeded" JSONB NOT NULL,
    "estimatedDays" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalHealthCheck" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" "PortalStatus" NOT NULL DEFAULT 'UNKNOWN',
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertTriggeredAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "PortalHealthCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitCounter" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RateLimitCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_sessionId_key" ON "User"("sessionId");

-- CreateIndex
CREATE INDEX "User_sessionId_idx" ON "User"("sessionId");

-- CreateIndex
CREATE INDEX "PurchaseProcess_userId_status_idx" ON "PurchaseProcess"("userId", "status");

-- CreateIndex
CREATE INDEX "AnalyzedListing_processId_createdAt_idx" ON "AnalyzedListing"("processId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyzedListing_sourceHash_idx" ON "AnalyzedListing"("sourceHash");

-- CreateIndex
CREATE INDEX "RedFlag_flag_idx" ON "RedFlag"("flag");

-- CreateIndex
CREATE INDEX "RedFlag_analyzedListingId_idx" ON "RedFlag"("analyzedListingId");

-- CreateIndex
CREATE INDEX "Checklist_processId_idx" ON "Checklist"("processId");

-- CreateIndex
CREATE INDEX "ChecklistItem_checklistId_stage_sortOrder_idx" ON "ChecklistItem"("checklistId", "stage", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PortalHealthCheck_domain_key" ON "PortalHealthCheck"("domain");

-- CreateIndex
CREATE INDEX "PortalHealthCheck_status_idx" ON "PortalHealthCheck"("status");

-- CreateIndex
CREATE INDEX "RateLimitCounter_sessionId_date_idx" ON "RateLimitCounter"("sessionId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitCounter_sessionId_date_key" ON "RateLimitCounter"("sessionId", "date");

-- AddForeignKey
ALTER TABLE "PurchaseProcess" ADD CONSTRAINT "PurchaseProcess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyzedListing" ADD CONSTRAINT "AnalyzedListing_processId_fkey" FOREIGN KEY ("processId") REFERENCES "PurchaseProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedFlag" ADD CONSTRAINT "RedFlag_analyzedListingId_fkey" FOREIGN KEY ("analyzedListingId") REFERENCES "AnalyzedListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_processId_fkey" FOREIGN KEY ("processId") REFERENCES "PurchaseProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
