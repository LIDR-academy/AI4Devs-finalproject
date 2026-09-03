CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "BusinessProfileStatus" AS ENUM ('DRAFT', 'NORMALIZED', 'APPROVED');
CREATE TYPE "AssetType" AS ENUM ('BUSINESS_SUMMARY', 'WEBSITE_CONTENT', 'GOOGLE_BUSINESS_DESCRIPTION', 'SOCIAL_MEDIA_BIO', 'FAQ');
CREATE TYPE "AssetStatus" AS ENUM ('READY_FOR_REVIEW', 'EDITED');
CREATE TYPE "AIGenerationStatus" AS ENUM ('SUCCEEDED', 'FAILED');

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Business" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Business_userId_idx" ON "Business"("userId");

CREATE TABLE "DiscoveryResponses" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL,
  "responses" JSONB NOT NULL,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DiscoveryResponses_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DiscoveryResponses_businessId_key" ON "DiscoveryResponses"("businessId");

CREATE TABLE "BusinessProfile" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL,
  "businessName" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "services" JSONB NOT NULL,
  "products" JSONB NOT NULL,
  "targetAudience" TEXT NOT NULL,
  "tone" TEXT NOT NULL,
  "style" TEXT,
  "location" TEXT NOT NULL,
  "phone" TEXT,
  "website" TEXT,
  "gdprConsent" BOOLEAN NOT NULL DEFAULT false,
  "status" "BusinessProfileStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BusinessProfile_businessId_key" ON "BusinessProfile"("businessId");

CREATE TABLE "Asset" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "businessProfileId" UUID NOT NULL,
  "assetType" "AssetType" NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" "AssetStatus" NOT NULL DEFAULT 'READY_FOR_REVIEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Asset_businessProfileId_assetType_key" ON "Asset"("businessProfileId", "assetType");
CREATE INDEX "Asset_businessProfileId_idx" ON "Asset"("businessProfileId");

CREATE TABLE "AIGeneration" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "businessProfileId" UUID NOT NULL,
  "assetId" UUID,
  "requestedById" UUID NOT NULL,
  "assetType" "AssetType" NOT NULL,
  "promptSnapshot" TEXT NOT NULL,
  "contextSnapshot" TEXT NOT NULL,
  "responseSnapshot" TEXT NOT NULL,
  "status" "AIGenerationStatus" NOT NULL,
  "promptVersion" TEXT NOT NULL,
  "contextVersion" TEXT NOT NULL,
  "modelUsed" TEXT NOT NULL,
  "temperature" DOUBLE PRECISION NOT NULL,
  "tokensUsed" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "AIGeneration_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AIGeneration_businessProfileId_assetType_idx" ON "AIGeneration"("businessProfileId", "assetType");
CREATE INDEX "AIGeneration_requestedById_idx" ON "AIGeneration"("requestedById");

ALTER TABLE "Business" ADD CONSTRAINT "Business_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiscoveryResponses" ADD CONSTRAINT "DiscoveryResponses_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIGeneration" ADD CONSTRAINT "AIGeneration_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIGeneration" ADD CONSTRAINT "AIGeneration_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AIGeneration" ADD CONSTRAINT "AIGeneration_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
