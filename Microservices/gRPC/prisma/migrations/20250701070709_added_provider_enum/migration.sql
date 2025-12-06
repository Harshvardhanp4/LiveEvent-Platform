/*
  Warnings:

  - The `provider` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GOOGLE');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "provider",
ADD COLUMN     "provider" "Provider";
