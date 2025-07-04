import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'
import Landing from './components/Landing'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import Dashboard from './components/Dashboard'
import Background from './components/Background'
import { Toaster } from 'react-hot-toast'

const API_URL = 'http://localhost:4000/api' // Adjust port if needed

function App() {
  const [page, setPage] = useState(() => {
    const token = localStorage.getItem('token')
    return token ? 'dashboard' : 'landing'
  })

  // Handle redirect after login/register
  const handleAuthSuccess = () => setPage('dashboard')
  const handleLogout = () => {
    localStorage.removeItem('token')
    setPage('landing')
  }

  return (
    <>
      <Toaster position="top-center" />
      <Background />
      <AnimatePresence mode="wait">
        {page === 'landing' && <Landing key="landing" onNavigate={setPage} />}
        {page === 'login' && <LoginForm key="login" onBack={() => setPage('landing')} onSuccess={handleAuthSuccess} />}
        {page === 'register' && <RegisterForm key="register" onBack={() => setPage('landing')} onSuccess={handleAuthSuccess} />}
        {page === 'dashboard' && <Dashboard key="dashboard" onLogout={handleLogout} />}
      </AnimatePresence>
    </>
  )
}

export default App
