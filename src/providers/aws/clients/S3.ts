import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

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

type FileType = 'GadgetPhotos' | 'ProfilePhotos'

@Injectable()
export class S3Provider {
  constructor() {}

  /**
   * Utility method to upload files to Amazon S3
   *
   * @param dataBuffer
   * @param filename
   * @param key
   * @returns
   */
  public async uploadFile(
    dataBuffer: Buffer,
    type: FileType,
    key?: string,
  ): Promise<{ Key: string; Bucket: string; MetaData: any }> {
    const objectParams = {
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Key: key ? key : `${type}/${uuid()}.jpg`,
      Body: dataBuffer,
    };

    try {
      const data = await s3Client.send(new PutObjectCommand(objectParams));

      return {
        Key: objectParams.Key,
        Bucket: objectParams.Bucket,
        MetaData: data,
      };
    } catch (error) {
      console.log(error);
      throw new Error('An error occured');
    }
  }
}

export { s3Client };
