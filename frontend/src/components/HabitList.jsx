import { useEffect, useState } from 'react';
import axios from 'axios';
import HabitItem from './HabitItem';
import toast from 'react-hot-toast';

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

const API_URL = 'http://localhost:4000/api';

const HabitList = ({ refresh }) => {
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
      } catch (err) {
        setError('Failed to fetch habits');
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, [refresh]);

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
    if (!window.confirm(`Delete habit "${habit.title}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/habits/${habit.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(habits.filter(h => h.id !== habit.id));
      toast.success(`Deleted habit "${habit.title}"`);
    } catch (err) {
      toast.error('Failed to delete habit');
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setEditTitle(habit.title);
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
        title: editTitle, 
        frequency: editFrequency, 
        category: editCategory,
        goal: editGoal ? parseInt(editGoal) : null,
        goalPeriod: editGoalPeriod
      } : h));
      setEditingHabit(null);
      toast.success('Habit updated!');
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
      
      // Update habit with new streak
      const updatedHabits = habits.map(h => h.id === habit.id ? { ...h, streak: res.data.streak } : h);
      setHabits(updatedHabits);
      
      // Check if goal was achieved
      const updatedHabit = updatedHabits.find(h => h.id === habit.id);
      if (updatedHabit?.goalProgress?.achieved && !habit.goalProgress?.achieved) {
        toast.success(`🎉 Goal achieved for "${habit.title}"! You've reached ${updatedHabit.goalProgress.target}%!`, {
          duration: 4000,
        });
      } else {
        toast.success(`Checked in for "${habit.title}"! 🔥`);
      }
    } catch (err) {
      if (err.response?.data?.error === 'Already checked in today') {
        toast.error(`Already checked in today for "${habit.title}"`);
      } else {
        toast.error('Failed to check in');
      }
    }
  };

  if (loading) return <div className="text-aura">Loading habits...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (habits.length === 0) return <div className="text-text">No habits yet. Add your first habit!</div>;

  const filteredHabits = selectedCategory === 'All' 
    ? habits 
    : habits.filter(habit => habit.category === selectedCategory);

  return (
    <>
      <div className="flex flex-col gap-4 w-full max-w-md">
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
      </div>
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
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
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