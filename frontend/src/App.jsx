import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import './App.css'
import Landing from './components/Landing'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import Dashboard from './components/Dashboard'
import Background from './components/Background'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'
import SpeedInsights from "@vercel/speed-insights/react"
import Analytics from "@vercel/analytics/react"

// API base URL is configured via `VITE_API_URL` in `src/api/config`

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
      <Footer linkedinUrl={"https://www.linkedin.com/in/aayush-nisar-b71715184"} />
    </>
  )
}

export default App
