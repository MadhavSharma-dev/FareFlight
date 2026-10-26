const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Loads environment variables from .env via dotenv
// Creates the Express app
// Sets port to 3001 (or from .env)
// Enables express.json() to parse incoming JSON request bodies

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'Auth service running' }));
///health → simple check to confirm the service is running

// Routes
app.use('/auth', authRoutes);
///auth → connects all auth routes (register, login, me, verify)

// Sync DB and start server
sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL connected');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });

// Connect to PostgreSQL
// → Sync database models (create/alter tables)
// → Start Express server on port 3001

//sequelize.authenticate() — tests the DB connection
//sequelize.sync({ alter: true }) — auto-updates tables to match your models without dropping data
// If DB connection fails → logs the error and exits the process

// Real world analogy:

// Think of this as the opening checklist of a restaurant 🍽️

// Load the menu and staff info (dotenv, routes)
// Check if the kitchen is ready (DB connection)
// Set up the tables (sync models)
// Open the front door for customers (app.listen)
// If kitchen fails → don't open at all (process.exit)