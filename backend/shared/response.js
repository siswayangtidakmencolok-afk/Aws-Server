/**
 * Standardized API Response Builder
 * Provides consistent response format with CORS headers.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Create a successful response
 * @param {Object|Array} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} API Gateway response object
 */
function success(data, statusCode = 200) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(data),
  };
}

/**
 * Create an error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @returns {Object} API Gateway response object
 */
function error(message, statusCode = 500) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: message }),
  };
}

/**
 * Create a response for unauthorized requests
 * @param {string} message - Error message
 * @returns {Object} API Gateway response object
 */
function unauthorized(message = 'Unauthorized') {
  return error(message, 401);
}

/**
 * Create a response for bad requests
 * @param {string} message - Error message
 * @returns {Object} API Gateway response object
 */
function badRequest(message = 'Bad Request') {
  return error(message, 400);
}

/**
 * Create a response for not found
 * @param {string} message - Error message
 * @returns {Object} API Gateway response object
 */
function notFound(message = 'Not Found') {
  return error(message, 404);
}

module.exports = { success, error, unauthorized, badRequest, notFound, CORS_HEADERS };
