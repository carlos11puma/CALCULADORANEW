-- CreateEnum
CREATE TYPE "Role" AS ENUM ('vendedor', 'supervisor');
CREATE TYPE "Channel" AS ENUM ('preventa', 'autoventa');
CREATE TYPE "TierType" AS ENUM ('por_devolucion', 'por_efectividad');
CREATE TYPE "SyncStatus" AS ENUM ('synced', 'pending');
CREATE TYPE "NotificationType" AS ENUM ('umbral_venta', 'umbral_devolucion', 'manual');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT,
    "pin" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "budget" DECIMAL(14,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "vendors_userId_key" ON "vendors"("userId");
CREATE INDEX "vendors_channel_idx" ON "vendors"("channel");
CREATE INDEX "vendors_route_idx" ON "vendors"("route");

-- CreateTable
CREATE TABLE "commission_tiers" (
    "id" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "tierType" "TierType" NOT NULL,
    "order" INTEGER NOT NULL,
    "thresholdValue" DECIMAL(7,3) NOT NULL,
    "commissionRate" DECIMAL(7,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "commission_tiers_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "commission_tiers_channel_order_idx" ON "commission_tiers"("channel", "order");

-- CreateTable
CREATE TABLE "daily_sales" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "saleDate" DATE NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "returns" DECIMAL(14,2) NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'synced',
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "daily_sales_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "daily_sales_vendorId_saleDate_key" ON "daily_sales"("vendorId", "saleDate");

-- CreateTable
CREATE TABLE "commission_periods" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "periodMonth" TEXT NOT NULL,
    "accumulatedSales" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "accumulatedReturns" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "returnRate" DECIMAL(9,6) NOT NULL DEFAULT 0,
    "commissionEarned" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "commission_periods_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "commission_periods_vendorId_periodMonth_key" ON "commission_periods"("vendorId", "periodMonth");
CREATE INDEX "commission_periods_closed_vendorId_idx" ON "commission_periods"("closed", "vendorId");

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "thresholdCrossed" DECIMAL(7,3),
    "earningOpportunity" JSONB,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "periodMonth" TEXT NOT NULL,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_vendorId_type_periodMonth_idx" ON "notifications"("vendorId", "type", "periodMonth");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "daily_sales" ADD CONSTRAINT "daily_sales_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commission_periods" ADD CONSTRAINT "commission_periods_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
