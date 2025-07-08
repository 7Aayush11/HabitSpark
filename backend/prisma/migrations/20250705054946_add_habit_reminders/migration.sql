-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "reminderDays" TEXT,
ADD COLUMN     "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderTime" TEXT;
