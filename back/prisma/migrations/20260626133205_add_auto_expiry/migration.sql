-- AlterTable
ALTER TABLE "ConsumptionEvent" ADD COLUMN     "method" TEXT;

-- AlterTable
ALTER TABLE "NotificationPreference" ADD COLUMN     "autoExpiryEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "autoExpiryThresholdDays" INTEGER NOT NULL DEFAULT 14;

-- CreateTable
CREATE TABLE "AutoExpiryDigest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "AutoExpiryDigest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutoExpiryDigest_userId_status_idx" ON "AutoExpiryDigest"("userId", "status");

-- CreateIndex
CREATE INDEX "AutoExpiryDigest_status_sentAt_idx" ON "AutoExpiryDigest"("status", "sentAt");

-- AddForeignKey
ALTER TABLE "AutoExpiryDigest" ADD CONSTRAINT "AutoExpiryDigest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
