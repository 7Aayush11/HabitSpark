// src/pages/CheckIn.jsx
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import AppLayout from '../components/layouts/AppLayout';

export default function CheckIn() {
  const [habits, setHabits] = useState([]); // Default empty array
  const [aura, setAura] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextLevelAura, setNextLevelAura] = useState(100);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/habits');
      setHabits(res.data?.habits || []); // Fallback to [] if undefined
    } catch (err) {
      toast.error('Failed to fetch habits');
      setHabits([]); // Ensure habits is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (habitId) => {
    try {
      const res = await axios.post(`/habits/checkin/${habitId}`);
      toast.success(res.data.message);
      setAura(res.data.total_aura);
      setLevel(res.data.level);
      setNextLevelAura(res.data.next_level_aura);
    } catch (err) {
      toast.error('Check-in failed');
    }
  };

  return (
    <AppLayout>
      <motion.div
        className="min-h-screen p-6 bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-purple-400">Daily Check-In</h1>

          {/* Aura & Level Display */}
          <div className="mb-6">
            <p className="text-lg">Level: <span className="font-bold text-purple-300">{level}</span></p>
            <p className="text-lg">Aura: <span className="font-bold text-purple-300">{aura}</span></p>
            <div className="w-full bg-purple-900 rounded-full h-4 mt-2 overflow-hidden">
              <motion.div
                className="bg-purple-400 h-4"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((aura / nextLevelAura) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Habits List (Safe Rendering) */}
          {loading ? (
            <p className="text-purple-200">Loading habits...</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {habits.length > 0 ? (
                habits.map((habit) => (
                  <motion.div
                    key={habit.id}
                    className="bg-black/30 border border-purple-700 rounded-xl p-4 shadow-md backdrop-blur hover:scale-[1.02] transition"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-xl font-semibold text-purple-300 mb-2">{habit.name}</h3>
                    <p className="text-sm mb-4 text-purple-200">{habit.description}</p>
                    <button
                      onClick={() => handleCheckIn(habit.id)}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 rounded text-white font-medium"
                    >
                      Check-In
                    </button>
                  </motion.div>
                ))
              ) : (
                <p className="text-purple-200">No habits found. Start by adding one!</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}