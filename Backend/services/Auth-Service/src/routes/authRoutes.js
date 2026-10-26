const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyToken } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/verify', verifyToken);  // internal — called by API Gateway

module.exports = router;

//GET → Use when you want to fetch/read data. No body sent. Example: get my profile, get list of flights.

// POST → Use when you want to send/create data. Data is sent in the request body. Example: register a user, login, create a booking.

// Real world analogy:

// Think of this like a reception desk at a hospital 🏥

// /register → "I'm a new patient, I want to create an account" — anyone can walk in
// /login → "I'm an existing patient, here are my credentials" — anyone can walk in
// /me → "I want to see my medical records" — you must show your ID (JWT) first before they let you in
// /verify → A back-office check — only used by hospital staff (API Gateway) to confirm your ID is genuine, not for patients directly