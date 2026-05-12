import app from './app.js';

const PORT = process.env.PORT || {{PORT}};

app.listen(PORT, () => {
  console.log(`🚀 Minimal JS Server running successfully on port ${PORT}`);
});