/**
 * Centralized registry mapping strictly vetted production and development
 * package versions to prevent version drift across generator modules.
 */
export const DEPENDENCIES = {
  // Core HTTP & Framework
  express: '^4.21.0',
  cors: '^2.8.5',
  helmet: '^8.0.0',
  
  // Database & Persistence Drivers
  mongoose: '^8.10.0',
  '@prisma/client': '^6.0.0',
  
  // Security & Identity Utilities
  bcrypt: '^5.1.1',
  jsonwebtoken: '^9.0.2',
  
  // Advanced Integration Tools
  ioredis: '^5.4.1',
  bullmq: '^5.21.0',
  '@aws-sdk/client-s3': '^3.650.0',
  n8n: '^1.55.0',
  socket_io: '^4.8.0', // Mapped as socket.io in package.json strings
  
  // Logging Engine
  pino: '^9.4.0',
  'pino-http': '^10.3.0',
  'pino-pretty': '^11.2.2',
};

export const DEV_DEPENDENCIES = {
  // Types & Runtime Execution
  typescript: '^5.6.2',
  tsx: '^4.19.1',
  prisma: '^6.0.0',
  
  // Automated Integrated Testing Suites
  jest: '^29.7.0',
  'ts-jest': '^29.2.5',
  supertest: '^7.0.0',
  
  // Typing Contexts
  '@types/express': '^4.17.21',
  '@types/node': '^22.5.5',
  '@types/cors': '^2.8.17',
  '@types/bcrypt': '^5.0.2',
  '@types/jsonwebtoken': '^9.0.7',
  '@types/jest': '^29.5.13',
  '@types/supertest': '^6.0.2',
};