import { PrismaClient } from '@prisma/client';
import { startOfDay, subDays, isSameDay, parseISO, getDay, format, isAfter, isBefore } from 'date-fns';
import { Parser } from 'json2csv';
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
    // Security: ensure habit belongs to current user
    const existing = await prisma.habit.findFirst({ where: { id, userId: req.userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Habit not found or unauthorized' });
    }
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
    // Security: ensure habit belongs to current user
    const existing = await prisma.habit.findFirst({ where: { id, userId: req.userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Habit not found or unauthorized' });
    }
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

    // Security: ensure habit belongs to current user
    const ownerHabit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
    if (!ownerHabit) {
      return res.status(404).json({ error: 'Habit not found or unauthorized' });
    }

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

    // Calculate streak and goal progress from updated habit
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: { checkins: true },
    });

    // Streak calculation
    const orderedCheckins = habit.checkins.sort((a, b) => b.date - a.date);
    let streak = 0;
    let day = today;
    for (const checkin of orderedCheckins) {
      if (isSameDay(checkin.date, day)) {
        streak++;
        day = subDays(day, 1);
      } else {
        break;
      }
    }

    // Goal progress calculation (mirror getHabits logic)
    let goalProgress = null;
    if (habit.goal) {
      const periodStart = habit.goalPeriod === 'Daily' ? startOfDay(today) :
                         habit.goalPeriod === 'Weekly' ? startOfDay(subDays(today, 7)) :
                         startOfDay(subDays(today, 30));

      const periodCheckins = habit.checkins.filter(c => new Date(c.date) >= periodStart).length;
      const totalDays = habit.goalPeriod === 'Daily' ? 1 :
                       habit.goalPeriod === 'Weekly' ? 7 : 30;
      const completionRate = (periodCheckins / totalDays) * 100;
      goalProgress = {
        current: Math.round(completionRate),
        target: habit.goal,
        achieved: completionRate >= habit.goal,
        periodCheckins,
        totalDays,
      };
    }

    res.json({ success: true, streak, goalProgress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check in' });
  }
};

// Helper: get user level, progress, and title
const getLevelInfo = (totalCheckins) => {
  const level = Math.floor(totalCheckins / 10) + 1;
  const progress = totalCheckins % 10;
  const levelProgress = Math.round((progress / 10) * 100);
  // Example Solo Leveling style titles
  const titles = [
    'Novice', 'Apprentice', 'Hunter', 'Elite', 'Shadow', 'Monarch', 'S-Rank', 'Legend', 'Mythic', 'Solo Leveler'
  ];
  const title = titles[Math.min(level - 1, titles.length - 1)];
  return { level, levelProgress, title };
};

// Helper: get achievements
const getAchievements = ({ totalCheckins, longestStreak, goalsAchieved, categoryStats }) => {
  const achievements = [];
  if (totalCheckins >= 10) achievements.push({ badge: '10 Check-ins', icon: '🔟' });
  if (totalCheckins >= 50) achievements.push({ badge: '50 Check-ins', icon: '🏅' });
  if (totalCheckins >= 100) achievements.push({ badge: '100 Check-ins', icon: '💯' });
  if (longestStreak >= 7) achievements.push({ badge: '7-Day Streak', icon: '🔥' });
  if (longestStreak >= 30) achievements.push({ badge: '30-Day Streak', icon: '🌟' });
  if (goalsAchieved >= 1) achievements.push({ badge: 'Goal Achiever', icon: '🎯' });
  if (categoryStats && categoryStats.some(cat => cat.habitCount >= 3)) achievements.push({ badge: 'Category Master', icon: '🏆' });
  return achievements;
};

// Helper: get character stats
const getCharacterStats = (user, habits) => {
  // Base stats from user info
  let strength = 10;
  let wisdom = 10;
  let vitality = 10;
  let charisma = 10;
  let creativity = 10;
  let productivity = 10;
  // Age, height, weight influence
  if (user.age) vitality += Math.max(0, 30 - Math.abs(user.age - 30));
  if (user.height) strength += Math.floor(user.height / 10);
  if (user.weight) vitality += Math.floor(user.weight / 10);
  // Add points for check-ins in each category
  const categoryCounts = {};
  habits.forEach(habit => {
    const cat = habit.category || 'General';
    if (!categoryCounts[cat]) categoryCounts[cat] = 0;
    categoryCounts[cat] += habit.checkins.length;
  });
  strength += (categoryCounts['Fitness'] || 0) + (categoryCounts['Health'] || 0);
  wisdom += (categoryCounts['Learning'] || 0);
  vitality += (categoryCounts['Health'] || 0);
  charisma += (categoryCounts['Social'] || 0);
  creativity += (categoryCounts['Creative'] || 0);
  productivity += (categoryCounts['Productivity'] || 0);
  return {
    Strength: strength,
    Wisdom: wisdom,
    Vitality: vitality,
    Charisma: charisma,
    Creativity: creativity,
    Productivity: productivity,
  };
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
    // Level, title, achievements
    const { level, levelProgress, title } = getLevelInfo(totalCheckins);
    const achievements = getAchievements({ totalCheckins, longestStreak, goalsAchieved, categoryStats });
    // Character stats
    const characterStats = getCharacterStats({ ...req.user, ...req }, habits);
    res.json({
      totalHabits,
      totalCheckins,
      longestStreak,
      mostConsistentHabit: mostConsistentHabit || '',
      goalsAchieved,
      checkinsPerHabit,
      checkinsPerDay,
      categoryStats,
      userLevel: level,
      levelProgress,
      title,
      achievements,
      characterStats,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Add leaderboard endpoint
export const getLeaderboard = async (req, res) => {
  try {
    // Top users by check-ins
    const users = await prisma.user.findMany({
      select: { id: true, username: true, auraPoints: true, habits: { include: { checkins: true } } },
    });
    const leaderboard = users.map(user => {
      const totalCheckins = user.habits.reduce((sum, h) => sum + h.checkins.length, 0);
      const { level, title } = getLevelInfo(totalCheckins);
      return {
        id: user.id,
        username: user.username,
        auraPoints: user.auraPoints,
        totalCheckins,
        level,
        title,
      };
    }).sort((a, b) => b.level - a.level || b.totalCheckins - a.totalCheckins).slice(0, 10);
    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { username: true, auraPoints: true, createdAt: true, age: true, location: true, height: true, weight: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Get total check-ins for level info
    const habits = await prisma.habit.findMany({
      where: { userId: req.userId },
      include: { checkins: true },
    });
    const totalCheckins = habits.reduce((sum, h) => sum + h.checkins.length, 0);
    const { level, levelProgress, title } = getLevelInfo(totalCheckins);
    const characterStats = getCharacterStats(user, habits);
    res.json({ ...user, userLevel: level, levelProgress, title, totalCheckins, characterStats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { age, location, height, weight } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        age,
        location,
        height,
        weight,
      },
      select: {
        id: true,
        username: true,
        auraPoints: true,
        createdAt: true,
        age: true,
        location: true,
        height: true,
        weight: true,
      },
    });

    // Recompute derived fields to keep UI metrics visible
    const habits = await prisma.habit.findMany({
      where: { userId: req.userId },
      include: { checkins: true },
    });
    const totalCheckins = habits.reduce((sum, h) => sum + h.checkins.length, 0);
    const { level, levelProgress, title } = getLevelInfo(totalCheckins);
    const characterStats = getCharacterStats(updated, habits);

    res.json({
      ...updated,
      userLevel: level,
      levelProgress,
      title,
      totalCheckins,
      characterStats,
    });
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

// Advanced analytics: trends (optionally filtered by date range)
export const getCheckinTrends = async (req, res) => {
  try {
    const userId = req.userId;
    const { start, end } = req.query;
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: { checkins: true },
    });
    let allCheckins = habits.flatMap(habit => habit.checkins.map(c => new Date(c.date)));
    if (start) allCheckins = allCheckins.filter(d => isAfter(d, parseISO(start)) || format(d, 'yyyy-MM-dd') === start);
    if (end) allCheckins = allCheckins.filter(d => isBefore(d, parseISO(end)) || format(d, 'yyyy-MM-dd') === end);
    const checkinsByDay = {};
    allCheckins.forEach(date => {
      const day = format(date, 'yyyy-MM-dd');
      checkinsByDay[day] = (checkinsByDay[day] || 0) + 1;
    });
    const trends = Object.entries(checkinsByDay).map(([date, count]) => ({ date, count }));
    res.json({ trends });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
};

// Advanced analytics: best/worst days of week
export const getDayOfWeekStats = async (req, res) => {
  try {
    const userId = req.userId;
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: { checkins: true },
    });
    let allCheckins = habits.flatMap(habit => habit.checkins.map(c => new Date(c.date)));
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = Array(7).fill(0);
    allCheckins.forEach(date => {
      dayCounts[getDay(date)]++;
    });
    const stats = days.map((day, i) => ({ day, count: dayCounts[i] }));
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch day-of-week stats' });
  }
};

// Advanced analytics: export all check-ins as CSV
export const exportCheckins = async (req, res) => {
  try {
    const userId = req.userId;
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: { checkins: true },
    });
    const rows = habits.flatMap(habit => habit.checkins.map(c => ({
      habit: habit.title,
      date: format(new Date(c.date), 'yyyy-MM-dd'),
      category: habit.category,
    })));
    const parser = new Parser({ fields: ['habit', 'date', 'category'] });
    const csv = parser.parse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('habit_checkins.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export checkins' });
  }
};

// Advanced analytics: heatmap data (check-ins per day)
export const getHeatmapData = async (req, res) => {
  try {
    const userId = req.userId;
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: { checkins: true },
    });
    let allCheckins = habits.flatMap(habit => habit.checkins.map(c => new Date(c.date)));
    const checkinsByDay = {};
    allCheckins.forEach(date => {
      const day = format(date, 'yyyy-MM-dd');
      checkinsByDay[day] = (checkinsByDay[day] || 0) + 1;
    });
    res.json({ heatmap: checkinsByDay });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
};
