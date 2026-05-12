import express, { Express, Request, Response, NextFunction } from 'express';
import pinoHttp from 'pino-http';
import { logger } from './config/logger.js';
import { AppError } from './utils/AppError.js';

const app: Express = express();

// Enable structured, high-performance JSON request logging
app.use(pinoHttp({ logger }));

// Parse incoming JSON payloads
app.use(express.json());

// Base framework health verification route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Advanced TypeScript API infrastructure operating optimally.',
  });
});

// ==========================================
// DYNAMIC MODULE ROUTE MOUNTS INJECTED HERE
// ==========================================

// Catch-all unmapped route handler
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Resource not found: ${req.method} ${req.originalUrl}`, 404));
});

// Centralized operational error interceptor
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  req.log.error({ err }, 'Operational exception intercepted');
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.isOperational ? err.message : 'Internal Server Error',
  });
});

export default app;