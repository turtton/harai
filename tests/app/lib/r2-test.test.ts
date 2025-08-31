import { describe, expect, it, vi, beforeEach } from 'vitest'
import { testR2Connection } from '../../../app/lib/r2-test'

// Mock R2Bucket
const mockR2Bucket = {
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
}

describe('r2-test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('testR2Connection', () => {
    it('should return true when connection test succeeds', async () => {
      const mockObject = { key: 'test/connection-check', body: new ArrayBuffer(4) }
      
      mockR2Bucket.put.mockResolvedValueOnce(undefined)
      mockR2Bucket.get.mockResolvedValueOnce(mockObject)
      mockR2Bucket.delete.mockResolvedValueOnce(undefined)

      const result = await testR2Connection(mockR2Bucket as unknown as R2Bucket)

      expect(result).toBe(true)
      expect(mockR2Bucket.put).toHaveBeenCalledWith('test/connection-check', expect.any(Uint8Array))
      expect(mockR2Bucket.get).toHaveBeenCalledWith('test/connection-check')
      expect(mockR2Bucket.delete).toHaveBeenCalledWith('test/connection-check')
    })

    it('should return true when retrieved object exists', async () => {
      mockR2Bucket.put.mockResolvedValueOnce(undefined)
      mockR2Bucket.get.mockResolvedValueOnce({ key: 'test', body: new ArrayBuffer(1) })
      mockR2Bucket.delete.mockResolvedValueOnce(undefined)

      const result = await testR2Connection(mockR2Bucket as unknown as R2Bucket)

      expect(result).toBe(true)
    })

    it('should return false when retrieved object is null', async () => {
      mockR2Bucket.put.mockResolvedValueOnce(undefined)
      mockR2Bucket.get.mockResolvedValueOnce(null)
      mockR2Bucket.delete.mockResolvedValueOnce(undefined)

      const result = await testR2Connection(mockR2Bucket as unknown as R2Bucket)

      expect(result).toBe(false)
    })

    it('should return false when put operation fails', async () => {
      mockR2Bucket.put.mockRejectedValueOnce(new Error('Put failed'))

      const result = await testR2Connection(mockR2Bucket as unknown as R2Bucket)

      expect(result).toBe(false)
      expect(mockR2Bucket.get).not.toHaveBeenCalled()
      expect(mockR2Bucket.delete).not.toHaveBeenCalled()
    })

    it('should return false when get operation fails', async () => {
      mockR2Bucket.put.mockResolvedValueOnce(undefined)
      mockR2Bucket.get.mockRejectedValueOnce(new Error('Get failed'))

      const result = await testR2Connection(mockR2Bucket as unknown as R2Bucket)

      expect(result).toBe(false)
      expect(mockR2Bucket.delete).not.toHaveBeenCalled()
    })

    it('should return false when delete operation fails', async () => {
      mockR2Bucket.put.mockResolvedValueOnce(undefined)
      mockR2Bucket.get.mockResolvedValueOnce({ key: 'test', body: new ArrayBuffer(1) })
      mockR2Bucket.delete.mockRejectedValueOnce(new Error('Delete failed'))

      const result = await testR2Connection(mockR2Bucket as unknown as R2Bucket)

      expect(result).toBe(false)
    })

    it('should handle any unexpected error gracefully', async () => {
      mockR2Bucket.put.mockImplementationOnce(() => {
        throw new TypeError('Unexpected error')
      })

      const result = await testR2Connection(mockR2Bucket as unknown as R2Bucket)

      expect(result).toBe(false)
    })
  })
})