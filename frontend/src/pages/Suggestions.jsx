// src/pages/SuggestHabit.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import AppLayout from '../components/layouts/AppLayout';

const commonHabits = [
  'Exercise',
  'Reading',
  'Meditation',
  'Journaling',
  'Healthy Eating',
  'Waking Up Early',
];

export default function SuggestHabit() {
  const [formData, setFormData] = useState({
    habit_name: '',
    description: '',
    custom: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const habitName = formData.habit_name === 'custom' ? formData.custom : formData.habit_name;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/suggestions',
        { habit_name: habitName, description: formData.description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Suggestion submitted successfully');
      setFormData({ habit_name: '', description: '', custom: '' });
    } catch (err) {
      toast.error('Failed to submit suggestion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-950 text-purple-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="bg-black/40 border border-purple-700 p-8 rounded-xl shadow-lg backdrop-blur-lg max-w-lg w-full"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-purple-300">Suggest a New Habit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Select a Habit</label>
            <select
              name="habit_name"
              value={formData.habit_name}
              onChange={(e) => setFormData({ ...formData, habit_name: e.target.value })}
              className="w-full px-4 py-2 rounded bg-black/60 border border-purple-500"
              required
            >
              <option value="">Select from common habits</option>
              {commonHabits.map((habit, index) => (
                <option key={index} value={habit}>
                  {habit}
                </option>
              ))}
              <option value="custom">Other (Suggest New)</option>
            </select>
          </div>

          {formData.habit_name === 'custom' && (
            <div>
              <label className="block mb-1">Custom Habit Name</label>
              <input
                type="text"
                value={formData.custom}
                onChange={(e) => setFormData({ ...formData, custom: e.target.value })}
                className="w-full px-4 py-2 rounded bg-black/60 border border-purple-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block mb-1">Description (Optional)</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded bg-black/60 border border-purple-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 rounded transition"
          >
            {loading ? 'Submitting...' : 'Submit Suggestion'}
          </button>
        </form>
      </motion.div>
    </motion.div>      
    </AppLayout>
  );
}