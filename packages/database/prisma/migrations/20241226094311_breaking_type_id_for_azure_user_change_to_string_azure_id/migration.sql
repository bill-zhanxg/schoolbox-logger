/*
  Warnings:

  - The primary key for the `AzureUserHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `azureId` on the `AzureUserHistory` table. All the data in the column will be lost.
  - The primary key for the `AzureUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `azureId` on the `AzureUsers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AzureUserHistory" DROP CONSTRAINT "AzureUserHistory_pkey",
DROP COLUMN "azureId",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "AzureUserHistory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AzureUserHistory_id_seq";

-- AlterTable
ALTER TABLE "AzureUsers" DROP CONSTRAINT "AzureUsers_pkey",
DROP COLUMN "azureId",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "AzureUsers_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AzureUsers_id_seq";
