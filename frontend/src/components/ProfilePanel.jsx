import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

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

const ProfilePanel = ({ open, onClose, user, onProfileUpdate }) => {
  const [form, setForm] = useState({ name: '', age: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        age: user.age || '',
        location: user.location || '',
      });
      setSuccess('');
      setError('');
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
        name: form.name,
        age: form.age ? parseInt(form.age) : null,
        location: form.location,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Profile updated!');
      if (onProfileUpdate) onProfileUpdate(res.data);
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
      <button
        className="self-end mb-4 px-3 py-1 rounded bg-red-600 text-white font-heading shadow hover:bg-red-800 transition"
        onClick={onClose}
      >
        Close
      </button>
      <h2 className="text-3xl font-heading text-primary mb-6">Profile</h2>
      {user && (
        <>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-aura flex items-center justify-center text-4xl text-white font-heading shadow-neon mb-2 mx-auto">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-lg font-heading text-primary text-center mb-2">{user.email}</div>
          <div className="text-md text-aura text-center mb-2">Aura Points: <span className="font-bold">{user.auraPoints}</span></div>
          <div className="text-xs text-gray-400 text-center mb-4 opacity-70">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.name}
              onChange={handleChange}
            />
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
          <div className="italic text-center text-text mt-2">“{getRandomQuote()}”</div>
        </>
      )}
    </motion.div>
  );
};

export default ProfilePanel; 