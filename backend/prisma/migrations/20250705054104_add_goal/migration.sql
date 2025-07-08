-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "goal" INTEGER,
ADD COLUMN     "goalPeriod" TEXT NOT NULL DEFAULT 'Weekly';
