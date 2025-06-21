import { useState } from 'react';
import axios from '../api/axios';
import TopNav from '../components/TopNav';


export default function SuggestHabit() {
  const [form, setForm] = useState({ habit_name: '', description: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/suggestions', form);
      setSubmitted(true);
    } catch (err) {
      alert('Submission failed');
    }
  };

  if (submitted) {
    return <p>✅ Suggestion submitted! Thank you.</p>;
  }

  return (
    <>
    <TopNav />
    <form onSubmit={handleSubmit}>
        <input name="habit_name" placeholder="Habit name" onChange={handleChange} required />
        <textarea name="description" placeholder="Why this habit?" onChange={handleChange} />
      <button type="submit">Submit Suggestion</button>
    </form>
    </>
  );
}