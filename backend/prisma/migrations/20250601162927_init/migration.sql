/*
  Warnings:

  - You are about to drop the column `userId` on the `Recipe` table. All the data in the column will be lost.
  - The `ingredients` column on the `Recipe` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `instructions` column on the `Recipe` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferences` on the `User` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servings` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_userId_fkey";

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "userId",
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "servings" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "ingredients",
ADD COLUMN     "ingredients" TEXT[],
DROP COLUMN "instructions",
ADD COLUMN     "instructions" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash",
DROP COLUMN "preferences",
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_recipeId_idx" ON "Favorite"("recipeId");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
