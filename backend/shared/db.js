/**
 * PostgreSQL Database Connection Helper
 * Retrieves credentials from SSM Parameter Store (production)
 * or environment variables (local development).
 */

const { Pool } = require('pg');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

let pool = null;

/**
 * Get SSM parameter value
 */
async function getSSMParameter(name) {
  const ssm = new SSMClient({});
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });
  const response = await ssm.send(command);
  return response.Parameter.Value;
}

/**
 * Initialize or return existing connection pool.
 * In production, credentials come from SSM Parameter Store.
 * In local development, credentials come from environment variables.
 */
async function getPool() {
  if (pool) return pool;

  let config;

  if (process.env.IS_LOCAL === 'true') {
    // Local development — use environment variables
    config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'telemedicine',
      password: process.env.DB_PASS || 'telemedicine123',
      database: process.env.DB_NAME || 'telemedicine',
      port: parseInt(process.env.DB_PORT || '5432'),
    };
  } else {
    // Production — use SSM Parameter Store
    const basePath = '/lks/telemedicine/db';
    const [host, user, pass, name] = await Promise.all([
      getSSMParameter(`${basePath}/db_host`),
      getSSMParameter(`${basePath}/db_user`),
      getSSMParameter(`${basePath}/db_pass`),
      getSSMParameter(`${basePath}/db_name`),
    ]);

    config = {
      host,
      user,
      password: pass,
      database: name,
      port: 5432,
      ssl: { rejectUnauthorized: false },
    };
  }

  pool = new Pool({
    ...config,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  return pool;
}

/**
 * Execute a SQL query
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  const p = await getPool();
  return p.query(text, params);
}

module.exports = { getPool, query };
