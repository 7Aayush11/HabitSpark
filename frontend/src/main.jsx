import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster position="top-center" toastOptions={{
      className: 'bg-card text-white shadow-lg border border-gray-700',
      success: { style: { borderColor: '#6f00ff', color: '#000000' } },
    }} />
  </StrictMode>,
)
