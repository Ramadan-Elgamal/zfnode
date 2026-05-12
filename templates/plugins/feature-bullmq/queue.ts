import { Queue, Worker } from 'bullmq';
import { redisClient } from './redis';

export const emailQueue = new Queue('email-queue', { connection: redisClient });

// Sample Worker stub
export const emailWorker = new Worker(
  'email-queue',
  async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
  },
  { connection: redisClient }
);