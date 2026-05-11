import express from 'express';

const app = express();

app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Minimal JS API is running normally.' });
});

// Global 404 safety net
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.method} ${req.originalUrl} on this server.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 [Error Catch]:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

export default app;