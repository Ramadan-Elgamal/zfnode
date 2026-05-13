import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('🏛️ Prisma SQL Engine Connected Successfully.');
  } catch (error) {
    console.error('🚨 Prisma client connection initialization failed:', error);
    process.exit(1);
  }
};