import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock MinIO SDK
vi.mock('minio', () => ({
  Client: class MockMinioClient {
    bucketExists = vi.fn();
    makeBucket = vi.fn();
    putObject = vi.fn();
    removeObject = vi.fn();
    presignedGetObject = vi.fn();
  }
}));

// Mock AWS SDK modules before importing
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class MockS3Client {
    send = vi.fn();
  },
  HeadBucketCommand: class MockHeadBucketCommand {
    constructor(public input: any) {}
  },
  CreateBucketCommand: class MockCreateBucketCommand {
    constructor(public input: any) {}
  },
  PutObjectCommand: class MockPutObjectCommand {
    constructor(public input: any) {}
  },
  GetObjectCommand: class MockGetObjectCommand {
    constructor(public input: any) {}
  },
  DeleteObjectCommand: class MockDeleteObjectCommand {
    constructor(public input: any) {}
  }
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn()
}));

vi.mock('@vercel/blob', () => ({
  put: vi.fn()
}));

// Import after mocking
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, HeadBucketCommand, CreateBucketCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as Minio from 'minio';

describe('Blob Storage Service', () => {
  let blobStorage: any;
  let mockS3Client: any;
  let mockMinioClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset environment variables
    process.env.BLOB_STORAGE_TYPE = 'minio';
    process.env.MINIO_ENDPOINT = 'http://localhost:9100';
    process.env.MINIO_ACCESS_KEY = 'testkey';
    process.env.MINIO_SECRET_KEY = 'testsecret';
    process.env.MINIO_BUCKET = 'test-bucket';
    
    // Clear module cache to reload with new env vars
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('MinIO Storage', () => {
    beforeEach(async () => {
      // Create mock instance
      mockMinioClient = {
        bucketExists: vi.fn(),
        makeBucket: vi.fn(),
        putObject: vi.fn(),
        removeObject: vi.fn(),
        presignedGetObject: vi.fn(),
      };
      
      // Mock the constructor to return our mock instance
      vi.mocked(Minio.Client).mockImplementation(() => mockMinioClient);
      
      // Import after setting up mocks
      const module = await import('@/lib/services/blob-storage');
      blobStorage = module.blobStorage;
    });

    describe('Auto bucket creation', () => {
      it('should create bucket if it does not exist', async () => {
        // Mock bucket doesn't exist
        mockMinioClient.bucketExists.mockResolvedValueOnce(false);
        
        // Mock successful bucket creation
        mockMinioClient.makeBucket.mockResolvedValueOnce(undefined);
        
        // Mock successful file upload
        mockMinioClient.putObject.mockResolvedValueOnce({});

        const result = await blobStorage.put('test.txt', Buffer.from('test content'));

        // Should have called bucketExists first
        expect(mockMinioClient.bucketExists).toHaveBeenCalledWith('test-bucket');
        
        // Should have called makeBucket
        expect(mockMinioClient.makeBucket).toHaveBeenCalledWith('test-bucket', 'us-east-1');
        
        // Should have called putObject
        expect(mockMinioClient.putObject).toHaveBeenCalledWith(
          'test-bucket',
          'test.txt',
          expect.any(Buffer),
          {}
        );
        
        expect(result.url).toContain('test-bucket/test.txt');
      });

      it('should not create bucket if it already exists', async () => {
        // Mock bucket exists
        mockMinioClient.bucketExists.mockResolvedValueOnce(true);
        
        // Mock successful file upload
        mockMinioClient.putObject.mockResolvedValueOnce({});

        await blobStorage.put('test.txt', Buffer.from('test content'));

        // Should only call bucketExists and putObject
        expect(mockMinioClient.bucketExists).toHaveBeenCalledWith('test-bucket');
        expect(mockMinioClient.makeBucket).not.toHaveBeenCalled();
        expect(mockMinioClient.putObject).toHaveBeenCalledWith(
          'test-bucket',
          'test.txt',
          expect.any(Buffer),
          {}
        );
      });

      it('should cache bucket initialization state', async () => {
        // Mock bucket exists
        mockMinioClient.bucketExists.mockResolvedValueOnce(true);
        mockMinioClient.putObject.mockResolvedValueOnce({});

        // First upload
        await blobStorage.put('test1.txt', Buffer.from('content1'));
        
        // Reset mock calls
        mockMinioClient.bucketExists.mockClear();
        mockMinioClient.putObject.mockResolvedValueOnce({});
        
        // Second upload
        await blobStorage.put('test2.txt', Buffer.from('content2'));

        // Should not check bucket existence again
        expect(mockMinioClient.bucketExists).not.toHaveBeenCalled();
        expect(mockMinioClient.putObject).toHaveBeenCalledWith(
          'test-bucket',
          'test2.txt',
          expect.any(Buffer),
          {}
        );
      });

      it('should throw error if bucket creation fails', async () => {
        // Mock bucket doesn't exist
        mockMinioClient.bucketExists.mockResolvedValueOnce(false);
        
        // Mock bucket creation failure
        mockMinioClient.makeBucket.mockRejectedValueOnce(new Error('Access Denied'));

        await expect(
          blobStorage.put('test.txt', Buffer.from('test content'))
        ).rejects.toThrow('Failed to initialize MinIO bucket');
      });
    });

    describe('File operations', () => {
      beforeEach(() => {
        // Mock bucket exists for all file operations
        mockMinioClient.bucketExists.mockResolvedValueOnce(true);
      });

      it('should upload file with correct parameters', async () => {
        mockMinioClient.putObject.mockResolvedValueOnce({});

        const result = await blobStorage.put('uploads/image.png', Buffer.from('image data'), {
          contentType: 'image/png',
          access: 'public'
        });

        expect(mockMinioClient.putObject).toHaveBeenCalledWith(
          'test-bucket',
          'uploads/image.png',
          expect.any(Buffer),
          {
            'Content-Type': 'image/png'
          }
        );

        expect(result.url).toBe('http://localhost:9100/test-bucket/uploads/image.png');
        expect(result.pathname).toBe('uploads/image.png');
      });

      it('should handle Blob input', async () => {
        mockMinioClient.putObject.mockResolvedValueOnce({});

        const blob = new Blob(['test content'], { type: 'text/plain' });
        await blobStorage.put('test.txt', blob, {
          contentType: 'text/plain'
        });

        expect(mockMinioClient.putObject).toHaveBeenCalledWith(
          'test-bucket',
          'test.txt',
          expect.any(Buffer),
          {
            'Content-Type': 'text/plain'
          }
        );
      });

      it('should generate signed URL for private files', async () => {
        mockMinioClient.putObject.mockResolvedValueOnce({});
        const mockSignedUrl = 'https://signed-url.example.com';
        mockMinioClient.presignedGetObject.mockResolvedValueOnce(mockSignedUrl);

        const result = await blobStorage.put('private/doc.pdf', Buffer.from('pdf data'), {
          access: 'private'
        });

        expect(result.url).toBe(mockSignedUrl);
        expect(mockMinioClient.presignedGetObject).toHaveBeenCalledWith(
          'test-bucket',
          'private/doc.pdf',
          3600
        );
      });

      it('should delete files with bucket check', async () => {
        mockMinioClient.removeObject.mockResolvedValueOnce(undefined);

        await blobStorage.delete('uploads/old-file.txt');

        expect(mockMinioClient.removeObject).toHaveBeenCalledWith(
          'test-bucket',
          'uploads/old-file.txt'
        );
      });

      it('should add random suffix when requested', async () => {
        mockMinioClient.putObject.mockResolvedValueOnce({});

        const result = await blobStorage.put('image.png', Buffer.from('data'), {
          addRandomSuffix: true
        });

        expect(result.pathname).toMatch(/^image\.png-\d+-[a-z0-9]+$/);
      });
    });

    describe('URL generation', () => {
      it('should generate correct public URL for MinIO', () => {
        const url = blobStorage.getPublicUrl('uploads/image.png');
        expect(url).toBe('http://localhost:9100/test-bucket/uploads/image.png');
      });

      it('should handle SSL URLs', async () => {
        process.env.MINIO_USE_SSL = 'true';
        
        // Reload module with new env
        vi.resetModules();
        const module = await import('@/lib/services/blob-storage');
        const sslStorage = module.blobStorage;

        const url = sslStorage.getPublicUrl('uploads/image.png');
        expect(url).toBe('https://localhost:9100/test-bucket/uploads/image.png');
      });
    });
  });

  describe('Vercel Blob Storage', () => {
    beforeEach(async () => {
      process.env.BLOB_STORAGE_TYPE = 'vercel';
      process.env.BLOB_READ_WRITE_TOKEN = 'vercel_token';
      
      vi.resetModules();
      const module = await import('@/lib/services/blob-storage');
      blobStorage = module.blobStorage;
    });

    it('should use Vercel blob put method', async () => {
      const { put: vercelPut } = await import('@vercel/blob');
      vi.mocked(vercelPut).mockResolvedValueOnce({
        url: 'https://blob.vercel.com/test.txt',
        pathname: 'test.txt',
        contentType: 'text/plain',
        contentDisposition: 'inline'
      } as any);

      const result = await blobStorage.put('test.txt', 'test content', {
        contentType: 'text/plain'
      });

      expect(vercelPut).toHaveBeenCalledWith('test.txt', 'test content', {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'text/plain',
        contentDisposition: undefined,
        cacheControlMaxAge: undefined
      });

      expect(result.url).toBe('https://blob.vercel.com/test.txt');
    });

    it('should throw error for delete operation', async () => {
      await expect(
        blobStorage.delete('test.txt')
      ).rejects.toThrow('Delete not implemented for Vercel Blob');
    });

    it('should throw error for getPublicUrl', () => {
      expect(() => blobStorage.getPublicUrl('test.txt'))
        .toThrow('Use the URL returned from put() for Vercel Blob');
    });
  });

  describe('S3 Storage', () => {
    beforeEach(async () => {
      process.env.BLOB_STORAGE_TYPE = 's3';
      process.env.AWS_ACCESS_KEY_ID = 'aws_key';
      process.env.AWS_SECRET_ACCESS_KEY = 'aws_secret';
      process.env.AWS_S3_BUCKET = 's3-bucket';
      process.env.AWS_REGION = 'us-west-2';
      
      // Create mock instance
      mockS3Client = {
        send: vi.fn(),
      };
      
      // Mock the constructor to return our mock instance
      vi.mocked(S3Client).mockImplementation(() => mockS3Client);
      
      vi.resetModules();
      const module = await import('@/lib/services/blob-storage');
      blobStorage = module.blobStorage;
    });

    it('should generate correct S3 public URL', () => {
      const url = blobStorage.getPublicUrl('uploads/image.png');
      expect(url).toBe('https://s3-bucket.s3.us-west-2.amazonaws.com/uploads/image.png');
    });

    it('should use AWS S3 SDK for S3 storage', async () => {
      expect(S3Client).toHaveBeenCalledWith(
        expect.objectContaining({
          region: 'us-west-2',
          credentials: {
            accessKeyId: 'aws_key',
            secretAccessKey: 'aws_secret'
          }
        })
      );
    });

    it('should handle S3 bucket operations', async () => {
      // Mock bucket exists
      mockS3Client.send.mockResolvedValueOnce({});
      // Mock file upload
      mockS3Client.send.mockResolvedValueOnce({});

      const result = await blobStorage.put('test.txt', Buffer.from('content'));

      expect(mockS3Client.send).toHaveBeenCalledTimes(2);
      expect(mockS3Client.send.mock.calls[0][0]).toBeInstanceOf(HeadBucketCommand);
      expect(mockS3Client.send.mock.calls[1][0]).toBeInstanceOf(PutObjectCommand);
      expect(result.url).toBe('https://s3-bucket.s3.us-west-2.amazonaws.com/test.txt');
    });
  });

  describe('Error handling', () => {
    it('should throw error when no storage is configured', async () => {
      process.env.BLOB_STORAGE_TYPE = 'invalid';
      
      vi.resetModules();
      const module = await import('@/lib/services/blob-storage');
      const invalidStorage = module.blobStorage;

      await expect(
        invalidStorage.put('test.txt', 'content')
      ).rejects.toThrow('No blob storage configured');
    });
  });
});