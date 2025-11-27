import { useState, useEffect } from 'react';
import axios from 'axios';
import { encryptText } from '../utils/crypto';
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

// Helper to get allowed goal periods
const goalPeriodOptions = [
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Yearly', label: 'Yearly' },
];

const getAllowedGoalPeriods = (freq) => {
  if (freq === 'Weekly') return ['Monthly', 'Yearly'];
  if (freq === 'Monthly') return ['Yearly'];
  return ['Weekly', 'Monthly', 'Yearly'];
};

const AddHabitForm = ({ onHabitAdded, onUserUpdate }) => {
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [category, setCategory] = useState('General');
  const [categories, setCategories] = useState([]);
  const [goal, setGoal] = useState('');
  const [goalPeriod, setGoalPeriod] = useState('Weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  useEffect(() => {
    const allowed = getAllowedGoalPeriods(frequency);
    if (!allowed.includes(goalPeriod)) {
      setGoalPeriod(allowed[0]);
    }
    // eslint-disable-next-line
  }, [frequency]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/habits`, { 
        title: title.trim(), 
        frequency: frequency.trim(),
        category: category.trim(),
        goal: goal ? parseInt(goal) : null,
        goalPeriod: goalPeriod.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Habit added!');
      setTitle('');
      setFrequency('Daily');
      setCategory('General');
      setGoal('');
      setGoalPeriod('Weekly');
      if (onHabitAdded) onHabitAdded();
      if (onUserUpdate) onUserUpdate();
    } catch (err) {
      console.log('Add habit error:', err, err.response);
      setError(err.response?.data?.error || err.message || 'Failed to add habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-surface/80 p-4 rounded-lg shadow w-full max-w-md mb-6">
      <input
        type="text"
        placeholder="Habit Title"
        className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <select
        className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
        value={frequency}
        onChange={e => setFrequency(e.target.value)}
        required
      >
        <option value="Daily">Daily</option>
        <option value="Weekly">Weekly</option>
        <option value="Monthly">Monthly</option>
      </select>
      <div className="relative">
        <select
          className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary w-full"
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`}></div>
        </div>
      </div>
      
      {/* Goal Settings */}
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Goal % (optional)"
          className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary flex-1"
          value={goal}
          onChange={e => setGoal(e.target.value)}
          min="1"
          max="100"
        />
        <select
          className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
          value={goalPeriod}
          onChange={e => setGoalPeriod(e.target.value)}
        >
          {goalPeriodOptions.filter(opt => getAllowedGoalPeriods(frequency).includes(opt.value)).map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      
      <button
        type="submit"
        className="mt-2 px-6 py-2 rounded bg-primary text-white font-heading shadow-neon hover:bg-accent transition disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Habit'}
      </button>
      {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
      {success && <div className="text-green-400 text-sm mt-1">{success}</div>}
    </form>
  );
};

export default AddHabitForm; 
