import { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import toast from 'react-hot-toast';


export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', form);
      localStorage.setItem('access_token', res.data.access_token);
      navigate('/dashboard');
      toast.success('Log in succesfully')
    } catch (err) {
      toast.error('Login failed');
    }
  };

  return (
    <>
    <TopNav />
    <div className="min-h-screen flex items-center justify-center bg-dark text-white px-4">
      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-aura">Login to HabitSpark</h2>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Username</label>
          <input
            name="username"
            type="text"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-dark border border-gray-700 focus:outline-none focus:ring-2 focus:ring-aura"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm">Password</label>
          <input
            name="password"
            type="password"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-dark border border-gray-700 focus:outline-none focus:ring-2 focus:ring-aura"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-aura hover:bg-purple-600 text-white font-semibold py-2 rounded transition"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          Don’t have an account? <a href="/register" className="text-aura hover:underline">Register</a>
        </p>
      </form>
    </div>
    </>
  );
}