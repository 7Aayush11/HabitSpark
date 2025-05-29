import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HabitList from './pages/HabitList';
import HabitForm from './pages/HabitForm';

// Import components
import NavigationBar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Import styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner message="Authenticating..." />;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <NavigationBar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/habits" element={
          <ProtectedRoute>
            <HabitList />
          </ProtectedRoute>
        } />
        <Route path="/habits/new" element={
          <ProtectedRoute>
            <HabitForm />
          </ProtectedRoute>
        } />
        <Route path="/habits/:id/edit" element={
          <ProtectedRoute>
            <HabitForm />
          </ProtectedRoute>
        } />
        
        {/* Redirect root based on authentication status */}
        <Route path="/" element={
          currentUser ? <Navigate to="/dashboard" /> : <Home />
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
