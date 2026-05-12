import app from './app.js';

const PORT: number = Number(process.env.PORT) || {{PORT}};

app.listen(PORT, () => {
  console.log(`🚀 Minimal TypeScript Server running successfully on port ${PORT}`);
});