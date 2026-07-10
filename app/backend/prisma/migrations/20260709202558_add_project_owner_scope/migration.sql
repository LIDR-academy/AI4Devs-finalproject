-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "ownerId" TEXT NOT NULL DEFAULT 'local-dev-actor';

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");
