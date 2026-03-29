import { S3Client } from '@aws-sdk/client-s3';
import { env } from '@/config/env';

const isMinIO = !env.S3_ENDPOINT.includes('amazonaws.com');

export const s3Client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
  // forcePathStyle solo es necesario para MinIO; S3 nativo usa virtual-hosted style
  forcePathStyle: isMinIO,
});
