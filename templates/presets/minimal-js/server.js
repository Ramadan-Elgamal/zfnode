import app from './app.js';

// The port value will be dynamically injected by our Phase 4 generator engine
const PORT = process.env.PORT || {{PORT}};

app.listen(PORT, () => {
  console.log(`🚀 Minimal JS Server running successfully on port ${PORT}`);
});