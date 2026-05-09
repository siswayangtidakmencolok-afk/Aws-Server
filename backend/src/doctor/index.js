/**
 * Doctor Lambda Function (DynamoDB Edition)
 * Handles fetching the list of available doctors from DynamoDB.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const response = require('../../shared/response');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const DOCTORS_TABLE = process.env.DOCTORS_TABLE;

/**
 * GET /doctor
 */
exports.handler = async (event) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: DOCTORS_TABLE
    }));

    return response.success(result.Items || []);
  } catch (err) {
    console.error('Get doctors error:', err);
    return response.error('Failed to fetch doctors');
  }
};

/**
 * GET /doctor/{id}
 */
exports.getByIdHandler = async (event) => {
  try {
    const doctorId = event.pathParameters?.id;

    if (!doctorId) {
      return response.badRequest('Doctor ID is required');
    }

    const result = await docClient.send(new GetCommand({
      TableName: DOCTORS_TABLE,
      Key: { id: doctorId }
    }));

    if (!result.Item) {
      return response.notFound('Doctor not found');
    }

    return response.success(result.Item);
  } catch (err) {
    console.error('Get doctor by ID error:', err);
    return response.error('Failed to fetch doctor');
  }
};
