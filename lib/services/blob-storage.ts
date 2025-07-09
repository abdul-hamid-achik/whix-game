import { put as vercelPut } from '@vercel/blob';
import * as Minio from 'minio';
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Blob storage abstraction that works with both Vercel Blob and MinIO/S3
export interface BlobStorageResult {
  url: string;
  pathname: string;
  contentType?: string;
  contentDisposition?: string;
}

export interface BlobStorageConfig {
  type: 'vercel' | 'minio' | 's3';
  // Vercel Blob config
  token?: string;
  // MinIO/S3 config
  endpoint?: string;
  accessKey?: string;
  secretKey?: string;
  bucket?: string;
  region?: string;
  useSSL?: boolean;
}

class BlobStorage {
  private config: BlobStorageConfig;
  private s3Client?: S3Client;
  private minioClient?: Minio.Client;
  private bucketInitialized = false;

  constructor() {
    this.config = this.loadConfig();
    if (this.config.type === 'minio') {
      this.initializeMinioClient();
    } else if (this.config.type === 's3') {
      this.initializeS3Client();
    }
  }

  private loadConfig(): BlobStorageConfig {
    const storageType = process.env.BLOB_STORAGE_TYPE || 'vercel';
    
    if (storageType === 'minio') {
      return {
        type: 'minio',
        endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9100',
        accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        bucket: process.env.MINIO_BUCKET || 'whix-assets',
        region: process.env.MINIO_REGION || 'us-east-1',
        useSSL: process.env.MINIO_USE_SSL === 'true',
      };
    } else if (storageType === 's3') {
      return {
        type: 's3',
        accessKey: process.env.AWS_ACCESS_KEY_ID!,
        secretKey: process.env.AWS_SECRET_ACCESS_KEY!,
        bucket: process.env.AWS_S3_BUCKET!,
        region: process.env.AWS_REGION || 'us-east-1',
      };
    } else {
      return {
        type: 'vercel',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      };
    }
  }

  private initializeMinioClient() {
    if (this.config.type === 'minio') {
      const endpointUrl = new URL(this.config.endpoint || 'http://localhost:9100');
      
      this.minioClient = new Minio.Client({
        endPoint: endpointUrl.hostname,
        port: endpointUrl.port ? parseInt(endpointUrl.port) : (endpointUrl.protocol === 'https:' ? 443 : 80),
        useSSL: this.config.useSSL || endpointUrl.protocol === 'https:',
        accessKey: this.config.accessKey!,
        secretKey: this.config.secretKey!,
      });
    }
  }

  private initializeS3Client() {
    if (this.config.type === 's3') {
      this.s3Client = new S3Client({
        region: this.config.region || 'us-east-1',
        credentials: {
          accessKeyId: this.config.accessKey!,
          secretAccessKey: this.config.secretKey!,
        },
      });
    }
  }

  private async ensureBucket(): Promise<void> {
    if (this.bucketInitialized) return;

    if (this.config.type === 'minio' && this.minioClient) {
      try {
        // Check if bucket exists
        const exists = await this.minioClient.bucketExists(this.config.bucket!);
        if (!exists) {
          // Create bucket if it doesn't exist
          await this.minioClient.makeBucket(this.config.bucket!, this.config.region || 'us-east-1');
          console.log(`Created MinIO bucket: ${this.config.bucket}`);
        }
        this.bucketInitialized = true;
      } catch (error) {
        console.error('Failed to initialize MinIO bucket:', error);
        throw new Error('Failed to initialize MinIO bucket');
      }
    } else if (this.config.type === 's3' && this.s3Client) {
      try {
        // Check if bucket exists
        await this.s3Client.send(new HeadBucketCommand({ Bucket: this.config.bucket! }));
        this.bucketInitialized = true;
      } catch (error: any) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
          // Create bucket if it doesn't exist
          try {
            await this.s3Client.send(new CreateBucketCommand({ Bucket: this.config.bucket! }));
            console.log(`Created S3 bucket: ${this.config.bucket}`);
            this.bucketInitialized = true;
          } catch (createError) {
            console.error('Failed to create bucket:', createError);
            throw new Error('Failed to initialize S3 bucket');
          }
        } else {
          // Bucket exists or other error
          this.bucketInitialized = true;
        }
      }
    }
  }

  async put(
    pathname: string,
    body: Blob | Buffer | ArrayBuffer | string,
    options?: {
      access?: 'public' | 'private';
      addRandomSuffix?: boolean;
      contentType?: string;
      contentDisposition?: string;
      cacheControlMaxAge?: number;
    }
  ): Promise<BlobStorageResult> {
    const finalPathname = options?.addRandomSuffix 
      ? `${pathname}-${Date.now()}-${Math.random().toString(36).substring(7)}`
      : pathname;

    if (this.config.type === 'vercel') {
      // Use Vercel Blob
      const result = await vercelPut(finalPathname, body, {
        access: options?.access || 'public',
        addRandomSuffix: false, // We handle this ourselves
        contentType: options?.contentType,
        contentDisposition: options?.contentDisposition,
        cacheControlMaxAge: options?.cacheControlMaxAge,
      });
      
      return {
        url: result.url,
        pathname: finalPathname,
        contentType: options?.contentType,
        contentDisposition: options?.contentDisposition,
      };
    } else if (this.config.type === 'minio' && this.minioClient) {
      // Ensure bucket exists for MinIO
      await this.ensureBucket();
      
      // Use MinIO SDK
      let buffer: Buffer;
      
      if (body instanceof Blob) {
        buffer = Buffer.from(await body.arrayBuffer());
      } else if (body instanceof ArrayBuffer) {
        buffer = Buffer.from(body);
      } else if (typeof body === 'string') {
        buffer = Buffer.from(body);
      } else {
        buffer = body as Buffer;
      }

      // Upload object using MinIO SDK
      const metaData: { [key: string]: any } = {};
      if (options?.contentType) {
        metaData['Content-Type'] = options.contentType;
      }
      if (options?.contentDisposition) {
        metaData['Content-Disposition'] = options.contentDisposition;
      }
      if (options?.cacheControlMaxAge) {
        metaData['Cache-Control'] = `max-age=${options.cacheControlMaxAge}`;
      }

      await this.minioClient.putObject(this.config.bucket!, finalPathname, buffer, metaData);

      // Generate URL based on access type
      let url: string;
      
      if (options?.access === 'public') {
        // Public URL for MinIO
        const protocol = this.config.useSSL ? 'https' : 'http';
        const endpoint = this.config.endpoint!.replace(/^https?:\/\//, '');
        url = `${protocol}://${endpoint}/${this.config.bucket}/${finalPathname}`;
      } else {
        // Generate signed URL for private access
        url = await this.minioClient.presignedGetObject(this.config.bucket!, finalPathname, 3600);
      }

      return {
        url,
        pathname: finalPathname,
        contentType: options?.contentType,
        contentDisposition: options?.contentDisposition,
      };
    } else if (this.config.type === 's3' && this.s3Client) {
      // Ensure bucket exists for S3
      await this.ensureBucket();
      
      // Use AWS S3 SDK
      let buffer: Buffer;
      
      if (body instanceof Blob) {
        buffer = Buffer.from(await body.arrayBuffer());
      } else if (body instanceof ArrayBuffer) {
        buffer = Buffer.from(body);
      } else if (typeof body === 'string') {
        buffer = Buffer.from(body);
      } else {
        buffer = body as Buffer;
      }

      const command = new PutObjectCommand({
        Bucket: this.config.bucket!,
        Key: finalPathname,
        Body: buffer,
        ContentType: options?.contentType,
        ContentDisposition: options?.contentDisposition,
        ACL: options?.access === 'public' ? 'public-read' : 'private',
        CacheControl: options?.cacheControlMaxAge 
          ? `max-age=${options.cacheControlMaxAge}`
          : undefined,
      });

      await this.s3Client.send(command);

      // Generate URL based on access type
      let url: string;
      
      if (options?.access === 'public') {
        // Public URL for S3
        url = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${finalPathname}`;
      } else {
        // Generate signed URL for private access
        const getCommand = new GetObjectCommand({
          Bucket: this.config.bucket!,
          Key: finalPathname,
        });
        
        url = await getSignedUrl(this.s3Client, getCommand, { expiresIn: 3600 });
      }

      return {
        url,
        pathname: finalPathname,
        contentType: options?.contentType,
        contentDisposition: options?.contentDisposition,
      };
    }

    throw new Error('No blob storage configured');
  }

  async delete(pathname: string): Promise<void> {
    if (this.config.type === 'vercel') {
      // Vercel Blob doesn't have a direct delete method in the SDK
      // You might need to use their API directly
      throw new Error('Delete not implemented for Vercel Blob');
    } else if (this.config.type === 'minio' && this.minioClient) {
      await this.ensureBucket();
      
      await this.minioClient.removeObject(this.config.bucket!, pathname);
    } else if (this.config.type === 's3' && this.s3Client) {
      await this.ensureBucket();
      
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket!,
        Key: pathname,
      });

      await this.s3Client.send(command);
    }
  }

  getPublicUrl(pathname: string): string {
    if (this.config.type === 'vercel') {
      // Vercel Blob URLs are returned from the put operation
      throw new Error('Use the URL returned from put() for Vercel Blob');
    } else if (this.config.type === 'minio') {
      const protocol = this.config.useSSL ? 'https' : 'http';
      const endpoint = this.config.endpoint!.replace(/^https?:\/\//, '');
      return `${protocol}://${endpoint}/${this.config.bucket}/${pathname}`;
    } else if (this.config.type === 's3') {
      // S3 public URL
      return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${pathname}`;
    }
    
    throw new Error('No blob storage configured');
  }
}

// Export singleton instance
export const blobStorage = new BlobStorage();