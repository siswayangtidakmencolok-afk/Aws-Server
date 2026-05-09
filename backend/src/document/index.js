/**
 * Document Lambda Function (DynamoDB Edition)
 * Triggered by S3 events to save document metadata to DynamoDB.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const response = require('../../shared/response');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const sqs = new SQSClient({});

const DOCUMENTS_TABLE = process.env.DOCUMENTS_TABLE;
const DOCUMENT_QUEUE_URL = process.env.DOCUMENT_QUEUE_URL;

/**
 * S3 Event Trigger / GET Documents Handler
 */
exports.handler = async (event) => {
  // If it's an API Gateway event (GET request)
  if (event.httpMethod === 'GET') {
    return await listDocuments(event);
  }

  // If it's an S3 event (Trigger)
  try {
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
      const size = record.s3.object.size;

      console.log(`Processing uploaded file: ${bucket}/${key}`);

      const pathParts = key.split('/');
      const userId = pathParts.length >= 2 ? pathParts[1] : 'unknown';
      const docId = Date.now().toString();

      const item = {
        userId,
        id: docId,
        fileUrl: `https://${bucket}.s3.amazonaws.com/${key}`,
        key,
        size,
        createdAt: new Date().toISOString()
      };

      // Save to DynamoDB
      await docClient.send(new PutCommand({
        TableName: DOCUMENTS_TABLE,
        Item: item
      }));

      // Send to SQS (optional notification)
      if (DOCUMENT_QUEUE_URL) {
        await sqs.send(new SendMessageCommand({
          QueueUrl: DOCUMENT_QUEUE_URL,
          MessageBody: JSON.stringify({ type: 'DOCUMENT_UPLOADED', document: item })
        }));
      }
    }
    return { statusCode: 200, body: 'Processed' };
  } catch (err) {
    console.error('Error processing S3 event:', err);
    return { statusCode: 500, body: 'Error' };
  }
};

async function listDocuments(event) {
  try {
    const userId = event.requestContext?.authorizer?.userId;
    if (!userId) return response.unauthorized('Not authenticated');

    const result = await docClient.send(new QueryCommand({
      TableName: DOCUMENTS_TABLE,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId }
    }));

    return response.success(result.Items || []);
  } catch (err) {
    console.error('List documents error:', err);
    return response.error('Failed to list documents');
  }
}
