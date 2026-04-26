/**
 * Auth Lambda Function
 * Handles user login (JWT generation) and API Gateway custom authorization.
 */

const { query } = require('../../shared/db');
const { generateToken, verifyToken, comparePassword, hashPassword } = require('../../shared/auth-utils');
const response = require('../../shared/response');

/**
 * POST /auth/login
 * Authenticate user and return JWT token.
 */
exports.loginHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;

    if (!email || !password) {
      return response.badRequest('Email and password are required');
    }

    // Query user by email
    const result = await query('SELECT id, email, password, role FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return response.unauthorized('Invalid email or password');
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return response.unauthorized('Invalid email or password');
    }

    // Generate JWT
    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return response.success({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return response.error('Internal server error');
  }
};

/**
 * POST /auth/register
 * Register a new user account.
 */
exports.registerHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password, role } = body;

    if (!email || !password) {
      return response.badRequest('Email and password are required');
    }

    const validRoles = ['patient', 'doctor'];
    const userRole = validRoles.includes(role) ? role : 'patient';

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return response.badRequest('Email already registered');
    }

    // Hash password and insert
    const hashedPassword = await hashPassword(password);
    const result = await query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, userRole]
    );

    const user = result.rows[0];
    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return response.success({ token, user }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return response.error('Internal server error');
  }
};

/**
 * API Gateway Custom Authorizer
 * Validates JWT token from the Authorization header.
 */
exports.authorizerHandler = async (event) => {
  try {
    const token = event.authorizationToken || event.headers?.Authorization || '';
    const cleanToken = token.replace('Bearer ', '');

    if (!cleanToken) {
      throw new Error('No token provided');
    }

    const decoded = await verifyToken(cleanToken);

    return {
      principalId: decoded.id.toString(),
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn || '*',
          },
        ],
      },
      context: {
        userId: decoded.id.toString(),
        email: decoded.email,
        role: decoded.role,
      },
    };
  } catch (err) {
    console.error('Authorization failed:', err.message);
    throw new Error('Unauthorized');
  }
};
