import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db/store.js';
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

initDb();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (process.env.CLIENT_ORIGIN && origin === process.env.CLIENT_ORIGIN) return cb(null, true);
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, store: 'json' }));
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

app.listen(PORT, () => console.log(`API http://localhost:${PORT} (JSON db)`));
