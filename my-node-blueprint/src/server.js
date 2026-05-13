import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Minimal JS Server running successfully on port ${PORT}`);
});