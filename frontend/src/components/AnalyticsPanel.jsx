import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const API_URL = 'http://localhost:4000/api';

const AnalyticsPanel = ({ open, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError('');
      axios.get(`${API_URL}/habits/analytics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(res => setStats(res.data))
        .catch(() => setError('Failed to fetch analytics'))
        .finally(() => setLoading(false));
    }
  }, [open]);

  // Chart data
  const barData = stats && stats.checkinsPerHabit ? {
    labels: stats.checkinsPerHabit.map(h => h.title),
    datasets: [
      {
        label: 'Check-ins per Habit',
        data: stats.checkinsPerHabit.map(h => h.count),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  } : null;

  const lineData = stats && stats.checkinsPerDay ? {
    labels: stats.checkinsPerDay.map(d => d.date),
    datasets: [
      {
        label: 'Check-ins per Day',
        data: stats.checkinsPerDay.map(d => d.count),
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  } : null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: open ? 0 : '100%' }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full max-w-md bg-surface shadow-2xl z-50 flex flex-col p-8 overflow-y-auto"
      style={{ pointerEvents: open ? 'auto' : 'none' }}
    >
      <button
        className="self-end mb-4 px-3 py-1 rounded bg-red-600 text-white font-heading shadow hover:bg-red-800 transition"
        onClick={onClose}
      >
        Close
      </button>
      <h2 className="text-3xl font-heading text-primary mb-6">Analytics</h2>
      {loading ? (
        <div className="text-aura">Loading...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : stats ? (
        <div className="flex flex-col gap-4">
          <div className="bg-background/80 rounded-lg p-4 shadow">
            <div className="text-lg font-heading text-aura">Total Habits</div>
            <div className="text-2xl font-bold text-text">{stats.totalHabits}</div>
          </div>
          <div className="bg-background/80 rounded-lg p-4 shadow">
            <div className="text-lg font-heading text-aura">Longest Streak</div>
            <div className="text-2xl font-bold text-text">{stats.longestStreak}</div>
          </div>
          <div className="bg-background/80 rounded-lg p-4 shadow">
            <div className="text-lg font-heading text-aura">Total Check-ins</div>
            <div className="text-2xl font-bold text-text">{stats.totalCheckins}</div>
          </div>
          <div className="bg-background/80 rounded-lg p-4 shadow">
            <div className="text-lg font-heading text-aura">Most Consistent Habit</div>
            <div className="text-2xl font-bold text-text">{stats.mostConsistentHabit || '--'}</div>
          </div>
          {barData && barData.labels.length > 0 && (
            <div className="bg-background/80 rounded-lg p-4 shadow">
              <div className="text-lg font-heading text-aura mb-2">Check-ins per Habit</div>
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          )}
          {lineData && lineData.labels.length > 0 && (
            <div className="bg-background/80 rounded-lg p-4 shadow">
              <div className="text-lg font-heading text-aura mb-2">Check-ins Over Time</div>
              <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { type: 'time', time: { unit: 'day' } } } }} />
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
};

export default AnalyticsPanel; 