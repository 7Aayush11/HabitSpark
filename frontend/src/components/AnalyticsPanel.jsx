import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import { saveAs } from 'file-saver';
import { decryptText, isCiphertext } from '../utils/crypto';
import { API_URL } from '../api/config';

// Category color mapping (same as HabitItem)
const getCategoryColor = (category) => {
  const colors = {
    'General': 'hsl(0, 0%, 50%)',
    'Health': 'hsl(120, 30%, 50%)',
    'Fitness': 'hsl(210, 30%, 50%)',
    'Learning': 'hsl(270, 30%, 50%)',
    'Productivity': 'hsl(60, 30%, 50%)',
    'Mindfulness': 'hsl(330, 30%, 50%)',
    'Social': 'hsl(240, 30%, 50%)',
    'Creative': 'hsl(30, 30%, 50%)',
    'Financial': 'hsl(160, 30%, 50%)',
    'Career': 'hsl(0, 30%, 50%)'
  };
  return colors[category] || colors['General'];
};
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
  Filler,
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
  TimeScale,
  Filler
);



const AnalyticsPanel = ({ open, onClose, user }) => {
  const [stats, setStats] = useState(null);
  const [decryptedLabels, setDecryptedLabels] = useState(null);
  const [mostConsistentDecrypted, setMostConsistentDecrypted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trendData, setTrendData] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState('');
  const [trendStart, setTrendStart] = useState('');
  const [trendEnd, setTrendEnd] = useState('');
  const [daysData, setDaysData] = useState(null);
  const [daysLoading, setDaysLoading] = useState(false);
  const [daysError, setDaysError] = useState('');

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

  // Set default date range: start = registration date (if available), end = today
  useEffect(() => {
    if (!open) return;
    const todayStr = new Date().toISOString().split('T')[0];
    setTrendEnd(prev => prev || todayStr);
    if (user?.createdAt) {
      const startStr = new Date(user.createdAt).toISOString().split('T')[0];
      setTrendStart(prev => prev || startStr);
    } else {
      // Fallback to today if registration date is unavailable
      setTrendStart(prev => prev || todayStr);
    }
  }, [open, user]);

  // Calendar open helpers for date inputs
  const startRef = useRef(null);
  const endRef = useRef(null);
  const openStartPicker = () => {
    if (startRef.current?.showPicker) startRef.current.showPicker();
    else startRef.current?.focus();
  };
  const openEndPicker = () => {
    if (endRef.current?.showPicker) endRef.current.showPicker();
    else endRef.current?.focus();
  };

  // Fetch trend data
  useEffect(() => {
    if (!open) return;
    // Wait until default dates are set
    if (!trendStart || !trendEnd) return;
    setTrendLoading(true);
    setTrendError('');
    let url = `${API_URL}/habits/analytics/trends`;
    const params = [];
    if (trendStart) params.push(`start=${trendStart}`);
    if (trendEnd) params.push(`end=${trendEnd}`);
    if (params.length) url += '?' + params.join('&');
    axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => setTrendData(res.data.trends))
      .catch(() => setTrendError('Failed to fetch trends'))
      .finally(() => setTrendLoading(false));
  }, [open, trendStart, trendEnd]);

  // Fetch best/worst days
  useEffect(() => {
    if (!open) return;
    setDaysLoading(true);
    setDaysError('');
    axios.get(`${API_URL}/habits/analytics/days`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => setDaysData(res.data.stats))
      .catch(() => setDaysError('Failed to fetch day-of-week stats'))
      .finally(() => setDaysLoading(false));
  }, [open]);

  // Decrypt titles used in analytics when stats change
  useEffect(() => {
    const run = async () => {
      if (!stats) {
        setDecryptedLabels(null);
        setMostConsistentDecrypted(null);
        return;
      }
      if (stats.checkinsPerHabit && stats.checkinsPerHabit.length) {
        const labels = await Promise.all(stats.checkinsPerHabit.map(async h => (
          isCiphertext(h.title) ? await decryptText(h.title) : h.title
        )));
        setDecryptedLabels(labels);
      } else {
        setDecryptedLabels(null);
      }
      if (stats.mostConsistentHabit) {
        const plain = isCiphertext(stats.mostConsistentHabit) ? await decryptText(stats.mostConsistentHabit) : stats.mostConsistentHabit;
        setMostConsistentDecrypted(plain);
      } else {
        setMostConsistentDecrypted(null);
      }
    };
    run();
  }, [stats]);

  // Chart data
  const barData = stats && stats.checkinsPerHabit ? {
    labels: decryptedLabels || stats.checkinsPerHabit.map(h => h.title),
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

  // Trend chart data
  const trendChartData = trendData ? {
    labels: trendData.map(d => d.date),
    datasets: [
      {
        label: 'Check-ins',
        data: trendData.map(d => d.count),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  } : null;

  // Best/worst days chart data
  const daysChartData = daysData ? {
    labels: daysData.map(d => d.day),
    datasets: [
      {
        label: 'Check-ins',
        data: daysData.map(d => d.count),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  } : null;

  // Export CSV
  const handleExport = async () => {
    try {
      const res = await axios.get(`${API_URL}/habits/analytics/export`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob',
      });
      saveAs(res.data, 'habit_checkins.csv');
    } catch (err) {
      alert('Failed to export data');
    }
  };

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
      {/* Level slider removed per request */}
      {/* Advanced Analytics Controls */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <label className="text-aura text-sm w-16">Start:</label>
              <div className="flex items-center gap-2">
                <input
                  ref={startRef}
                  type="date"
                  value={trendStart}
                  onChange={e => setTrendStart(e.target.value)}
                  className="px-2 py-1 rounded bg-background text-text border border-shadow text-sm w-[200px] min-w-[200px]"
                />
                <button
                  type="button"
                  onClick={openStartPicker}
                  className="px-2 py-1 rounded bg-background text-text border border-shadow text-sm hover:bg-surface"
                  title="Open calendar"
                  aria-label="Open start date calendar"
                >📅</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-aura text-sm w-16">End:</label>
              <div className="flex items-center gap-2">
                <input
                  ref={endRef}
                  type="date"
                  value={trendEnd}
                  onChange={e => setTrendEnd(e.target.value)}
                  className="px-2 py-1 rounded bg-background text-text border border-shadow text-sm w-[200px] min-w-[200px]"
                />
                <button
                  type="button"
                  onClick={openEndPicker}
                  className="px-2 py-1 rounded bg-background text-text border border-shadow text-sm hover:bg-surface"
                  title="Open calendar"
                  aria-label="Open end date calendar"
                >📅</button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <button
            className="px-2 py-1 rounded bg-primary text-white font-heading shadow hover:bg-accent transition text-sm"
            onClick={handleExport}
          >
            Export CSV
          </button>
        </div>
      </div>
      {/* Trend Chart */}
      <div className="bg-background/80 rounded-lg p-4 shadow mb-4">
        <div className="text-lg font-heading text-aura mb-2">Check-in Trends</div>
        {trendLoading ? <div className="text-aura">Loading...</div>
          : trendError ? <div className="text-red-400">{trendError}</div>
          : trendChartData && trendChartData.labels.length > 0 ? (
            <Line data={trendChartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { type: 'time', time: { unit: 'day' } } } }} />
          ) : <div className="text-gray-400">No data</div>}
      </div>
      {/* Best/Worst Days Chart */}
      <div className="bg-background/80 rounded-lg p-4 shadow mb-4">
        <div className="text-lg font-heading text-aura mb-2">Best/Worst Days</div>
        {daysLoading ? <div className="text-aura">Loading...</div>
          : daysError ? <div className="text-red-400">{daysError}</div>
          : daysChartData && daysChartData.labels.length > 0 ? (
            <Bar data={daysChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          ) : <div className="text-gray-400">No data</div>}
      </div>
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
            <div className="text-2xl font-bold text-text">{mostConsistentDecrypted || stats.mostConsistentHabit || '--'}</div>
          </div>
          <div className="bg-background/80 rounded-lg p-4 shadow">
            <div className="text-lg font-heading text-aura">Goals Achieved</div>
            <div className="text-2xl font-bold text-text">{stats.goalsAchieved || 0}</div>
          </div>
          {barData && barData.labels.length > 0 && (
            <div className="bg-background/80 rounded-lg p-4 shadow">
              <div className="text-lg font-heading text-aura mb-2">Check-ins per Habit</div>
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          )}
          {/* Removed duplicate time-series chart: Check-ins Over Time */}
          {stats.categoryStats && stats.categoryStats.length > 0 && (
            <div className="bg-background/80 rounded-lg p-4 shadow">
              <div className="text-lg font-heading text-aura mb-2">Habits by Category</div>
              <div className="flex flex-col gap-2">
                {stats.categoryStats.map((cat) => (
                  <div key={cat.category} className="flex justify-between items-center p-2 bg-surface rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(cat.category) }}></div>
                      <span className="text-text font-medium">{cat.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-aura">{cat.habitCount} habits</div>
                      <div className="text-xs text-gray-400">{cat.totalCheckins} check-ins</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
};

export default AnalyticsPanel;
