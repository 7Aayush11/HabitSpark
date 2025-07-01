// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import AppLayout from '../components/layouts/AppLayout';
import { FaBolt } from 'react-icons/fa';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [aura, setAura] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await axios.get('/habits');
        setHabits(response.data);
      } catch (error) {
        console.error('Error fetching habits:', error);
        toast.error('Failed to load habits');
      }
    };

    const fetchAura = async () => {
      try {
        const res = await axios.get('/analytics/aura');
        setAura(res.data.aura || 0);
        setLevel(Math.floor((res.data.aura || 0) / 100) + 1);
      } catch (error) {
        console.error('Error fetching aura:', error);
      }
    };

    fetchHabits();
    fetchAura();
  }, []);

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-black/30 border border-purple-700 rounded-2xl p-6 shadow-xl backdrop-blur-md relative"
        >
          <h1 className="text-2xl font-bold text-purple-300">Welcome Back!</h1>
          <p className="text-sm text-purple-100 mt-2">Here’s your habit journey so far:</p>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <FaBolt className="text-yellow-400 animate-pulse" />
            <span className="text-purple-100 font-mono">Aura: {aura}</span>
            <span className="text-purple-300 font-bold">Lv {level}</span>
          </div>

          <div className="mt-6 h-3 w-full bg-purple-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${aura % 100}%` }}
              transition={{ duration: 1 }}
            ></motion.div>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {habits.map((habit, i) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-black/20 border border-purple-800 rounded-xl p-4 shadow-inner hover:shadow-purple-500/50 transition-all"
            >
              <h2 className="text-xl font-semibold text-purple-200 mb-2">{habit.name}</h2>
              <p className="text-sm text-purple-300 mb-4">{habit.description}</p>
              <div className="h-2 bg-purple-900 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${habit.progress || 0}%` }}
                  transition={{ duration: 1 }}
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}