const express = require('express');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const authenticate = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Rate Limiting ───────────────────────────────────────────
// Max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later' },
});
app.use(limiter);

app.use(express.json());

// ─── Health Check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway running' });
});

// ─── Public Routes (no auth required) ────────────────────────
// Auth service — register, login, verify are all public
app.use('/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Auth service unavailable' });
    },
  },
}));

// ─── Protected Routes (JWT required) ─────────────────────────
// Booking service
app.use('/bookings', authenticate, createProxyMiddleware({
  target: process.env.BOOKING_SERVICE_URL,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Booking service unavailable' });
    },
  },
}));

// Search service
app.use('/search', authenticate, createProxyMiddleware({
  target: process.env.SEARCH_SERVICE_URL,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Search service unavailable' });
    },
  },
}));

// Notification service (internal — protected)
app.use('/notifications', authenticate, createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Notification service unavailable' });
    },
  },
}));

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});