-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "RegistrationSource" AS ENUM ('FIELD_EXEC', 'ADMIN', 'SELF');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MembershipPlan" AS ENUM ('SILVER', 'GOLD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'BLOCKED');

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "customer_code" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dob" DATE NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "district" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "registration_source" "RegistrationSource" NOT NULL DEFAULT 'ADMIN',
    "registered_by" UUID,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "dob" DATE,
    "gender" "Gender",
    "phone" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_cards" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "card_number" TEXT NOT NULL,
    "plan_type" "MembershipPlan" NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3),
    "qr_code" TEXT,
    "status" "CardStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_code_key" ON "customers"("customer_code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "membership_cards_card_number_key" ON "membership_cards"("card_number");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_cards" ADD CONSTRAINT "membership_cards_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
