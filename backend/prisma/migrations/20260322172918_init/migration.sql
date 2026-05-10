-- CreateEnum
CREATE TYPE "org_plan" AS ENUM ('free', 'starter', 'pro', 'premium');

-- CreateEnum
CREATE TYPE "org_status" AS ENUM ('active', 'suspended', 'deleted');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('owner', 'admin', 'member');

-- CreateEnum
CREATE TYPE "auth_provider" AS ENUM ('email', 'google');

-- CreateEnum
CREATE TYPE "app_status" AS ENUM ('draft', 'configured', 'building', 'ready', 'suspended');

-- CreateEnum
CREATE TYPE "build_status" AS ENUM ('pending', 'queued', 'preparing', 'building', 'packaging', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "build_queue" AS ENUM ('free', 'standard', 'priority', 'immediate');

-- CreateEnum
CREATE TYPE "build_platform" AS ENUM ('android', 'ios', 'both');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "payment_type" AS ENUM ('plan_purchase', 'addon_purchase', 'revision_credit', 'wallet_topup', 'agency_subscription');

-- CreateEnum
CREATE TYPE "payment_gateway" AS ENUM ('razorpay', 'stripe', 'mint_wallet');

-- CreateEnum
CREATE TYPE "agency_plan" AS ENUM ('starter', 'pro', 'scale');

-- CreateEnum
CREATE TYPE "agency_client_status" AS ENUM ('invited', 'active', 'suspended', 'removed');

-- CreateTable
CREATE TABLE "organisations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "plan" "org_plan" NOT NULL DEFAULT 'free',
    "status" "org_status" NOT NULL DEFAULT 'active',
    "agency_id" UUID,
    "billing_email" TEXT,
    "billing_name" VARCHAR(200),
    "billing_address" TEXT,
    "gst_number" VARCHAR(15),
    "plan_expires_at" TIMESTAMPTZ,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT,
    "name" VARCHAR(100),
    "role" "user_role" NOT NULL DEFAULT 'member',
    "auth_provider" "auth_provider" NOT NULL DEFAULT 'email',
    "google_id" TEXT,
    "avatar_url" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token" VARCHAR(128) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "bundle_id" VARCHAR(100) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "short_description" VARCHAR(80),
    "long_description" VARCHAR(4000),
    "status" "app_status" NOT NULL DEFAULT 'draft',
    "config_json" JSONB NOT NULL DEFAULT '{}',
    "icon_url" TEXT,
    "splash_bg_url" TEXT,
    "splash_logo_url" TEXT,
    "no_internet_bg_url" TEXT,
    "no_internet_logo_url" TEXT,
    "page_loader_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "builds" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "status" "build_status" NOT NULL DEFAULT 'pending',
    "queue" "build_queue" NOT NULL DEFAULT 'standard',
    "platform" "build_platform" NOT NULL DEFAULT 'android',
    "build_number" INTEGER NOT NULL,
    "eas_build_id" TEXT,
    "config_snapshot" JSONB,
    "addons_snapshot" JSONB,
    "apk_url" TEXT,
    "aab_url" TEXT,
    "ipa_url" TEXT,
    "error_message" TEXT,
    "error_code" VARCHAR(50),
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "revision_used" BOOLEAN NOT NULL DEFAULT false,
    "build_duration_ms" INTEGER,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "builds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addon_purchases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "addon_slug" VARCHAR(60) NOT NULL,
    "config_json" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "purchased_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "addon_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "free_limit" INTEGER NOT NULL DEFAULT 3,
    "extra_purchased" INTEGER NOT NULL DEFAULT 0,
    "cycle_start" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "type" "payment_type" NOT NULL,
    "amount" INTEGER NOT NULL,
    "gst_amount" INTEGER NOT NULL DEFAULT 0,
    "total_amount" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "gateway" "payment_gateway" NOT NULL,
    "gateway_ref" VARCHAR(100),
    "gateway_order_id" VARCHAR(100),
    "status" "payment_status" NOT NULL DEFAULT 'pending',
    "metadata" JSONB DEFAULT '{}',
    "invoice_url" TEXT,
    "invoice_number" VARCHAR(20),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mint_wallets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "mint_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wallet_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "reference_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "brand_name" VARCHAR(100) NOT NULL,
    "brand_color" VARCHAR(7),
    "custom_domain" VARCHAR(255),
    "subdomain" VARCHAR(60),
    "logo_url" TEXT,
    "plan" "agency_plan" NOT NULL DEFAULT 'starter',
    "max_clients" INTEGER NOT NULL DEFAULT 10,
    "max_apps" INTEGER NOT NULL DEFAULT 15,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency_clients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agency_id" UUID NOT NULL,
    "client_org_id" UUID NOT NULL,
    "status" "agency_client_status" NOT NULL DEFAULT 'invited',
    "invite_email" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "agency_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "user_id" UUID,
    "channel" VARCHAR(20) NOT NULL,
    "recipient" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(500),
    "template" VARCHAR(60) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'queued',
    "error_msg" TEXT,
    "sent_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organisations_slug_key" ON "organisations"("slug");

-- CreateIndex
CREATE INDEX "organisations_agency_id_idx" ON "organisations"("agency_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "users_org_id_idx" ON "users"("org_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_org_id_key" ON "users"("email", "org_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "email_verifications_email_code_idx" ON "email_verifications"("email", "code");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "password_resets_token_idx" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "apps_org_id_idx" ON "apps"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "apps_org_id_bundle_id_key" ON "apps"("org_id", "bundle_id");

-- CreateIndex
CREATE INDEX "builds_org_id_idx" ON "builds"("org_id");

-- CreateIndex
CREATE INDEX "builds_app_id_idx" ON "builds"("app_id");

-- CreateIndex
CREATE INDEX "builds_status_idx" ON "builds"("status");

-- CreateIndex
CREATE INDEX "builds_created_at_idx" ON "builds"("created_at");

-- CreateIndex
CREATE INDEX "addon_purchases_org_id_idx" ON "addon_purchases"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "addon_purchases_org_id_addon_slug_key" ON "addon_purchases"("org_id", "addon_slug");

-- CreateIndex
CREATE UNIQUE INDEX "revisions_app_id_key" ON "revisions"("app_id");

-- CreateIndex
CREATE INDEX "payments_org_id_idx" ON "payments"("org_id");

-- CreateIndex
CREATE INDEX "payments_gateway_ref_idx" ON "payments"("gateway_ref");

-- CreateIndex
CREATE INDEX "payments_gateway_order_id_idx" ON "payments"("gateway_order_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "mint_wallets_org_id_key" ON "mint_wallets"("org_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_wallet_id_idx" ON "wallet_transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_created_at_idx" ON "wallet_transactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "agencies_org_id_key" ON "agencies"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "agencies_subdomain_key" ON "agencies"("subdomain");

-- CreateIndex
CREATE INDEX "agency_clients_agency_id_idx" ON "agency_clients"("agency_id");

-- CreateIndex
CREATE UNIQUE INDEX "agency_clients_agency_id_client_org_id_key" ON "agency_clients"("agency_id", "client_org_id");

-- CreateIndex
CREATE INDEX "notification_logs_org_id_idx" ON "notification_logs"("org_id");

-- CreateIndex
CREATE INDEX "notification_logs_status_idx" ON "notification_logs"("status");

-- AddForeignKey
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "builds" ADD CONSTRAINT "builds_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "builds" ADD CONSTRAINT "builds_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addon_purchases" ADD CONSTRAINT "addon_purchases_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mint_wallets" ADD CONSTRAINT "mint_wallets_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_clients" ADD CONSTRAINT "agency_clients_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_clients" ADD CONSTRAINT "agency_clients_client_org_id_fkey" FOREIGN KEY ("client_org_id") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
