/**
 * Upload Lambda Function
 * Generates S3 pre-signed URLs for secure medical document uploads.
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const response = require('../../shared/response');
const crypto = require('crypto');

const s3 = new S3Client({});

/**
 * POST /upload-url
 * Generate a pre-signed URL for uploading medical documents to S3.
 */
exports.handler = async (event) => {
  try {
    const userId = event.requestContext?.authorizer?.userId;

    if (!userId) {
      return response.unauthorized('User not authenticated');
    }

    const body = JSON.parse(event.body || '{}');
    const { filename, contentType } = body;

    if (!filename) {
      return response.badRequest('filename is required');
    }

    const bucketName = process.env.S3_BUCKET || 'lks-peserta-telemedicine';
    const fileExtension = filename.split('.').pop();
    const uniqueId = crypto.randomUUID();
    const key = `medical-documents/${userId}/${uniqueId}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
      Metadata: {
        'user-id': userId.toString(),
        'original-filename': filename,
      },
    });

    // Generate pre-signed URL valid for 15 minutes
    const url = await getSignedUrl(s3, command, { expiresIn: 900 });

    return response.success({
      url,
      key,
      bucket: bucketName,
      expiresIn: 900,
    });
  } catch (err) {
    console.error('Upload URL generation error:', err);
    return response.error('Failed to generate upload URL');
  }
};
