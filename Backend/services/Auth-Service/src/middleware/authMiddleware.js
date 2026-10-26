//Middleware — runs before the controller, prepares or checks the request
// It either blocks the request or calls next() to pass it forward
// It doesn't send the final response (mostly)


// Controller — runs after middleware, contains the actual business logic

// It sends the final response back to the client
// Example: fetch user from DB, create a booking, return data

// Request → Middleware (check/guard) → Controller (do the work) → Response

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};

module.exports = { authenticate, authorizeAdmin };

// This file has two middleware functions that act as security guards before a request reaches the controller.

// authenticate — Verifies the JWT token

// Extracts the token from the Authorization: Bearer <token> header
// Verifies it using JWT_SECRET
// If valid → attaches the decoded user (id, email, role) to req.user and calls next() to continue
// If missing or invalid → blocks the request with 401

// authorizeAdmin — Checks if the user is an admin

// Reads req.user.role (set by authenticate)
// If role is not admin → blocks with 403
// If admin → calls next() to continue

// Real world analogy:

// Think of a bank 🏦

// Middleware = the security guard at the door who checks if you have a valid ID before letting you in — he doesn't serve you, he just checks
// Controller = the bank teller who actually handles your transaction once you're inside