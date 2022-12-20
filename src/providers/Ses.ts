import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Create an Amazon S3 service client object
const sesClient = new SESClient({
  region: process.env.AWS_REGION, // Set the AWS region
  //   credentials: {
  //     // Set the IAM credentials
  //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //   },
  maxAttempts: 5,
});

export { sesClient };
