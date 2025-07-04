-- DropForeignKey
ALTER TABLE "Checkin" DROP CONSTRAINT "Checkin_habitId_fkey";

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
