/*
  Warnings:

  - You are about to drop the column `userId` on the `AzureUserHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AzureUserHistory" DROP CONSTRAINT "AzureUserHistory_userId_fkey";

-- AlterTable
ALTER TABLE "AzureUserHistory" DROP COLUMN "userId";
