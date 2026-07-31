import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(uri = env.mongoUri): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  return mongoose;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
