import { S3Client } from '@aws-sdk/client-s3';

// Create an Amazon S3 service client object
const s3Client = new S3Client({
  region: process.env.AWS_REGION, // Set the AWS region
  //   credentials: {
  //     // Set the IAM credentials
  //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //   },
  maxAttempts: 5,
});

export { s3Client };
