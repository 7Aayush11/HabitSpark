import { motion } from 'framer-motion'
import TopNav from '../TopNav'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-darkBg text-white bg-grid-pattern relative overflow-hidden">
      {/* Dungeon Gate Overlay */}
      <div className="absolute inset-0 z-0 bg-dungeon-gate opacity-10 bg-cover bg-center mix-blend-soft-light"></div>

      {/* Animated Aura Particles (optional enhancement) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full animate-pulseAura"></div>
      </div>

      <div className="relative z-10">
        <TopNav />

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-5xl mx-auto p-4"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}