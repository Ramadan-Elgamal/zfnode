import express, { Express, Request, Response, NextFunction } from 'express';

const app: Express = express();

app.use(express.json());

// Baseline verification endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Minimal TypeScript API infrastructure operating normally.',
  });
});

// Global 404 safety net
app.all('*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.method} ${req.originalUrl} on this server.`,
  });
});

// Standard global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🚨 [Error Catch]:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

export default app;