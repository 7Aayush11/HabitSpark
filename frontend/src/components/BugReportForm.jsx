import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const BugReportForm = ({ open, onClose }) => {
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('medium');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/support/report`, {
        description,
        severity: level,
        contact,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Thanks! Your bug report has been submitted.');
      setDescription('');
      setLevel('medium');
      setContact('');
    } catch (err) {
      setError('Failed to submit bug report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative bg-surface rounded-xl shadow-neon p-6 w-full max-w-xl mx-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-xl font-heading text-primary">Report a Bug</div>
          <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-800" onClick={onClose}>Close</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            className="px-3 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Describe the issue"
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <div className="flex items-center gap-3">
            <label className="text-sm text-aura">Level</label>
            <select
              className="px-3 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              value={level}
              onChange={e => setLevel(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <input
            type="email"
            className="px-3 py-2 rounded bg-background text-text border border-shadow focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Contact email (optional)"
            value={contact}
            onChange={e => setContact(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button type="submit" className="px-5 py-2 rounded bg-primary text-white font-heading shadow-neon hover:bg-accent transition" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit' }
            </button>
            {success && <span className="text-green-400 text-sm">{success}</span>}
            {error && <span className="text-red-400 text-sm">{error}</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BugReportForm;
