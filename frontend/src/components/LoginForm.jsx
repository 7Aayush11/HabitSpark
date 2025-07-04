import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const LoginForm = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      setSuccess('Logged in successfully!');
      setError('');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center bg-background text-text"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h2 className="text-4xl font-heading mb-4">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-xs bg-surface p-8 rounded-xl shadow-lg">
        <input
          type="email"
          placeholder="Email"
          className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <motion.button
          type="submit"
          className="mt-2 px-6 py-2 rounded bg-primary text-white font-heading shadow-neon hover:bg-accent transition disabled:opacity-60"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </motion.button>
        <AnimatePresence>
          {error && (
            <motion.div className="text-red-400 text-sm mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{error}</motion.div>
          )}
          {success && (
            <motion.div className="text-green-400 text-sm mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{success}</motion.div>
          )}
        </AnimatePresence>
      </form>
      <button className="text-primary underline mt-6" onClick={() => onBack()}>Back to Landing</button>
    </motion.div>
  );
};

export default LoginForm; 