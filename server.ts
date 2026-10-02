import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { getDb } from './src/server/db/client.js';
import { authRouter } from './src/server/routes/auth.routes.js';
import { usersRouter } from './src/server/routes/users.routes.js';
import { adminRouter } from './src/server/routes/admin.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser());

  // Database initialization
  try {
    await getDb();
    console.log('[TaskHop DB] PostgreSQL database initialized and seeded successfully.');
  } catch (err) {
    console.error('[TaskHop DB] Failed to initialize database:', err);
  }

  // API Endpoints
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'TaskHop Hyperlocal Marketplace API',
      timestamp: new Date().toISOString(),
      platform: 'PostgreSQL-powered',
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/admin', adminRouter);

  // Serve static generated assets if any
  app.use('/src/assets', express.static(path.resolve(__dirname, 'src/assets')));

  if (!isProd) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TaskHop Server] Running on http://0.0.0.0:${PORT} (ENV: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
