require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const checklistRoutes = require('./routes/checklists');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CLIENT_URL is set in production (e.g. the Netlify URL); falls back to allowing
// all origins locally / when unset. With the Netlify /api proxy this is also
// belt-and-suspenders since requests arrive same-origin.
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json());

// Routes
app.use('/api/checklists', checklistRoutes);

// Error handling
app.use(errorHandler);

// Start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
      const mongoose = require('mongoose');
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
});
