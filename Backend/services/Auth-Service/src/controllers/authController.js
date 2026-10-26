//This is the Auth Controller - the core logic for all authentication operations... It has 4 functions 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;

// POST /auth/register
const register = async (req, res) => {
  try {
    // Takes name, email, password from the request body
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    } // Check all fields are present 

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }// Checks the email is not already taken 

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    //This is bcrypt hashing =>  takes the plain-text password and runs it through the bcrypt algorithm 10 times (salt rounds = 10)
    //It converts password(string) into an unreadable hash that is safe to store in the database..

    const user = await User.create({ name, email, password: hashedPassword });
    // Hashes the password using bcrypt 

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
//Saves the new user to the database ; Returns the created user (without password)

// POST /auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
//Takes email and password => If there are no email and password then it sends a message => Email and password are required

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    //Finds ths user by email

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    //This is Bcrypt  => It is used to verify the provided pasword against the stored hash using bcrypt.compare().....

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
//jwt.sign() creates a signed token with 3 arguments:
// Payload → { id, email, role } — the user data embedded inside the token
// Secret key → JWT_SECRET from .env — used to sign and later verify the token
// Options → token expires in 1d (1 day) by default
// The token looks like: xxxxx.yyyyy.zzzzz (header.payload.signature)

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
// Sends back 200 OK with the token and basic user info
// The client stores this token and sends it in future requests as Authorization: Bearer <token>

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
  //If anything goes wrong unexpectedly, logs the error and returns 500
};

// GET /auth/me  (protected)
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    //findByPk => find by Primary key 
    //exclude: ['password'] = fetch everything except the password — never send password back to client

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    //Returns 404 if no user exists with that id

    return res.status(200).json({ user });
    //Returns the user's profile (id, name, email, role, timestamps)
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
  //Catches any unexpected errors
};
//This is like clicking "My Account" on Amazon — it shows your profile details without asking you to login again, because your JWT already identifies you.




// POST /auth/verify  (used by API Gateway to validate tokens)
const verifyToken = (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    //Reads the Authorization header which looks like Bearer xxxxx.yyyyy.zzzzz => Splits it by space and takes the second part — the actual token

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    //If no token is found, reject immediately with 401

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ valid: true, user: decoded });
// Uses JWT_SECRET to verify the token is genuine and not expired
// If valid, returns { valid: true, user: { id, email, role } }
  } catch (error) {
    return res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
  //If token is fake, tampered, or expired — returns { valid: false }
};

module.exports = { register, login, getMe, verifyToken };


//Login → Server gives JWT → Client sends JWT on every request → Server reads it → Knows who you are

//Let's suppose you open an amazon and enter your email + password and click login => Amazon's server verifies your credentials and creates a JWT token => This token is sent back to your browser and stored 
//Client(Frontend) sends JWT on every request ..  Server reads it and know who you are 