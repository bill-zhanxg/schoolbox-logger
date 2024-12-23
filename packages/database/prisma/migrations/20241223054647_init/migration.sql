-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('verbose', 'info', 'warning', 'error');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateTable
CREATE TABLE "AzureUsers" (
    "id" SERIAL NOT NULL,
    "accountEnabled" BOOLEAN,
    "ageGroup" TEXT,
    "businessPhones" TEXT[],
    "city" TEXT,
    "createdDateTime" TIMESTAMP(3),
    "department" TEXT,
    "displayName" TEXT,
    "givenName" TEXT,
    "lastPasswordChangeDateTime" TIMESTAMP(3),
    "mail" TEXT,
    "mailNickname" TEXT,
    "mobilePhone" TEXT,
    "onPremisesDistinguishedName" TEXT,
    "onPremisesSamAccountName" TEXT,
    "onPremisesSyncEnabled" BOOLEAN,
    "postalCode" TEXT,
    "streetAddress" TEXT,
    "surname" TEXT,
    "userType" TEXT,
    "onPremisesLastSyncDateTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AzureUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AzureUserHistory" (
    "id" SERIAL NOT NULL,
    "accountEnabled" BOOLEAN,
    "ageGroup" TEXT,
    "businessPhones" TEXT[],
    "city" TEXT,
    "createdDateTime" TIMESTAMP(3),
    "department" TEXT,
    "displayName" TEXT,
    "givenName" TEXT,
    "lastPasswordChangeDateTime" TIMESTAMP(3),
    "mail" TEXT,
    "mailNickname" TEXT,
    "mobilePhone" TEXT,
    "onPremisesDistinguishedName" TEXT,
    "onPremisesSamAccountName" TEXT,
    "onPremisesSyncEnabled" BOOLEAN,
    "postalCode" TEXT,
    "streetAddress" TEXT,
    "surname" TEXT,
    "userType" TEXT,
    "onPremisesLastSyncDateTime" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AzureUserHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portraits" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "mail" TEXT NOT NULL,
    "portrait" TEXT NOT NULL,
    "schoolbox_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portraits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortraitLogs" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortraitLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLogs" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AzureUserHistory" ADD CONSTRAINT "AzureUserHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AzureUsers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
