import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.STORAGE_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || '',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || '',
  },
});

const BUCKET_NAME = process.env.STORAGE_BUCKET_NAME || 'my-production-bucket';

export const storageService = {
  /**
   * Generates a temporary pre-signed PUT URL allowing clients to upload directly to S3.
   */
  async generateUploadSignature(fileName: string, contentType: string) {
    const storageKey = `uploads/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
      ContentType: contentType,
    });

    // Enforce strict 5-minute upload window
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return { uploadUrl: signedUrl, storageKey };
  },

  /**
   * Generates a temporary pre-signed GET URL granting read access to private assets.
   */
  async generateReadSignature(storageKey: string) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  },
};