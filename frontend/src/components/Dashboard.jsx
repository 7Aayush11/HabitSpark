import { useEffect, useState } from 'react';
import HabitList, { MilestoneModal } from './HabitList';
import AddHabitForm from './AddHabitForm';
import AnalyticsPanel from './AnalyticsPanel';
import axios from 'axios';
import ProfilePanel from './ProfilePanel';
import CalendarPanel from './CalendarPanel';
import { API_URL } from '../api/config';

function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [habits, setHabits] = useState([]);
  // const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      setError('Failed to fetch user info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Fetch habits for milestone modal
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/habits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHabits(res.data);
      } catch (err) {
        // ignore for now
      }
    };
    fetchHabits();
  }, [refresh]);

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
      {/* Floating Leaderboard Button removed until component is available */}
      {/* Top Bar: Profile, Milestones, Logout */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-between items-center px-6 pointer-events-none">
        <button
          className="px-5 py-2 rounded-lg bg-aura text-white font-heading shadow hover:bg-primary transition pointer-events-auto"
          onClick={() => setProfileOpen(true)}
        >
          Profile
        </button>
        <button
          className="p-2 rounded-full bg-primary text-white shadow hover:bg-accent transition transform hover:scale-110 pointer-events-auto"
          onClick={() => setMilestoneModalOpen(true)}
          title="View milestones & goals"
        >
          <span className="inline-block rotate-90">➤</span>
        </button>
        <button
          className="px-5 py-2 rounded-lg bg-red-600 text-white font-heading shadow hover:bg-red-800 transition pointer-events-auto"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
      <MilestoneModal open={milestoneModalOpen} onClose={() => setMilestoneModalOpen(false)} habits={habits} />
      {/* Analytics Tab/Button */}
      <button
        className="fixed top-1/2 right-0 z-40 px-4 py-2 rounded-l-lg bg-primary text-white font-heading shadow-neon hover:bg-accent transition transform -translate-y-1/2"
        onClick={() => setAnalyticsOpen(true)}
      >
        Analytics
      </button>
      {/* Calendar Tab/Button */}
      <button
        className="fixed top-[60%] right-0 z-40 px-4 py-2 rounded-l-lg bg-aura text-white font-heading shadow-neon hover:bg-accent transition transform -translate-y-1/2"
        onClick={() => setCalendarOpen(true)}
      >
        Calendar
      </button>
      {/* Analytics Panel */}
      <AnalyticsPanel open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} user={user} />
      {/* Calendar Panel */}
      <CalendarPanel open={calendarOpen} onClose={() => setCalendarOpen(false)} />
      {/* Leaderboard Panel removed until component is available */}
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
              <div className="text-lg text-center">Welcome, <span className="text-aura font-bold">{user.username || user.name || user.email}</span></div>
              <div className="text-xl text-center">Aura Points: <span className="text-primary font-bold">{user.auraPoints}</span></div>
            </>
          ) : null}
          <div className="w-full flex flex-col items-center justify-center mt-8">
            <h3 className="text-2xl font-heading mb-4 text-text text-center">Your Habits</h3>
            <AddHabitForm onHabitAdded={() => setRefresh(r => r + 1)} onUserUpdate={fetchUser} />
            <HabitList refresh={refresh} onUserUpdate={fetchUser} onHabitsRefresh={() => setRefresh(r => r + 1)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
