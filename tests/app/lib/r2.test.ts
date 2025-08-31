import { describe, expect, it, vi, beforeEach } from 'vitest'
import { CloudflareR2Service } from '../../../app/lib/r2'
import { R2Error, R2UploadError } from '../../../app/lib/r2-errors'

// Mock R2Bucket
const mockR2Bucket = {
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
  createPresignedUrl: vi.fn(),
}

describe('r2', () => {
  let service: CloudflareR2Service

  beforeEach(() => {
    vi.clearAllMocks()
    service = new CloudflareR2Service(mockR2Bucket as unknown as R2Bucket)
  })

  describe('CloudflareR2Service', () => {
    describe('upload', () => {
      it('should upload file successfully', async () => {
        const key = 'test/file.jpg'
        const data = new ArrayBuffer(1024)
        const contentType = 'image/jpeg'

        mockR2Bucket.put.mockResolvedValueOnce(undefined)

        await service.upload(key, data, contentType)

        expect(mockR2Bucket.put).toHaveBeenCalledWith(key, data, {
          httpMetadata: { contentType },
        })
      })

      it('should throw R2Error for empty key', async () => {
        const data = new ArrayBuffer(1024)

        await expect(service.upload('', data)).rejects.toThrow(R2Error)
        await expect(service.upload('', data)).rejects.toThrow('Key cannot be empty')
        await expect(service.upload('   ', data)).rejects.toThrow('Key cannot be empty')
      })

      it('should throw R2Error for empty data', async () => {
        const key = 'test/file.jpg'
        const data = new ArrayBuffer(0)

        await expect(service.upload(key, data)).rejects.toThrow(R2Error)
        await expect(service.upload(key, data)).rejects.toThrow('Data cannot be empty')
      })

      it('should upload file without content type', async () => {
        const key = 'test/file.jpg'
        const data = new ArrayBuffer(1024)

        mockR2Bucket.put.mockResolvedValueOnce(undefined)

        await service.upload(key, data)

        expect(mockR2Bucket.put).toHaveBeenCalledWith(key, data, {
          httpMetadata: undefined,
        })
      })

      it('should throw R2UploadError on failure', async () => {
        const key = 'test/file.jpg'
        const data = new ArrayBuffer(1024)
        const originalError = new Error('Network error')

        mockR2Bucket.put.mockRejectedValue(originalError)

        await expect(service.upload(key, data)).rejects.toThrow(R2UploadError)
        await expect(service.upload(key, data)).rejects.toThrow(`Failed to upload: ${key}`)
      })
    })

    describe('get', () => {
      it('should get file successfully', async () => {
        const key = 'test/file.jpg'
        const mockObject = { key, body: new ArrayBuffer(1024) }

        mockR2Bucket.get.mockResolvedValueOnce(mockObject)

        const result = await service.get(key)

        expect(result).toBe(mockObject)
        expect(mockR2Bucket.get).toHaveBeenCalledWith(key)
      })

      it('should throw R2Error for empty key', async () => {
        await expect(service.get('')).rejects.toThrow(R2Error)
        await expect(service.get('')).rejects.toThrow('Key cannot be empty')
        await expect(service.get('   ')).rejects.toThrow('Key cannot be empty')
      })

      it('should return null when file not found', async () => {
        const key = 'test/missing.jpg'

        mockR2Bucket.get.mockResolvedValueOnce(null)

        const result = await service.get(key)

        expect(result).toBeNull()
      })

      it('should throw R2Error on failure', async () => {
        const key = 'test/file.jpg'
        const originalError = new Error('Access denied')

        mockR2Bucket.get.mockRejectedValue(originalError)

        await expect(service.get(key)).rejects.toThrow(R2Error)
        await expect(service.get(key)).rejects.toThrow(`Failed to get object: ${key}`)
      })
    })

    describe('delete', () => {
      it('should delete file successfully', async () => {
        const key = 'test/file.jpg'

        mockR2Bucket.delete.mockResolvedValueOnce(undefined)

        await service.delete(key)

        expect(mockR2Bucket.delete).toHaveBeenCalledWith(key)
      })

      it('should throw R2Error for empty key', async () => {
        await expect(service.delete('')).rejects.toThrow(R2Error)
        await expect(service.delete('')).rejects.toThrow('Key cannot be empty')
        await expect(service.delete('   ')).rejects.toThrow('Key cannot be empty')
      })

      it('should throw R2Error on failure', async () => {
        const key = 'test/file.jpg'
        const originalError = new Error('Permission denied')

        mockR2Bucket.delete.mockRejectedValue(originalError)

        await expect(service.delete(key)).rejects.toThrow(R2Error)
        await expect(service.delete(key)).rejects.toThrow(`Failed to delete object: ${key}`)
      })
    })

    describe('list', () => {
      it('should list files successfully', async () => {
        const prefix = 'articles/test/'
        const mockList = { objects: [{ key: 'articles/test/file1.jpg' }] }

        mockR2Bucket.list.mockResolvedValueOnce(mockList)

        const result = await service.list(prefix)

        expect(result).toBe(mockList)
        expect(mockR2Bucket.list).toHaveBeenCalledWith({ prefix })
      })

      it('should list all files when no prefix provided', async () => {
        const mockList = { objects: [] }

        mockR2Bucket.list.mockResolvedValueOnce(mockList)

        const result = await service.list()

        expect(result).toBe(mockList)
        expect(mockR2Bucket.list).toHaveBeenCalledWith({ prefix: undefined })
      })

      it('should throw R2Error on failure', async () => {
        const prefix = 'articles/'
        const originalError = new Error('List failed')

        mockR2Bucket.list.mockRejectedValue(originalError)

        await expect(service.list(prefix)).rejects.toThrow(R2Error)
        await expect(service.list(prefix)).rejects.toThrow(`Failed to list objects with prefix: ${prefix}`)
      })
    })

    describe('getSignedUrl', () => {
      it('should generate signed URL with default expiration', async () => {
        const key = 'test/file.jpg'
        const expectedUrl = 'https://example.com/signed-url'

        mockR2Bucket.createPresignedUrl.mockResolvedValueOnce(expectedUrl)

        const result = await service.getSignedUrl(key)

        expect(result).toBe(expectedUrl)
        expect(mockR2Bucket.createPresignedUrl).toHaveBeenCalledWith(key, 'GET', { expiresIn: 3600 })
      })

      it('should generate signed URL with custom expiration', async () => {
        const key = 'test/file.jpg'
        const expiresIn = 7200
        const expectedUrl = 'https://example.com/signed-url'

        mockR2Bucket.createPresignedUrl.mockResolvedValueOnce(expectedUrl)

        const result = await service.getSignedUrl(key, expiresIn)

        expect(result).toBe(expectedUrl)
        expect(mockR2Bucket.createPresignedUrl).toHaveBeenCalledWith(key, 'GET', { expiresIn })
      })

      it('should throw R2Error for empty key', async () => {
        await expect(service.getSignedUrl('')).rejects.toThrow(R2Error)
        await expect(service.getSignedUrl('')).rejects.toThrow('Key cannot be empty')
        await expect(service.getSignedUrl('   ')).rejects.toThrow('Key cannot be empty')
      })

      it('should throw R2Error for invalid expiration', async () => {
        const key = 'test/file.jpg'
        
        await expect(service.getSignedUrl(key, 0)).rejects.toThrow(R2Error)
        await expect(service.getSignedUrl(key, 0)).rejects.toThrow('Expiration time must be positive')
        await expect(service.getSignedUrl(key, -100)).rejects.toThrow('Expiration time must be positive')
      })

      it('should throw R2Error on failure', async () => {
        const key = 'test/file.jpg'
        const originalError = new Error('URL generation failed')

        mockR2Bucket.createPresignedUrl.mockRejectedValue(originalError)

        await expect(service.getSignedUrl(key)).rejects.toThrow(R2Error)
        await expect(service.getSignedUrl(key)).rejects.toThrow(`Failed to create signed URL for: ${key}`)
      })
    })
  })
})