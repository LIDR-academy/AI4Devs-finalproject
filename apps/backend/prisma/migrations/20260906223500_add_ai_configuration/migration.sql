-- CreateTable
CREATE TABLE "ai_configurations" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "provider" TEXT NOT NULL DEFAULT 'HEURISTIC',
    "modelName" TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
    "endpointUrl" TEXT,
    "encryptedApiKey" TEXT,
    "temperature" DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    "replenishmentOn" BOOLEAN NOT NULL DEFAULT true,
    "rescueRecipesOn" BOOLEAN NOT NULL DEFAULT true,
    "anomalyAuditOn" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ai_configurations_pkey" PRIMARY KEY ("id")
);
