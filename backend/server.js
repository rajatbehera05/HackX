import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectRoutes from './routes/projectRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { isSupabaseConfigured } from './utils/supabaseClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, Postman, health monitors, or same-origin)
    if (!origin) return callback(null, true);
    const normalizedFrontend = FRONTEND_URL.replace(/\/$/, '');
    const normalizedOrigin = origin.replace(/\/$/, '');

    if (
      normalizedOrigin.startsWith('http://localhost:') ||
      normalizedOrigin.startsWith('http://127.0.0.1:') ||
      normalizedOrigin === normalizedFrontend ||
      normalizedOrigin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV === 'production') {
      return callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Healthcheck
app.get('/api/health', (req, res) => {
  const supabaseActive = isSupabaseConfigured();
  const geminiActive = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: geminiActive,
    supabaseConfigured: supabaseActive,
    storageMode: supabaseActive ? 'supabase_postgresql' : 'dev_memory_store',
    storageWarning: supabaseActive
      ? null
      : 'Running in ephemeral in-memory dev mode. Data is lost on server restart.',
  });
});

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);

// Centralized Error Handling
app.use(errorHandler);

const isMainModule = process.argv[1] && /server(\.js)?$/i.test(process.argv[1]);

if (isMainModule && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 [HackX Server] Running at http://localhost:${PORT}`);
    console.log(`📡 [HackX Health] Check status at http://localhost:${PORT}/api/health`);
  });
}

export default app;
