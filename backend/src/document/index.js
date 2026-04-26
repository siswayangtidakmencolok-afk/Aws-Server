/**
 * Document Lambda Function
 * Triggered by S3 events when a medical document is uploaded.
 * Saves metadata to PostgreSQL and sends event to SQS document queue.
 */

const { query } = require('../../shared/db');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const sqs = new SQSClient({});

/**
 * S3 Event Trigger Handler
 * Processes uploaded medical documents:
 * 1. Extracts metadata from S3 event
 * 2. Saves document record to PostgreSQL
 * 3. Sends notification event to SQS document queue
 */
exports.handler = async (event) => {
  try {
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
      const size = record.s3.object.size;

      console.log(`Processing uploaded file: ${bucket}/${key} (${size} bytes)`);

      // Extract user ID from the key path: medical-documents/{userId}/{filename}
      const pathParts = key.split('/');
      const userId = pathParts.length >= 2 ? pathParts[1] : null;

      if (!userId) {
        console.error('Could not extract user ID from key:', key);
        continue;
      }

      const fileUrl = `s3://${bucket}/${key}`;

      // Save document metadata to PostgreSQL
      const result = await query(
        `INSERT INTO medical_documents (user_id, file_url, created_at)
         VALUES ($1, $2, NOW())
         RETURNING id, user_id, file_url, created_at`,
        [userId, fileUrl]
      );

      const document = result.rows[0];
      console.log('Document saved to database:', document.id);

      // Send event to SQS document queue
      const queueUrl = process.env.DOCUMENT_QUEUE_URL;
      if (queueUrl) {
        await sqs.send(
          new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify({
              type: 'DOCUMENT_UPLOADED',
              document: {
                id: document.id,
                userId: document.user_id,
                fileUrl: document.file_url,
                fileSize: size,
                key,
              },
              timestamp: new Date().toISOString(),
            }),
            MessageAttributes: {
              EventType: {
                DataType: 'String',
                StringValue: 'DOCUMENT_UPLOADED',
              },
            },
          })
        );

        console.log('Event sent to document queue');
      }
    }

    return { statusCode: 200, body: 'Documents processed successfully' };
  } catch (err) {
    console.error('Document processing error:', err);
    throw err;
  }
};
