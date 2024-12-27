-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'view', 'blocked');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "auto_timezone" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'blocked',
ADD COLUMN     "timezone" TEXT;
