// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import axios from '../api/axios';
import AppLayout from '../components/layouts/AppLayout';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', formData);
      localStorage.setItem('token', res.data.access_token);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="bg-black/40 border border-purple-700 p-8 rounded-xl shadow-lg backdrop-blur-lg max-w-sm w-full text-purple-100"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-300 glow">Welcome Back</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded bg-black/60 border border-purple-500 text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-700"
            />
          </div>

          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded bg-black/60 border border-purple-500 text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 rounded transition shadow-lg"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </motion.div>
    </motion.div>
    </AppLayout>
  );
}