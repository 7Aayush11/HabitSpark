import { PrismaClient } from '@prisma/client';
import { startOfDay, subDays, isSameDay } from 'date-fns';
const prisma = new PrismaClient();

export const createHabit = async (req, res) => {
  try {
    const { title, frequency } = req.body;
    if (!title || !frequency) {
      return res.status(400).json({ error: 'Title and frequency are required.' });
    }
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized: userId missing.' });
    }

    const habit = await prisma.habit.create({
      data: {
        title,
        frequency,
        userId: req.userId,
      },
    });

    // Try updating user points, but don't let it break the response
    try {
      await prisma.user.update({
        where: { id: req.userId },
        data: { auraPoints: { increment: 5 } },
      });
    } catch (userUpdateErr) {
      console.error('Failed to update user points:', userUpdateErr);
      // Don't throw, just log
    }

    return res.status(201).json({ success: true, habit });
  } catch (err) {
    console.error('Create habit error:', err);
    return res.status(500).json({ error: 'Failed to create habit', details: err.message });
  }
};

export const getHabits = async (req, res) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { checkins: true },
    });
    // Calculate streak for each habit
    const today = new Date();
    const habitsWithStreak = habits.map(habit => {
      let streak = 0;
      let day = startOfDay(today);
      const checkinDates = habit.checkins.map(c => startOfDay(new Date(c.date)));
      while (checkinDates.some(d => isSameDay(d, day))) {
        streak++;
        day = subDays(day, 1);
      }
      return { ...habit, streak };
    });
    res.json(habitsWithStreak);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, frequency } = req.body;

    const habit = await prisma.habit.update({
      where: { id },
      data: { title, frequency },
    });

    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update habit' });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.habit.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete habit' });
  }
};

export const checkinHabitController = async (req, res) => {
  try {
    const habitId = req.params.id;
    const userId = req.userId;
    const today = startOfDay(new Date());

    // Check if already checked in today
    const existing = await prisma.checkin.findFirst({
      where: { habitId, date: today },
    });
    if (existing) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    // Add check-in
    await prisma.checkin.create({
      data: { habitId, date: today },
    });

    // Calculate streak
    const checkins = await prisma.checkin.findMany({
      where: { habitId },
      orderBy: { date: 'desc' },
    });

    let streak = 0;
    let day = today;
    for (const checkin of checkins) {
      if (isSameDay(checkin.date, day)) {
        streak++;
        day = subDays(day, 1);
      } else {
        break;
      }
    }

    res.json({ success: true, streak });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check in' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    // Get all habits for the user, including checkins
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: { checkins: true },
    });
    const totalHabits = habits.length;
    let totalCheckins = 0;
    let longestStreak = 0;
    let mostConsistentHabit = null;
    let maxStreak = 0;
    const today = new Date();
    const checkinsPerHabit = habits.map(habit => ({
      title: habit.title,
      count: habit.checkins.length,
    }));
    // Flatten all checkins for all habits
    const allCheckins = habits.flatMap(habit => habit.checkins.map(c => new Date(c.date)));
    // Group checkins by day
    const checkinsByDay = {};
    allCheckins.forEach(date => {
      const day = startOfDay(date).toISOString().split('T')[0];
      checkinsByDay[day] = (checkinsByDay[day] || 0) + 1;
    });
    const checkinsPerDay = Object.entries(checkinsByDay).map(([date, count]) => ({ date, count }));
    habits.forEach(habit => {
      totalCheckins += habit.checkins.length;
      // Calculate streak for this habit
      let streak = 0;
      let day = startOfDay(today);
      const checkinDates = habit.checkins.map(c => startOfDay(new Date(c.date)));
      while (checkinDates.some(d => isSameDay(d, day))) {
        streak++;
        day = subDays(day, 1);
      }
      if (streak > longestStreak) longestStreak = streak;
      if (streak > maxStreak) {
        maxStreak = streak;
        mostConsistentHabit = habit.title;
      }
    });
    res.json({
      totalHabits,
      totalCheckins,
      longestStreak,
      mostConsistentHabit: mostConsistentHabit || '',
      checkinsPerHabit,
      checkinsPerDay,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { email: true, auraPoints: true, createdAt: true, name: true, age: true, location: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, age, location } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name, age, location },
      select: { email: true, auraPoints: true, createdAt: true, name: true, age: true, location: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
