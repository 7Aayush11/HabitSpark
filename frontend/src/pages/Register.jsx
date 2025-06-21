import { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import toast from 'react-hot-toast';


export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/register', form);
      toast.success('Registration successful. Please log in.');
      navigate('/');
    } catch (err) {
      toast.error('Registration failed');
    }
  };

  return (
    <>
    <TopNav />
    <div className="min-h-screen flex items-center justify-center bg-dark text-white px-4">
      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-aura">Create Your Account</h2>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Username</label>
          <input name="username" required className="input" onChange={handleChange} />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Email</label>
          <input name="email" type="email" required className="input" onChange={handleChange} />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm">Password</label>
          <input name="password" type="password" required className="input" onChange={handleChange} />
        </div>

        <button type="submit" className="w-full bg-aura hover:bg-purple-600 text-white font-semibold py-2 rounded transition">
          Register
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account? <a href="/" className="text-aura hover:underline">Login</a>
        </p>
      </form>
    </div>
    </>
  );
}
