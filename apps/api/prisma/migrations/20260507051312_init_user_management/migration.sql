/*
  Warnings:

  - You are about to drop the column `plan_type` on the `membership_cards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "membership_cards" DROP COLUMN "plan_type";

-- DropEnum
DROP TYPE "MembershipPlan";
