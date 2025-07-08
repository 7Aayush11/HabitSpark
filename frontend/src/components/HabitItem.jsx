import { useState } from 'react';

// Category color mapping
const getCategoryColor = (category) => {
  const colors = {
    'General': 'bg-gray-500 text-gray-100',
    'Health': 'bg-green-500/20 text-green-300 border border-green-500/30',
    'Fitness': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    'Learning': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    'Productivity': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    'Mindfulness': 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
    'Social': 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    'Creative': 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    'Financial': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    'Career': 'bg-red-500/20 text-red-300 border border-red-500/30'
  };
  return colors[category] || colors['General'];
};

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
        <div className="flex flex-col gap-1">
          <div className="text-sm text-aura">{habit.frequency}</div>
          <div className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(habit.category || 'General')}`}>
            {habit.category || 'General'}
          </div>
          {habit.goalProgress && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    habit.goalProgress.achieved ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(habit.goalProgress.current, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">
                {habit.goalProgress.current}% / {habit.goalProgress.target}%
              </span>
            </div>
          )}
        </div>
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