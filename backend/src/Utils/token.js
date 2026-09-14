const jwt = require('jsonwebtoken');
const config = require('../Config');

/**
 * Sign a JWT containing the user's id and role.
 */
const signToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verify a JWT and return its decoded payload.
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = { signToken, verifyToken };