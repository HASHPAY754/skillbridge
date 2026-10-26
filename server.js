require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB (with intelligent fallback to in-memory DB if no local daemon is running)
connectDB()
  .then(() => {
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 SkillBridge Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 Listening at: http://localhost:${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`===============================================`);
    });

    // Graceful shutdown handling
    process.on('SIGINT', () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    });

    process.on('unhandledRejection', (err) => {
      console.error(`[Server] Unhandled Rejection: ${err.message}`);
    });
  })
  .catch((err) => {
    console.error('[Server] Fatal Database Connection Failure:', err.message);
    process.exit(1);
  });
