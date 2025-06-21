import { Link, useNavigate } from 'react-router-dom';

export default function TopNav() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <nav className="bg-card text-text shadow-md px-6 py-4 flex justify-between items-center">
      {/* Logo / Title */}
      <Link to="/dashboard" className="text-aura font-bold text-2xl hover:opacity-90">
        HabitSpark
      </Link>

      {/* Right-side Links */}
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/suggest" className="hover:text-aura transition">Suggest Habit</Link>
        <button
          onClick={handleLogout}
          className="bg-aura px-4 py-1 rounded text-white hover:bg-purple-700 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
