import { useEffect, useState } from 'react';
import axios from 'axios';
import HabitItem from './HabitItem';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:4000/api';

const HabitList = ({ refresh }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingHabit, setEditingHabit] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editFrequency, setEditFrequency] = useState('Daily');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const fetchHabits = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/habits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHabits(res.data);
      } catch (err) {
        setError('Failed to fetch habits');
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, [refresh]);

  const handleDelete = async (habit) => {
    if (!window.confirm(`Delete habit "${habit.title}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/habits/${habit.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(habits.filter(h => h.id !== habit.id));
      toast.success(`Deleted habit "${habit.title}"`);
    } catch (err) {
      toast.error('Failed to delete habit');
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setEditTitle(habit.title);
    setEditFrequency(habit.frequency);
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/habits/${editingHabit.id}`, {
        title: editTitle.trim(),
        frequency: editFrequency.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(habits.map(h => h.id === editingHabit.id ? { ...h, title: editTitle, frequency: editFrequency } : h));
      setEditingHabit(null);
      toast.success('Habit updated!');
    } catch (err) {
      setEditError('Failed to update habit');
      toast.error('Failed to update habit');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCheckin = async (habit) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/habits/${habit.id}/checkin`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(habits.map(h => h.id === habit.id ? { ...h, streak: res.data.streak } : h));
      toast.success(`Checked in for "${habit.title}"! 🔥`);
    } catch (err) {
      if (err.response?.data?.error === 'Already checked in today') {
        toast.error(`Already checked in today for "${habit.title}"`);
      } else {
        toast.error('Failed to check in');
      }
    }
  };

  if (loading) return <div className="text-aura">Loading habits...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (habits.length === 0) return <div className="text-text">No habits yet. Add your first habit!</div>;

  return (
    <>
      <div className="flex flex-col gap-4 w-full max-w-md">
        {habits.map(habit => (
          <HabitItem
            key={habit.id}
            habit={habit}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onCheckin={handleCheckin}
          />
        ))}
      </div>
      {/* Edit Modal */}
      {editingHabit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form onSubmit={handleEditSubmit} className="bg-surface p-6 rounded-xl shadow-lg flex flex-col gap-4 min-w-[300px]">
            <h3 className="text-xl font-heading text-primary mb-2">Edit Habit</h3>
            <input
              type="text"
              className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              required
            />
            <select
              className="px-4 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              value={editFrequency}
              onChange={e => setEditFrequency(e.target.value)}
              required
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            {editError && <div className="text-red-400 text-sm">{editError}</div>}
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 rounded bg-gray-500 text-white" onClick={() => setEditingHabit(null)}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-primary text-white font-heading shadow-neon hover:bg-accent transition" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default HabitList; 