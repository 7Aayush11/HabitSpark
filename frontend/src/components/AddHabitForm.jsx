import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const AddHabitForm = ({ onHabitAdded }) => {
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/habits`, { title: title.trim(), frequency: frequency.trim() }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Habit added!');
      setTitle('');
      setFrequency('Daily');
      if (onHabitAdded) onHabitAdded();
    } catch (err) {
      console.log('Add habit error:', err, err.response);
      setError(err.response?.data?.error || err.message || 'Failed to add habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-surface/80 p-4 rounded-lg shadow w-full max-w-md mb-6">
      <input
        type="text"
        placeholder="Habit Title"
        className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <select
        className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
        value={frequency}
        onChange={e => setFrequency(e.target.value)}
        required
      >
        <option value="Daily">Daily</option>
        <option value="Weekly">Weekly</option>
        <option value="Monthly">Monthly</option>
      </select>
      <button
        type="submit"
        className="mt-2 px-6 py-2 rounded bg-primary text-white font-heading shadow-neon hover:bg-accent transition disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Habit'}
      </button>
      {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
      {success && <div className="text-green-400 text-sm mt-1">{success}</div>}
    </form>
  );
};

export default AddHabitForm; 