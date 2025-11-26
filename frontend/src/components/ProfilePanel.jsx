import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../api/config';

const quotes = [
  "Level up your life, one habit at a time!",
  "Consistency is your greatest power.",
  "Small steps every day lead to big changes.",
  "You are the protagonist of your own story.",
  "Aura grows with every check-in!",
];
function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

const confettiColors = ['#facc15', '#a21caf', '#38bdf8', '#f472b6', '#34d399', '#f87171'];
function ConfettiBurst({ show }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: confettiColors[i % confettiColors.length],
            opacity: 0.8,
            transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg) scale(${0.7 + Math.random() * 0.6})`,
            animation: `confetti-fall 1.2s cubic-bezier(.62,.01,.5,1.01) forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(80vh) scale(0.7); }
        }
      `}</style>
    </div>
  );
}

const ProfilePanel = ({ open, onClose, user, onProfileUpdate }) => {
  const [form, setForm] = useState({ age: '', height: '', weight: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const prevLevel = useRef(user?.userLevel || 1);

  useEffect(() => {
    if (user) {
      setForm({
        age: user.age ?? '',
        height: user.height ?? '',
        weight: user.weight ?? '',
        location: user.location || '',
      });
      setSuccess('');
      setError('');
      // Level-up animation
      if (open && user.userLevel && user.userLevel > prevLevel.current) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }
      prevLevel.current = user.userLevel || 1;
    }
  }, [user, open]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`${API_URL}/user/me`, {
        age: form.age !== '' ? parseInt(form.age) : null,
        height: form.height !== '' ? parseInt(form.height) : null,
        weight: form.weight !== '' ? parseInt(form.weight) : null,
        location: form.location,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Profile updated!');
      if (onProfileUpdate) {
        // Merge to preserve any additional fields the UI relies on
        onProfileUpdate(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: open ? 0 : '-100%' }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 h-full w-full max-w-md bg-surface shadow-2xl z-50 flex flex-col p-8 overflow-y-auto"
      style={{ pointerEvents: open ? 'auto' : 'none' }}
    >
      <ConfettiBurst show={showConfetti} />
      <button
        className="self-end mb-4 px-3 py-1 rounded bg-red-600 text-white font-heading shadow hover:bg-red-800 transition"
        onClick={onClose}
      >
        Close
      </button>
      <h2 className="text-3xl font-heading text-primary mb-6">Profile</h2>
      {user && (
        <>
          {/* Level, Title, Progress */}
          <div className="flex flex-col items-center mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-yellow-400">Lvl {user.userLevel}</span>
              <span className="text-lg font-heading text-aura">{user.title}</span>
            </div>
            <div className="w-full max-w-[280px] h-3 bg-gray-800 rounded-full mb-1 ring-2 ring-primary/30">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-primary shadow-neon transition-all duration-500"
                style={{ width: `${user.levelProgress || 0}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400">{user.levelProgress || 0}% to next level</div>
          </div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-aura flex items-center justify-center text-4xl text-white font-heading shadow-neon mb-2 mx-auto">
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-lg font-heading text-primary text-center mb-2">{user.username}</div>
          <div className="text-md text-aura text-center mb-2">Aura Points: <span className="font-bold">{user.auraPoints}</span></div>
          <div className="text-xs text-gray-400 text-center mb-4 opacity-70">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
          {/* Achievements */}
          {user.achievements && user.achievements.length > 0 && (
            <div className="mb-4">
              <div className="text-center text-aura font-heading mb-1">Achievements</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {user.achievements.map((ach, i) => (
                  <div key={i} className="flex flex-col items-center bg-background px-2 py-1 rounded shadow text-xs">
                    <span className="text-xl">{ach.icon}</span>
                    <span>{ach.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
            <input
              type="number"
              name="age"
              placeholder="Age"
              className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.age}
              onChange={handleChange}
              min="0"
            />
            <input
              type="number"
              name="height"
              placeholder="Height (cm)"
              className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.height || ''}
              onChange={handleChange}
              min="0"
            />
            <input
              type="number"
              name="weight"
              placeholder="Weight (kg)"
              className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.weight || ''}
              onChange={handleChange}
              min="0"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.location}
              onChange={handleChange}
            />
            <button
              type="submit"
              className="mt-2 px-6 py-2 rounded bg-primary text-white font-heading shadow-neon hover:bg-accent transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            {success && <div className="text-green-400 text-sm mt-1">{success}</div>}
            {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
          </form>
          {/* Character Stats */}
          {user.characterStats && (
            <div className="mb-4">
              <div className="text-center text-aura font-heading mb-1">Character Stats</div>
              <div className="flex flex-wrap gap-3 justify-center">
                {Object.entries(user.characterStats).map(([stat, value]) => (
                  <div key={stat} className="flex flex-col items-center bg-background px-3 py-2 rounded shadow text-xs">
                    <span className="font-bold text-lg text-primary">{value}</span>
                    <span className="text-aura">{stat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="italic text-center text-text mt-2">“{getRandomQuote()}”</div>
        </>
      )}
    </motion.div>
  );
};

export default ProfilePanel;
