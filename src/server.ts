import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { seedDatabase } from './seed/seed';

async function bootstrap() {
  await connectDB();

  if (env.seedOnStart) {
    await seedDatabase();
  }

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`ArtisanVault API listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
