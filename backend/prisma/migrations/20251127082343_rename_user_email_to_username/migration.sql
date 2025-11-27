/*
  Warnings:

  - You are about to drop the column `reminderDays` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `reminderEnabled` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `reminderTime` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pushSubscription` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "reminderDays",
DROP COLUMN "reminderEnabled",
DROP COLUMN "reminderTime";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "pushSubscription",
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "username" TEXT NOT NULL,
ADD COLUMN     "weight" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
