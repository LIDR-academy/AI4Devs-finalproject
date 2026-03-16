const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const sanitize = require('sanitize-filename');
import { promisify } from 'util';
import logger from '../utils/logger';

// Type definitions for AWS
type S3 = any;
type S3UploadResult = any;

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

export interface StorageConfig {
  useS3: boolean;
  s3Bucket?: string;
  localUploadDir: string;
}

export interface UploadResult {
  filename: string;
  path: string;
  size: number;
}

export class StorageService {
  private s3: any | null = null;
  private config: StorageConfig;

  constructor() {
    this.config = {
      useS3: process.env.NODE_ENV === 'production' && !!process.env.AWS_S3_BUCKET,
      s3Bucket: process.env.AWS_S3_BUCKET,
      localUploadDir: process.env.UPLOAD_DIR || 'uploads/documents'
    };

    if (this.config.useS3) {
      this.initializeS3();
    } else {
      this.ensureLocalDirectory();
    }

    logger.info(`Storage service initialized: ${this.config.useS3 ? 'S3' : 'Local filesystem'}`);
  }

  private initializeS3() {
    try {
      this.s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'eu-west-1'
      });
      logger.info('S3 client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize S3 client:', error);
      throw new Error('S3 configuration error');
    }
  }

  private async ensureLocalDirectory() {
    try {
      const uploadPath = path.resolve(this.config.localUploadDir);
      await mkdir(uploadPath, { recursive: true });
      // logger.info(`Local upload directory ensured: ${uploadPath}`);
    } catch (error) {
      logger.error('Failed to create local upload directory:', error);
      throw new Error('Local storage configuration error');
    }
  }

  /**
   * Generate a unique filename with timestamp and random suffix
   */
  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitizedName = sanitize(originalName);
    const ext = path.extname(sanitizedName);
    const nameWithoutExt = path.basename(sanitizedName, ext);
    
    return `${timestamp}-${randomSuffix}-${nameWithoutExt}${ext}`;
  }

  /**
   * Upload file to storage (S3 or local filesystem)
   */
  async uploadFile(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadResult> {
    const filename = this.generateUniqueFilename(originalName);
    
    if (this.config.useS3) {
      return this.uploadToS3(buffer, filename, mimeType);
    } else {
      return this.uploadToLocal(buffer, filename);
    }
  }

  /**
   * Upload file to AWS S3
   */
  private async uploadToS3(buffer: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    if (!this.s3 || !this.config.s3Bucket) {
      throw new Error('S3 not properly configured');
    }

    try {
      const uploadParams: any = {
        Bucket: this.config.s3Bucket,
        Key: `documents/${filename}`,
        Body: buffer,
        ContentType: mimeType,
        ServerSideEncryption: 'AES256'
      };

      const result = await this.s3.upload(uploadParams).promise();
      
      logger.info(`File uploaded to S3: ${result.Location}`);
      
      return {
        filename,
        path: result.Location,
        size: buffer.length
      };
    } catch (error) {
      logger.error('S3 upload failed:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Upload file to local filesystem
   */
  private async uploadToLocal(buffer: Buffer, filename: string): Promise<UploadResult> {
    try {
      const filePath = path.join(this.config.localUploadDir, filename);
      await writeFile(filePath, buffer);
      
      logger.info(`File uploaded locally: ${filePath}`);
      
      return {
        filename,
        path: filePath,
        size: buffer.length
      };
    } catch (error) {
      logger.error('Local upload failed:', error);
      throw new Error('Failed to upload file locally');
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    if (this.config.useS3) {
      await this.deleteFromS3(filePath);
    } else {
      await this.deleteFromLocal(filePath);
    }
  }

  /**
   * Delete file from S3
   */
  private async deleteFromS3(s3Url: string): Promise<void> {
    if (!this.s3 || !this.config.s3Bucket) {
      throw new Error('S3 not properly configured');
    }

    try {
      // Extract key from S3 URL
      const key = s3Url.split('/').slice(-2).join('/'); // documents/filename
      
      await this.s3.deleteObject({
        Bucket: this.config.s3Bucket,
        Key: key
      }).promise();
      
      logger.info(`File deleted from S3: ${key}`);
    } catch (error) {
      logger.error('S3 deletion failed:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  /**
   * Delete file from local filesystem
   */
  private async deleteFromLocal(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
      logger.info(`File deleted locally: ${filePath}`);
    } catch (error) {
      logger.error('Local deletion failed:', error);
      throw new Error('Failed to delete local file');
    }
  }

  /**
   * Get file URL for access
   */
  getFileUrl(filePath: string): string {
    if (this.config.useS3) {
      return filePath; // S3 URL is already complete
    } else {
      // For local files, return a relative path that can be served by Express
      return `/uploads/documents/${path.basename(filePath)}`;
    }
  }

  /**
   * Get signed URL for S3 files (for temporary access)
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    if (!this.config.useS3 || !this.s3 || !this.config.s3Bucket) {
      return this.getFileUrl(filePath);
    }

    try {
      const key = filePath.split('/').slice(-2).join('/');
      
      const signedUrl = await this.s3.getSignedUrlPromise('getObject', {
        Bucket: this.config.s3Bucket,
        Key: key,
        Expires: expiresIn
      });
      
      return signedUrl;
    } catch (error) {
      logger.error('Failed to generate signed URL:', error);
      throw new Error('Failed to generate file access URL');
    }
  }
}

// Export singleton instance
export const storageService = new StorageService(); 