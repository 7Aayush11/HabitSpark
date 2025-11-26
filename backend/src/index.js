import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import habitRoutes from './routes/habit.routes.js';
import userRoute from './routes/user.js';
import supportRoutes from './routes/support.routes.js';

dotenv.config();
const app = express();
// Security: Helmet headers
app.use(helmet());
// Security: CORS restricted to whitelist of allowed origins
const allowedOrigins = [];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}
// Local dev origins
allowedOrigins.push('http://localhost:5173');
allowedOrigins.push('http://localhost:3000');

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
// Security: limit JSON body size
app.use(express.json({ limit: '1mb' }));

// Security: rate limit for auth routes
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/user', userRoute);
app.use('/api/support', supportRoutes);


app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
