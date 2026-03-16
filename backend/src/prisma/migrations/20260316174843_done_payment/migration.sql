-- CreateTable
CREATE TABLE "SubscriptionConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "freeStorageBytes" BIGINT NOT NULL DEFAULT 104857600,
    "freeMaxNotes" INTEGER NOT NULL DEFAULT 100,
    "freeMaxCollaborators" INTEGER NOT NULL DEFAULT 5,
    "freeVideoCall" BOOLEAN NOT NULL DEFAULT false,
    "proPriceUsd" DECIMAL(10,2) NOT NULL DEFAULT 9.99,
    "proPriceRub" DECIMAL(10,2) NOT NULL DEFAULT 990,
    "proStorageBytes" BIGINT NOT NULL DEFAULT 10737418240,
    "proMaxNotes" INTEGER NOT NULL DEFAULT 0,
    "proMaxCollaborators" INTEGER NOT NULL DEFAULT 0,
    "proVideoCall" BOOLEAN NOT NULL DEFAULT true,
    "enterprisePriceUsd" DECIMAL(10,2) NOT NULL DEFAULT 29.99,
    "enterprisePriceRub" DECIMAL(10,2) NOT NULL DEFAULT 2990,
    "enterpriseStorageBytes" BIGINT NOT NULL DEFAULT 0,
    "enterpriseMaxNotes" INTEGER NOT NULL DEFAULT 0,
    "enterpriseMaxCollaborators" INTEGER NOT NULL DEFAULT 0,
    "enterpriseVideoCall" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "plan" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerPaymentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amountUsd" DECIMAL(10,2),
    "amountRub" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "periodMonths" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_providerPaymentId_idx" ON "Payment"("providerPaymentId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
