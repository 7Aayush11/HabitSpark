import { motion } from 'framer-motion';

const Landing = ({ onNavigate }) => (
  <motion.div
    className="min-h-screen flex flex-col items-center justify-center text-text relative overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
      <motion.h1
        className="text-5xl md:text-7xl font-heading mb-6 drop-shadow-[0_0_20px_#3b82f6]"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        HabitSpark
      </motion.h1>
      <motion.p
        className="text-xl md:text-2xl mb-10 text-aura max-w-xl text-center"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Level up your life. Track habits. Earn aura points. Made with <span className="text-accent font-bold">❤️</span>.
      </motion.p>
      <div className="flex gap-6">
        <motion.button
          className="px-8 py-3 rounded-lg bg-primary text-white font-heading text-lg shadow-neon hover:bg-accent transition"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('login')}
        >
          Login
        </motion.button>
        <motion.button
          className="px-8 py-3 rounded-lg bg-aura text-white font-heading text-lg shadow-aura hover:bg-accent transition"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('register')}
        >
          Register
        </motion.button>
      </div>
    {/* </div> */}
    {/* Anime-inspired glowing background effect */}
    <motion.div
      className="absolute -z-10 top-0 left-0 w-full h-full pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute w-[600px] h-[600px] bg-primary/30 blur-3xl rounded-full left-[-200px] top-[-200px] animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-aura/30 blur-2xl rounded-full right-[-100px] bottom-[-100px] animate-pulse" />
      <div className="absolute w-[300px] h-[300px] bg-accent/30 blur-2xl rounded-full left-[50%] top-[60%] animate-pulse" />
    </motion.div>
  </motion.div>
);

export default Landing; 