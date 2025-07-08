import { PrismaClient } from '@prisma/client';
import { startOfDay, subDays, isSameDay } from 'date-fns';
const prisma = new PrismaClient();

export const createHabit = async (req, res) => {
  try {
    const { title, frequency, category, goal, goalPeriod } = req.body;
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
        category: category || 'General',
        goal: goal ? parseInt(goal) : null,
        goalPeriod: goalPeriod || 'Weekly',
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
    
    const today = new Date();
    const habitsWithStreak = habits.map(habit => {
      let streak = 0;
      let day = startOfDay(today);
      const checkinDates = habit.checkins.map(c => startOfDay(new Date(c.date)));
      while (checkinDates.some(d => isSameDay(d, day))) {
        streak++;
        day = subDays(day, 1);
      }

      // Calculate goal progress
      let goalProgress = null;
      if (habit.goal) {
        const periodStart = habit.goalPeriod === 'Daily' ? startOfDay(today) :
                           habit.goalPeriod === 'Weekly' ? startOfDay(subDays(today, 7)) :
                           startOfDay(subDays(today, 30));
        
        const periodCheckins = habit.checkins.filter(c => 
          new Date(c.date) >= periodStart
        ).length;
        
        const totalDays = habit.goalPeriod === 'Daily' ? 1 :
                         habit.goalPeriod === 'Weekly' ? 7 : 30;
        
        const completionRate = (periodCheckins / totalDays) * 100;
        goalProgress = {
          current: Math.round(completionRate),
          target: habit.goal,
          achieved: completionRate >= habit.goal,
          periodCheckins,
          totalDays
        };
      }

      return { ...habit, streak, goalProgress };
    });
    res.json(habitsWithStreak);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, frequency, category, goal, goalPeriod } = req.body;

    const habit = await prisma.habit.update({
      where: { id },
      data: { title, frequency, category, goal: goal ? parseInt(goal) : null, goalPeriod },
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
    let goalsAchieved = 0;
    const today = new Date();
    const checkinsPerHabit = habits.map(habit => ({
      title: habit.title,
      count: habit.checkins.length,
    }));
    
    // Category-based analytics
    const habitsByCategory = {};
    habits.forEach(habit => {
      if (!habitsByCategory[habit.category]) {
        habitsByCategory[habit.category] = {
          count: 0,
          checkins: 0,
          habits: []
        };
      }
      habitsByCategory[habit.category].count++;
      habitsByCategory[habit.category].checkins += habit.checkins.length;
      habitsByCategory[habit.category].habits.push(habit.title);
    });
    
    const categoryStats = Object.entries(habitsByCategory).map(([category, data]) => ({
      category,
      habitCount: data.count,
      totalCheckins: data.checkins,
      habits: data.habits
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
      
      // Check if goal is achieved
      if (habit.goal) {
        const periodStart = habit.goalPeriod === 'Daily' ? startOfDay(today) :
                           habit.goalPeriod === 'Weekly' ? startOfDay(subDays(today, 7)) :
                           startOfDay(subDays(today, 30));
        
        const periodCheckins = habit.checkins.filter(c => 
          new Date(c.date) >= periodStart
        ).length;
        
        const totalDays = habit.goalPeriod === 'Daily' ? 1 :
                         habit.goalPeriod === 'Weekly' ? 7 : 30;
        
        const completionRate = (periodCheckins / totalDays) * 100;
        if (completionRate >= habit.goal) {
          goalsAchieved++;
        }
      }
    });
    res.json({
      totalHabits,
      totalCheckins,
      longestStreak,
      mostConsistentHabit: mostConsistentHabit || '',
      goalsAchieved,
      checkinsPerHabit,
      checkinsPerDay,
      categoryStats,
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

export const getCategories = async (req, res) => {
  try {
    const categories = [
      'General',
      'Health',
      'Fitness',
      'Learning',
      'Productivity',
      'Mindfulness',
      'Social',
      'Creative',
      'Financial',
      'Career'
    ];
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
