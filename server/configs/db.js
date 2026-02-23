import mongoose from 'mongoose';

const connectDb = async () => {
  try {
    mongoose.connection.on('connected', () => console.log('Database connected'));
    await mongoose.connect(`${process.env.MONGODB_URL}/potato`);
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export default connectDb;
