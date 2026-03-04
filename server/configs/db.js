import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

let connectionPromise = null;

const connectDb = async () => {
  const mongoBaseUrl = process.env.MONGODB_URL?.trim();

  if (!mongoBaseUrl || !/^mongodb(\+srv)?:\/\//.test(mongoBaseUrl)) {
    console.error('Invalid MONGODB_URL. Set it in Vercel Project Settings > Environment Variables.');
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (connectionPromise) {
    try {
      await connectionPromise;
      return mongoose.connection.readyState === 1;
    } catch {
      connectionPromise = null;
      return false;
    }
  }

  try {
    connectionPromise = mongoose.connect(mongoBaseUrl, {
      dbName: 'potato',
      serverSelectionTimeoutMS: 10000,
    });
    await connectionPromise;
    mongoose.connection.on('connected', () => console.log('Database connected'));
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    connectionPromise = null;
    return false;
  }
};

export default connectDb;
