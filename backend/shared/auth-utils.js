/**
 * JWT Authentication Utilities
 * Handles token generation, verification, and password hashing.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

let jwtSecret = null;

/**
 * Get JWT secret from SSM Parameter Store or environment variable.
 */
async function getJwtSecret() {
  if (jwtSecret) return jwtSecret;

  if (process.env.IS_LOCAL === 'true') {
    jwtSecret = process.env.JWT_SECRET || 'local-dev-secret-key-change-in-production';
    return jwtSecret;
  }

  const ssm = new SSMClient({});
  const command = new GetParameterCommand({
    Name: '/lks/telemedicine/db/jwt_secret',
    WithDecryption: true,
  });
  const response = await ssm.send(command);
  jwtSecret = response.Parameter.Value;
  return jwtSecret;
}

/**
 * Generate a JWT token for the given user payload.
 * @param {Object} payload - User data to encode { id, email, role }
 * @returns {Promise<string>} JWT token
 */
async function generateToken(payload) {
  const secret = await getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

/**
 * Verify and decode a JWT token.
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} Decoded token payload
 */
async function verifyToken(token) {
  const secret = await getJwtSecret();
  return jwt.verify(token, secret);
}

/**
 * Hash a plain text password.
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Compare a plain text password with a hash.
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if match
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  getJwtSecret,
};
