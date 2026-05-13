import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connectionString = process.env.DATABASE_URL || '';
    if (!connectionString) {
      console.warn('⚠️ MongoDB connection skipped: DATABASE_URL is missing.');
      return;
    }

    const conn = await mongoose.connect(connectionString, {
      autoIndex: true,
      maxPoolSize: 10,
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('🚨 MongoDB critical connection error:', error);
    process.exit(1);
  }
};