import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SuggestHabit from './pages/Suggestions';
import CheckIn from './pages/Checkin';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/suggest" element={<SuggestHabit />} />
        <Route path="/checkin" element={<CheckIn />} />
      </Routes>
    </Router>
  );
}
