import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HabitList from './HabitList';
import AddHabitForm from './AddHabitForm';
import AnalyticsPanel from './AnalyticsPanel';
import axios from 'axios';
import ProfileCard from './ProfileCard';
import ProfilePanel from './ProfilePanel';

function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:4000/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        setError('Failed to fetch user info');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      {/* Floating Logout Button */}
      <button
        className="fixed top-6 right-6 z-40 px-5 py-2 rounded-lg bg-red-600 text-white font-heading shadow hover:bg-red-800 transition"
        onClick={onLogout}
      >
        Logout
      </button>
      {/* Floating Profile Button */}
      <button
        className="fixed top-6 left-6 z-40 px-5 py-2 rounded-lg bg-aura text-white font-heading shadow hover:bg-primary transition"
        onClick={() => setProfileOpen(true)}
      >
        Profile
      </button>
      {/* Analytics Tab/Button */}
      <button
        className="fixed top-1/2 right-0 z-40 px-4 py-2 rounded-l-lg bg-primary text-white font-heading shadow-neon hover:bg-accent transition transform -translate-y-1/2"
        onClick={() => setAnalyticsOpen(true)}
      >
        Analytics
      </button>
      {/* Analytics Panel */}
      <AnalyticsPanel open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
      {/* Profile Panel */}
      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} user={user} onProfileUpdate={setUser} />
      <div className="flex w-full max-w-6xl gap-8 items-center justify-center">
        {/* Main Content */}
        <div className="bg-surface p-8 rounded-xl shadow-lg flex flex-col items-center gap-4 flex-1 min-w-[320px] max-w-xl mx-auto">
          {loading ? (
            <div className="text-aura">Loading user info...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : user ? (
            <>
              <div className="text-lg text-center">Welcome, <span className="text-aura font-bold">{user.name || user.email}</span></div>
              <div className="text-xl text-center">Aura Points: <span className="text-primary font-bold">{user.auraPoints}</span></div>
            </>
          ) : null}
          <div className="w-full flex flex-col items-center justify-center mt-8">
            <h3 className="text-2xl font-heading mb-4 text-text text-center">Your Habits</h3>
            <AddHabitForm onHabitAdded={() => setRefresh(r => r + 1)} />
            <HabitList refresh={refresh} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 