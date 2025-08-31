import { describe, expect, it } from 'vitest'
import { R2Error, R2NotFoundError, R2UploadError } from '../../../app/lib/r2-errors'

describe('r2-errors', () => {
  describe('R2Error', () => {
    it('should create R2Error with message and code', () => {
      const error = new R2Error('Test error', 'TEST_CODE')
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(R2Error)
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_CODE')
      expect(error.name).toBe('R2Error')
    })
  })

  describe('R2NotFoundError', () => {
    it('should create R2NotFoundError with correct message and code', () => {
      const key = 'test/missing-file.jpg'
      const error = new R2NotFoundError(key)
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(R2Error)
      expect(error).toBeInstanceOf(R2NotFoundError)
      expect(error.message).toBe(`Object not found: ${key}`)
      expect(error.code).toBe('NOT_FOUND')
    })
  })

  describe('R2UploadError', () => {
    it('should create R2UploadError with correct message and code', () => {
      const key = 'test/upload-file.jpg'
      const error = new R2UploadError(key)
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(R2Error)
      expect(error).toBeInstanceOf(R2UploadError)
      expect(error.message).toBe(`Failed to upload: ${key}`)
      expect(error.code).toBe('UPLOAD_FAILED')
    })

    it('should store the cause when provided', () => {
      const key = 'test/upload-file.jpg'
      const originalError = new Error('Network error')
      const error = new R2UploadError(key, originalError)
      
      expect(error.cause).toBe(originalError)
    })
  })
})