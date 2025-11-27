const jwt = require('jsonwebtoken');

function generateToken(payload, secret, ttlSeconds) {
  return jwt.sign(payload, secret, { expiresIn: ttlSeconds });
}

function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}

function extractBearerToken(header) {
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.replace('Bearer ', '');
}

module.exports = {
  generateToken,
  verifyToken,
  extractBearerToken
};
