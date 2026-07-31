import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import craftRoutes from './routes/craft.routes';
import reviewRoutes from './routes/review.routes';
import statsRoutes from './routes/stats.routes';

export function createApp() {
  const app = express();
//  console.log('Client URL:', env.clientUrl);
  app.use(helmet());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  if (!env.isTest) {
    app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  }

  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        service: 'ArtisanVault API',
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/crafts', craftRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/stats', statsRoutes);

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  app.use(errorHandler);

  return app;
}
