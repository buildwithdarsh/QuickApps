import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs-extra';
import { DOWNLOAD_URL_EXPIRY_SECONDS } from '../../common/constants';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get<string>('aws.s3Bucket', 'techzunction-quick-apps');
    this.region = this.config.get<string>('aws.s3Region', 'ap-south-1');

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.config.get<string>('aws.accessKeyId', ''),
        secretAccessKey: this.config.get<string>('aws.secretAccessKey', ''),
      },
    });

    this.logger.log(`S3 configured — bucket: ${this.bucket}, region: ${this.region}`);
  }

  async uploadBuffer(key: string, buffer: Buffer, contentType: string): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    this.logger.log(`Uploaded ${key} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return key;
  }

  async uploadFile(key: string, filePath: string, contentType: string): Promise<string> {
    const stream = fs.createReadStream(filePath);
    const stat = await fs.stat(filePath);

    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: stream,
        ContentType: contentType,
      },
      // Use multipart for files > 5MB
      partSize: 5 * 1024 * 1024,
      leavePartsOnError: false,
    });

    await upload.done();
    this.logger.log(`Uploaded ${key} from file (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
    return key;
  }

  async uploadStream(key: string, stream: import('stream').Readable, contentType: string): Promise<string> {
    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: stream,
        ContentType: contentType,
      },
      partSize: 5 * 1024 * 1024,
      leavePartsOnError: false,
    });

    await upload.done();
    this.logger.log(`Uploaded ${key} from stream`);
    return key;
  }

  async getSignedDownloadUrl(key: string, expiresIn = DOWNLOAD_URL_EXPIRY_SECONDS): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async objectExists(key: string): Promise<boolean> {
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async deleteObject(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    this.logger.log(`Deleted ${key}`);
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
