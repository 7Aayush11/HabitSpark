import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState('');
  const navigate = useNavigate();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(null);
  const [checkinStatus, setCheckinStatus] = useState('');


  useEffect(() => {
    if (analytics && prevLevel !== null && analytics.level > prevLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 2000);
    }
    setPrevLevel(analytics?.level);
  }, [analytics]);  


  useEffect(() => {
    fetchAnalytics();
    fetchHabits();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/analytics');
      setAnalytics(res.data);
    } catch (err) {
      toast.error('Session expired');
      localStorage.removeItem('access_token');
      navigate('/');
    }
  };

  const fetchHabits = async () => {
    try {
      const res = await axios.get('/habits');
      setHabits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckin = async () => {
    if (!selectedHabit) return toast.error('Select a habit');
    try {
      const res = await axios.post('/checkin', { habit_id: parseInt(selectedHabit) });
      
      setCheckinStatus(res.data.message || 'Check-in successful!');
      toast.success(res.data.message);
      
      fetchAnalytics(); // refresh XP and level
      setTimeout(() => setCheckinStatus(''), 3000); // clear feedback
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-in failed');
    }
  };


  return (
    <>
    <TopNav />
    <div className="min-h-screen px-6 py-10 bg-dark text-text">
      <h2 className="text-3xl font-bold mb-6 text-aura">Welcome Back 👋</h2>

      {/* Stats Grid */}
      {analytics && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-1">Level Progress</h3>
          <ProgressBar level={analytics.level} aura={analytics.total_aura} next_level_aura={analytics.next_level_aura} />
          {showLevelUp && (
            <div className="text-aura text-center mt-4 text-lg font-bold animate-bounce">
              🎉 LEVEL UP!
            </div>
          )}
        </div>
      )}


      {/* Check-in Area */}
      <div className="bg-card rounded-xl p-6 mb-10">
        <label className="block text-sm mb-2 font-semibold">Select a Habit</label>
        <select
          onChange={(e) => setSelectedHabit(e.target.value)}
          value={selectedHabit}
          className="w-full p-3 rounded bg-dark border border-gray-700 mb-4 focus:ring-aura focus:outline-none"
          >
          <option value="">-- Choose a Habit --</option>
          {habits.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
        <button
          onClick={handleCheckin}
          disabled={!selectedHabit} className={`w-full bg-aura text-white py-2 rounded transition hover:bg-purple-600 active:scale-95 disabled:opacity-50`}>
          Check In ✅
        </button>

        {checkinStatus && (
          <div className="text-aura text-center mt-3 animate-pulse font-semibold text-sm">
            {checkinStatus}
          </div>
        )}
      </div>

      {/* Recent Check-ins */}
      <div className="bg-card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Check-ins</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          {analytics?.recent_checkins?.map((entry, i) => (
            <li key={i} className="border-b border-gray-700 pb-1">
              🗓️ {entry.date} — <span className="text-aura">{entry.habit_name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
  );
}

function StatCard({ title, value, color }) {
  const baseColor = color === 'aura' ? 'text-aura' : 'text-white';
  return (
    <div className="bg-card p-4 rounded-xl shadow flex flex-col items-center justify-center">
      <p className="text-xs text-gray-400">{title}</p>
      <p className={`text-xl font-bold ${baseColor}`}>{value}</p>
    </div>
  );
}


function ProgressBar({ level, aura, next_level_aura }) {
  const base = 1.3;
  const currentLevelAura = Math.floor(Math.pow(base, level));
  const auraThisLevel = next_level_aura - currentLevelAura;
  const auraInLevel = aura - currentLevelAura;
  const progress = Math.min((auraInLevel / auraThisLevel) * 100, 100).toFixed(2);

  return (
    <div className="w-full">
      <div className="relative w-full bg-gray-800 rounded-full h-5 overflow-hidden">
        <div
          className="bg-aura h-full transition-all duration-700 animate-glow"
          style={{ width: `${progress}%` }}>
        </div>

      </div>
      <p className="text-xs text-gray-400 mt-1 text-right">
        {Math.floor(auraInLevel)} / {auraThisLevel} XP to level {level + 1}
      </p>
    </div>
  );
}
