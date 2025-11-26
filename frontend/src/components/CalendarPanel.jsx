import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO, differenceInCalendarDays } from 'date-fns';
import TitleText from './TitleText';
import { API_URL } from '../api/config';


const STREAK_MILESTONES = [7, 15, 30, 90];

const CalendarPanel = ({ open, onClose }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHabitId, setSelectedHabitId] = useState('ALL');
  const [checkinDates, setCheckinDates] = useState([]);
  const [habitStreaks, setHabitStreaks] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError('');
      axios.get(`${API_URL}/habits`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(res => {
          setHabits(res.data);
          // Default to first habit if none selected
          if (!selectedHabitId && res.data.length > 0) {
            setSelectedHabitId(res.data[0].id);
          }
        })
        .catch(() => setError('Failed to fetch habits/check-ins'))
        .finally(() => setLoading(false));
    }
  }, [open]);

  // Update checkinDates and streaks when habits or selectedHabitId changes
  useEffect(() => {
    if (!selectedHabitId || habits.length === 0) return;
    if (selectedHabitId === 'ALL') {
      // All habits: merge all checkins
      const allDates = habits.flatMap(habit => (habit.checkins || []).map(c => format(parseISO(c.date), 'yyyy-MM-dd')));
      setCheckinDates(allDates);
      setHabitStreaks({}); // No streaks for all habits
    } else {
      const habit = habits.find(h => h.id === selectedHabitId);
      if (!habit) return;
      const dates = (habit.checkins || []).map(c => format(parseISO(c.date), 'yyyy-MM-dd'));
      setCheckinDates(dates);
      // Calculate streaks
      const sortedDates = dates.map(d => parseISO(d)).sort((a, b) => a - b);
      let streaks = {};
      let currentStreak = 0;
      let lastDate = null;
      sortedDates.forEach(date => {
        if (lastDate && differenceInCalendarDays(date, lastDate) === 1) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
        streaks[format(date, 'yyyy-MM-dd')] = currentStreak;
        lastDate = date;
      });
      setHabitStreaks(streaks);
    }
  }, [habits, selectedHabitId]);

  // Calendar grid logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Build days array for the grid
  const daysArray = [];
  let day = startDate;
  while (day <= endDate) {
    daysArray.push(day);
    day = addDays(day, 1);
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: open ? 0 : '100%' }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full max-w-md bg-surface shadow-2xl z-50 flex flex-col p-8 overflow-y-auto"
      style={{ pointerEvents: open ? 'auto' : 'none' }}
    >
      <button
        className="self-end mb-4 px-3 py-1 rounded bg-red-600 text-white font-heading shadow hover:bg-red-800 transition"
        onClick={onClose}
      >
        Close
      </button>
      <div className="sticky top-0 z-10 bg-surface pb-2">
        <h2 className="text-3xl font-heading text-primary mb-2">Calendar</h2>
        {/* Habit Selector Dropdown */}
        <div className="mb-4">
          <label className="block text-aura font-semibold mb-1">Select Habit:</label>
          <div className="relative">
            <button
              type="button"
              className="w-full px-4 py-2 pr-8 rounded-lg border border-primary/40 bg-background text-primary font-heading text-base shadow focus:outline-none focus:ring-2 focus:ring-primary/40 text-left flex items-center justify-between"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span>
                {selectedHabitId === 'ALL' ? 'All Habits' : (
                  <TitleText text={habits.find(h => h.id === selectedHabitId)?.title || 'Select a habit'} />
                )}
              </span>
              <span className="text-primary">▼</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-primary/40 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                {habits.length === 0 ? (
                  <div className="px-4 py-2 text-gray-500">No habits available</div>
                ) : (
                  <>
                    <button
                      key="ALL"
                      type="button"
                      className={`w-full px-4 py-2 text-left hover:bg-primary/10 focus:bg-primary/10 focus:outline-none text-primary ${selectedHabitId === 'ALL' ? 'font-bold bg-primary/10' : ''}`}
                      onClick={() => {
                        setSelectedHabitId('ALL');
                        setDropdownOpen(false);
                      }}
                    >
                      All Habits
                    </button>
                    {habits.map(habit => (
                      <button
                        key={habit.id}
                        type="button"
                        className={`w-full px-4 py-2 text-left hover:bg-primary/10 focus:bg-primary/10 focus:outline-none text-primary ${selectedHabitId === habit.id ? 'font-bold bg-primary/10' : ''}`}
                        onClick={() => {
                          setSelectedHabitId(habit.id);
                          setDropdownOpen(false);
                        }}
                      >
                        <TitleText text={habit.title} />
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <button
            className="px-2 py-1 rounded bg-background text-primary border border-primary hover:bg-primary hover:text-white transition"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            {'<'}
          </button>
          <span className="text-xl font-heading text-aura">{format(currentMonth, 'MMMM yyyy')}</span>
          <button
            className="px-2 py-1 rounded bg-background text-primary border border-primary hover:bg-primary hover:text-white transition"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            {'>'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-aura font-bold py-1">{d}</div>
        ))}
        {loading ? (
          <div className="col-span-7 text-aura">Loading...</div>
        ) : error ? (
          <div className="col-span-7 text-red-400">{error}</div>
        ) : (
          daysArray.map(day => {
            const formattedDate = format(day, 'yyyy-MM-dd');
            const isCheckin = checkinDates.includes(formattedDate);
            const streak = habitStreaks[formattedDate] || 0;
            const isToday = isSameDay(day, new Date());
            const isMilestone = STREAK_MILESTONES.includes(streak);
            return (
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer transition
                  ${!isSameMonth(day, monthStart) ? 'text-gray-500/40' : 'text-text'}
                  ${isCheckin && isMilestone ? 'bg-gradient-to-br from-purple-400 to-yellow-300 text-white font-bold shadow-neon ring-2 ring-gold-400' :
                    isCheckin && streak > 1 ? 'bg-orange-400/80 text-white font-bold shadow-neon' :
                    isCheckin ? 'bg-green-500/80 text-white font-bold shadow-neon' : ''}
                  ${isToday ? 'border-2 border-aura' : ''}
                `}
                key={formattedDate}
              >
                {format(day, 'd')}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default CalendarPanel; 
