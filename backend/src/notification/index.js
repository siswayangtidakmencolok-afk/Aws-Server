/**
 * Notification Lambda Function
 * Consumes messages from SQS queues and publishes notifications via SNS.
 */

const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const sns = new SNSClient({});

/**
 * SQS Event Handler
 * Processes booking and document events from SQS,
 * then sends notifications via SNS topic.
 */
exports.handler = async (event) => {
  const topicArn = process.env.SNS_TOPIC_ARN;

  if (!topicArn) {
    console.error('SNS_TOPIC_ARN environment variable not set');
    return { statusCode: 500, body: 'SNS topic not configured' };
  }

  const results = [];

  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body);
      console.log('Processing notification event:', message.type);

      let subject, notificationMessage;

      switch (message.type) {
        case 'BOOKING_CREATED':
          subject = 'Appointment Booking Confirmation';
          notificationMessage = buildBookingNotification(message);
          break;

        case 'DOCUMENT_UPLOADED':
          subject = 'Medical Document Upload Confirmation';
          notificationMessage = buildDocumentNotification(message);
          break;

        default:
          console.log('Unknown event type:', message.type);
          subject = 'Telemedicine Notification';
          notificationMessage = `New event received: ${message.type}`;
      }

      // Publish to SNS topic
      await sns.send(
        new PublishCommand({
          TopicArn: topicArn,
          Subject: subject,
          Message: notificationMessage,
          MessageAttributes: {
            EventType: {
              DataType: 'String',
              StringValue: message.type,
            },
          },
        })
      );

      console.log(`Notification sent for event: ${message.type}`);
      results.push({ messageId: record.messageId, status: 'success' });
    } catch (err) {
      console.error('Failed to process notification:', err);
      results.push({ messageId: record.messageId, status: 'error', error: err.message });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ processed: results.length, results }),
  };
};

/**
 * Build notification message for booking events.
 */
function buildBookingNotification(event) {
  const { appointment } = event;
  return [
    '🏥 Nusantara Telemedicine - Booking Confirmation',
    '',
    `Appointment ID: ${appointment.id}`,
    `Doctor: ${appointment.doctorName || 'N/A'}`,
    `Schedule: ${new Date(appointment.schedule).toLocaleString('id-ID')}`,
    `Status: ${appointment.status}`,
    '',
    `Booked at: ${event.timestamp}`,
    '',
    'Please arrive 10 minutes before your scheduled time.',
    'Thank you for using Nusantara Telemedicine.',
  ].join('\n');
}

/**
 * Build notification message for document upload events.
 */
function buildDocumentNotification(event) {
  const { document } = event;
  return [
    '📄 Nusantara Telemedicine - Document Upload Confirmation',
    '',
    `Document ID: ${document.id}`,
    `File: ${document.key || 'N/A'}`,
    `Size: ${formatFileSize(document.fileSize)}`,
    '',
    `Uploaded at: ${event.timestamp}`,
    '',
    'Your medical document has been securely stored.',
    'Thank you for using Nusantara Telemedicine.',
  ].join('\n');
}

/**
 * Format file size for display.
 */
function formatFileSize(bytes) {
  if (!bytes) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
