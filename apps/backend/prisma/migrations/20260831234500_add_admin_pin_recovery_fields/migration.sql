-- AlterTable (TK-077: Admin PIN Recovery via Email Token & Magic Link)
ALTER TABLE "User" ADD COLUMN "email" TEXT,
ADD COLUMN "resetTokenHash" TEXT,
ADD COLUMN "resetTokenExpires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
