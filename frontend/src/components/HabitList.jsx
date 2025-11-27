import { useEffect, useState } from 'react';
import axios from 'axios';
import HabitItem from './HabitItem';
import toast from 'react-hot-toast';
import TitleText from './TitleText';
import { decryptText, encryptText, isCiphertext } from '../utils/crypto';
import { API_URL } from '../api/config';

// Category color mapping
const getCategoryColor = (category) => {
  const colors = {
    'General': 'bg-gray-500 text-gray-100',
    'Health': 'bg-green-500/20 text-green-300 border border-green-500/30',
    'Fitness': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    'Learning': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    'Productivity': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    'Mindfulness': 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
    'Social': 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    'Creative': 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    'Financial': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    'Career': 'bg-red-500/20 text-red-300 border border-red-500/30'
  };
  return colors[category] || colors['General'];
};


const STREAK_MILESTONES = [7, 15, 30, 90];

export function MilestoneModal({ open, onClose, habits }) {
  const getNextMilestone = (streak) => {
    for (let ms of STREAK_MILESTONES) {
      if (streak < ms) return ms;
    }
    return null;
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-surface p-8 rounded-xl shadow-2xl w-full max-w-lg relative animate-fade-in">
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-red-600 text-white hover:bg-red-800 transition"
          onClick={onClose}
          title="Close"
        >
          ✕
        </button>
        <h2 className="text-2xl font-heading text-primary mb-4 flex items-center gap-2">
          <span>Milestones & Goals</span>
          <span className="text-xl">🏆</span>
        </h2>
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {habits.length === 0 ? (
            <div className="text-aura">No habits to show.</div>
          ) : (
            habits.map(habit => {
              const nextMs = getNextMilestone(habit.streak || 0);
              return (
                <div key={habit.id} className="bg-background rounded-lg p-4 shadow flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <TitleText text={habit.title} className="font-heading text-primary text-lg" />
                    <span className="text-2xl">🔥</span>
                    <span className="text-aura font-bold">{habit.streak || 0}</span>
                    {nextMs && (
                      <span className="ml-2 px-2 py-1 rounded-full bg-yellow-300/30 text-yellow-800 text-xs font-bold flex items-center gap-1">
                        Next: {nextMs}-day <span className="text-yellow-500">🏅</span>
                      </span>
                    )}
                  </div>
                  {habit.goalProgress && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-aura">Goal:</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            habit.goalProgress.achieved ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(habit.goalProgress.current, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {habit.goalProgress.current}% / {habit.goalProgress.target}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const HabitList = ({ refresh, onUserUpdate, onHabitsRefresh }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingHabit, setEditingHabit] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editFrequency, setEditFrequency] = useState('Daily');
  const [editCategory, setEditCategory] = useState('General');
  const [editGoal, setEditGoal] = useState('');
  const [editGoalPeriod, setEditGoalPeriod] = useState('Weekly');
  const [categories, setCategories] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);

  useEffect(() => {
    const fetchHabits = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/habits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHabits(res.data);
        // One-time normalization: if titles are client-encrypted and decryptable,
        // persist them back to plaintext so they are visible across devices.
        normalizeEncryptedTitles(res.data).catch(() => {});
      } catch (err) {
        setError('Failed to fetch habits');
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, [refresh]);

  const normalizeEncryptedTitles = async (items) => {
    const alreadyRun = localStorage.getItem('normalizedTitlesV1');
    if (alreadyRun === 'true') return;
    const token = localStorage.getItem('token');
    for (const h of items) {
      if (isCiphertext(h.title)) {
        const plain = await decryptText(h.title);
        // Only update if decryption succeeded (not lock emoji)
        if (plain && plain !== '🔒') {
          try {
            await axios.put(`${API_URL}/habits/${h.id}`, {
              title: plain.trim(),
              frequency: h.frequency,
              category: h.category || 'General',
              goal: h.goal || null,
              goalPeriod: h.goalPeriod || 'Weekly',
            }, {
              headers: { Authorization: `Bearer ${token}` },
            });
            // Update local state immediately
            setHabits(prev => prev.map(x => x.id === h.id ? { ...x, title: plain.trim() } : x));
          } catch (e) {
            // ignore per-item errors
          }
        }
      }
    }
    localStorage.setItem('normalizedTitlesV1', 'true');
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/habits/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (habit) => {
    const titlePlain = isCiphertext(habit.title) ? await decryptText(habit.title) : habit.title;
    if (!window.confirm(`Delete habit "${titlePlain}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/habits/${habit.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(habits.filter(h => h.id !== habit.id));
      toast.success(`Deleted habit "${titlePlain}"`);
      if (onUserUpdate) onUserUpdate();
      if (onHabitsRefresh) onHabitsRefresh();
    } catch (err) {
      toast.error('Failed to delete habit');
    }
  };

  const handleEdit = async (habit) => {
    setEditingHabit(habit);
    const titlePlain = isCiphertext(habit.title) ? await decryptText(habit.title) : habit.title;
    setEditTitle(titlePlain);
    setEditFrequency(habit.frequency);
    setEditCategory(habit.category || 'General');
    setEditGoal(habit.goal ? habit.goal.toString() : '');
    setEditGoalPeriod(habit.goalPeriod || 'Weekly');
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/habits/${editingHabit.id}`, {
        title: editTitle.trim(),
        frequency: editFrequency.trim(),
        category: editCategory.trim(),
        goal: editGoal ? parseInt(editGoal) : null,
        goalPeriod: editGoalPeriod.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(habits.map(h => h.id === editingHabit.id ? { 
        ...h, 
        title: editTitle.trim(), 
        frequency: editFrequency, 
        category: editCategory,
        goal: editGoal ? parseInt(editGoal) : null,
        goalPeriod: editGoalPeriod
      } : h));
      setEditingHabit(null);
      toast.success('Habit updated!');
      if (onUserUpdate) onUserUpdate();
      if (onHabitsRefresh) onHabitsRefresh();
    } catch (err) {
      setEditError('Failed to update habit');
      toast.error('Failed to update habit');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCheckin = async (habit) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/habits/${habit.id}/checkin`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update habit with new streak and goal progress (if provided)
      const updatedHabits = habits.map(h =>
        h.id === habit.id
          ? { ...h, streak: res.data.streak, goalProgress: res.data.goalProgress ?? h.goalProgress }
          : h
      );
      setHabits(updatedHabits);
      
      // Check if goal was achieved
      const updatedHabit = updatedHabits.find(h => h.id === habit.id);
      const titlePlain = isCiphertext(habit.title) ? await decryptText(habit.title) : habit.title;
      if (updatedHabit?.goalProgress?.achieved && !habit.goalProgress?.achieved) {
        toast.success(`🎉 Goal achieved for "${titlePlain}"! You've reached ${updatedHabit.goalProgress.target}%!`, {
          duration: 4000,
        });
      } else {
        toast.success(`Checked in for "${titlePlain}"! 🔥`);
      }
      if (onUserUpdate) onUserUpdate();
      if (onHabitsRefresh) onHabitsRefresh();
    } catch (err) {
      if (err.response?.data?.error === 'Already checked in today') {
        const titlePlain = isCiphertext(habit.title) ? await decryptText(habit.title) : habit.title;
        toast.error(`Already checked in today for "${titlePlain}"`);
      } else {
        toast.error('Failed to check in');
      }
    }
  };

  // Helper to get next milestone for a habit
  const getNextMilestone = (streak) => {
    for (let ms of STREAK_MILESTONES) {
      if (streak < ms) return ms;
    }
    return null;
  };

  // Helper to get allowed goal periods
  const getAllowedGoalPeriods = (freq) => {
    if (freq === 'Weekly') return ['Monthly', 'Yearly'];
    if (freq === 'Monthly') return ['Yearly'];
    return ['Weekly', 'Monthly', 'Yearly'];
  };

  // Helper to get allowed goal periods and disabled states
  const goalPeriodOptions = [
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Yearly', label: 'Yearly' },
  ];

  const getDisabledGoalPeriods = (freq) => {
    if (freq === 'Weekly') return ['Weekly'];
    if (freq === 'Monthly') return ['Weekly', 'Monthly'];
    return [];
  };

  useEffect(() => {
    const disabled = getDisabledGoalPeriods(editFrequency);
    if (disabled.includes(editGoalPeriod)) {
      // Pick the first enabled option
      const firstEnabled = goalPeriodOptions.find(opt => !disabled.includes(opt.value));
      setEditGoalPeriod(firstEnabled.value);
    }
    // eslint-disable-next-line
  }, [editFrequency]);

  if (loading) return <div className="text-aura">Loading habits...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (habits.length === 0) return <div className="text-text">No habits yet. Add your first habit!</div>;

  const filteredHabits = selectedCategory === 'All' 
    ? habits 
    : habits.filter(habit => habit.category === selectedCategory);

  return (
    <>
      {/* Remove milestone modal trigger button and its containing div. Replace with a simple heading. */}
      <div className="mb-4">
        <span className="text-lg font-heading text-aura">Your Habits</span>
      </div>
      {/* Milestone Modal (still needed for Dashboard, but not triggered here) */}
      {milestoneModalOpen && (
        <MilestoneModal
          open={milestoneModalOpen}
          onClose={() => setMilestoneModalOpen(false)}
          habits={habits}
        />
      )}
      {/* Category Filter */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-aura">Filter:</span>
          <select
            className="px-3 py-1 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {filteredHabits.map(habit => (
          <HabitItem
            key={habit.id}
            habit={habit}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onCheckin={handleCheckin}
          />
        ))}
      {/* Edit Modal */}
      {editingHabit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form onSubmit={handleEditSubmit} className="bg-surface p-6 rounded-xl shadow-lg flex flex-col gap-4 min-w-[300px]">
            <h3 className="text-xl font-heading text-primary mb-2">Edit Habit</h3>
            <input
              type="text"
              className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              required
            />
            <select
              className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              value={editFrequency}
              onChange={e => setEditFrequency(e.target.value)}
              required
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            <div className="relative">
              <select
                className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary w-full"
                value={editCategory}
                onChange={e => setEditCategory(e.target.value)}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <div className={`w-3 h-3 rounded-full ${getCategoryColor(editCategory)}`}></div>
              </div>
            </div>
            
            {/* Goal Settings */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Goal % (optional)"
                className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary flex-1"
                value={editGoal}
                onChange={e => setEditGoal(e.target.value)}
                min="1"
                max="100"
              />
              <select
                className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                value={editGoalPeriod}
                onChange={e => setEditGoalPeriod(e.target.value)}
              >
                {goalPeriodOptions.filter(opt => getAllowedGoalPeriods(editFrequency).includes(opt.value)).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            {editError && <div className="text-red-400 text-sm">{editError}</div>}
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 rounded bg-gray-500 text-white" onClick={() => setEditingHabit(null)}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-primary text-white font-heading shadow-neon hover:bg-accent transition" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default HabitList; 
