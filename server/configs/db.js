import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const connectDb = async () => {
  const mongoBaseUrl = process.env.MONGODB_URL?.trim();

  if (!mongoBaseUrl || !/^mongodb(\+srv)?:\/\//.test(mongoBaseUrl)) {
    throw new Error('Invalid MONGODB_URL in ../.env. It must start with mongodb:// or mongodb+srv://');
  }

  try {
    mongoose.connection.on('connected', () => console.log('Database connected'));
    await mongoose.connect(mongoBaseUrl, {
      dbName: 'potato',
      serverSelectionTimeoutMS: 10000,
    });
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

export default connectDb;
