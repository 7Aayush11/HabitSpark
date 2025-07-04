import { useState } from 'react';

const HabitItem = ({ habit, onDelete, onEdit, onCheckin }) => {
  return (
    <div className="bg-surface/80 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between shadow gap-2">
      <div className="flex items-center gap-3">
        <div className="text-lg font-heading text-primary flex items-center gap-2">
          {habit.title}
          <span className="flex items-center ml-2">
            <span className="text-2xl">🔥</span>
            <span className="ml-1 text-aura font-bold">{habit.streak || 0}</span>
          </span>
        </div>
        <div className="text-sm text-aura ml-2">{habit.frequency}</div>
      </div>
      <div className="flex gap-2 mt-2 md:mt-0">
        <button
          className="px-3 py-1 rounded bg-green-600 text-white font-heading shadow hover:bg-green-700 transition"
          onClick={() => onCheckin(habit)}
        >
          Check-in
        </button>
        <button
          className="px-3 py-1 rounded bg-accent text-white font-heading shadow hover:bg-primary transition"
          onClick={() => onEdit(habit)}
        >
          Edit
        </button>
        <button
          className="px-3 py-1 rounded bg-red-600 text-white font-heading shadow hover:bg-red-800 transition"
          onClick={() => onDelete(habit)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default HabitItem; 