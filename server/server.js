require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const checklistRoutes = require('./routes/checklists');
const { seedDatabase } = require('./seed');

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

// On-demand reset to the default demo data. Public by default; if RESET_SECRET
// is set, require a matching `x-reset-secret` header (so only you can trigger it).
app.post('/api/reset', async (req, res, next) => {
  try {
    const secret = process.env.RESET_SECRET;
    if (secret && req.get('x-reset-secret') !== secret) {
      return res.status(403).json({ error: 'Reset is restricted.' });
    }
    await seedDatabase();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Error handling
app.use(errorHandler);

// Start server
connectDB().then(async () => {
  // Public-demo self-reset: when DEMO_RESET=true, wipe and re-seed the default
  // sample data on startup and on a timer, so visitor edits (including anything
  // inappropriate) don't persist. Leave unset for a normal/private deployment.
  if (process.env.DEMO_RESET === 'true') {
    try {
      await seedDatabase();
    } catch (err) {
      console.error('Seed on startup failed:', err.message);
    }
    const resetMinutes = Number(process.env.RESET_INTERVAL_MINUTES) || 180;
    setInterval(() => {
      seedDatabase().catch((err) => console.error('Scheduled reset failed:', err.message));
    }, resetMinutes * 60 * 1000);
    console.log(`Demo reset enabled: on startup + every ${resetMinutes} min`);
  }

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
