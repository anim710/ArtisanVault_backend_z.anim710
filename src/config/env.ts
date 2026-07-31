import dotenv from 'dotenv';

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/artisanvault'),
  jwtSecret: required('JWT_SECRET', 'dev-only-change-me-artisanvault-secret'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  seedOnStart: (process.env.SEED_ON_START ?? 'false').toLowerCase() === 'true',
  isTest: process.env.NODE_ENV === 'test',
};
