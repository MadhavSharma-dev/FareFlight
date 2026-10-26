const http = require('http');

// Validates JWT by calling Auth Service /auth/verify
// If valid → forwards user info via headers to downstream service
// If invalid → blocks the request

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const authServiceHost = process.env.AUTH_SERVICE_HOST || 'localhost';
  const authServicePort = process.env.AUTH_SERVICE_PORT || 3001;

  // Call Auth Service to verify the token
  const options = {
    hostname: authServiceHost,
    port: authServicePort,
    path: '/auth/verify',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  const authReq = http.request(options, (authRes) => {
    let data = '';

    authRes.on('data', (chunk) => (data += chunk));

    authRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);

        if (authRes.statusCode === 200 && parsed.valid) {
          // Attach user info to headers so downstream services know who the user is
          req.headers['x-user-id'] = parsed.user.id;
          req.headers['x-user-email'] = parsed.user.email;
          req.headers['x-user-role'] = parsed.user.role;
          next(); // proceed to the target service
        } else {
          return res.status(401).json({ message: parsed.message || 'Unauthorized' });
        }
      } catch (err) {
        return res.status(500).json({ message: 'Auth service error' });
      }
    });
  });

  authReq.on('error', () => {
    return res.status(503).json({ message: 'Auth service unavailable' });
  });

  authReq.end();
};

module.exports = authenticate;
