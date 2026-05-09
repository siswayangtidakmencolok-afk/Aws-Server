/**
 * Auth Lambda Function (DynamoDB Edition)
 * Handles user login and registration using DynamoDB as backend.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { generateToken, verifyToken, comparePassword, hashPassword } = require('../../shared/auth-utils');
const response = require('../../shared/response');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USERS_TABLE;

/**
 * POST /auth/login
 */
exports.loginHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;

    if (!email || !password) {
      return response.badRequest('Email and password are required');
    }

    // Get user from DynamoDB
    const result = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { email }
    }));

    if (!result.Item) {
      return response.unauthorized('Invalid email or password');
    }

    const user = result.Item;

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return response.unauthorized('Invalid email or password');
    }

    // Generate JWT
    const token = await generateToken({
      id: user.userId,
      email: user.email,
      role: user.role,
    });

    return response.success({
      token,
      user: {
        id: user.userId,
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
 */
exports.registerHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password, role } = body;

    if (!email || !password) {
      return response.badRequest('Email and password are required');
    }

    // Check if user exists
    const existing = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { email }
    }));

    if (existing.Item) {
      return response.badRequest('Email already registered');
    }

    const validRoles = ['patient', 'doctor'];
    const userRole = validRoles.includes(role) ? role : 'patient';
    const hashedPassword = await hashPassword(password);
    const userId = Date.now().toString(); // Simple ID for DynamoDB

    // Save to DynamoDB
    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        email,
        password: hashedPassword,
        role: userRole,
        userId,
        createdAt: new Date().toISOString()
      }
    }));

    const token = await generateToken({ id: userId, email, role: userRole });

    return response.success({
      token,
      user: { id: userId, email, role: userRole }
    }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return response.error('Internal server error');
  }
};

/**
 * API Gateway Custom Authorizer
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
            Resource: '*', // Simplified for robustness
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
