import { describe, it, expect } from 'vitest'
import {
  CACHE_RETENTION_DAYS,
  CACHE_RETENTION_MS,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  MAX_SLUG_LENGTH,
  MAX_TAG_LENGTH,
  MAX_SEARCH_QUERY_LENGTH,
  MAX_IMAGE_KEY_LENGTH,
  MAX_IMAGE_WIDTH,
  MAX_IMAGE_HEIGHT,
  SUPPORTED_IMAGE_FORMATS,
} from '../../db/constants'

describe('Database Constants', () => {
  describe('Cache settings', () => {
    it('should have correct cache retention values', () => {
      expect(CACHE_RETENTION_DAYS).toBe(30)
      expect(CACHE_RETENTION_MS).toBe(30 * 24 * 60 * 60 * 1000)
      expect(CACHE_RETENTION_MS).toBe(2592000000) // 30 days in milliseconds
    })
  })

  describe('Pagination settings', () => {
    it('should have reasonable pagination limits', () => {
      expect(DEFAULT_PAGE_LIMIT).toBe(20)
      expect(MAX_PAGE_LIMIT).toBe(100)
      expect(MAX_PAGE_LIMIT).toBeGreaterThan(DEFAULT_PAGE_LIMIT)
    })
  })

  describe('String length limits', () => {
    it('should have appropriate string length constraints', () => {
      expect(MAX_SLUG_LENGTH).toBe(255)
      expect(MAX_TAG_LENGTH).toBe(50)
      expect(MAX_SEARCH_QUERY_LENGTH).toBe(255)
      expect(MAX_IMAGE_KEY_LENGTH).toBe(500)
      
      // Ensure reasonable hierarchy
      expect(MAX_TAG_LENGTH).toBeLessThan(MAX_SLUG_LENGTH)
      expect(MAX_IMAGE_KEY_LENGTH).toBeGreaterThan(MAX_SLUG_LENGTH)
    })
  })

  describe('Image processing settings', () => {
    it('should have reasonable image dimension limits', () => {
      expect(MAX_IMAGE_WIDTH).toBe(2000)
      expect(MAX_IMAGE_HEIGHT).toBe(2000)
    })

    it('should support common web image formats', () => {
      expect(SUPPORTED_IMAGE_FORMATS).toEqual(['webp', 'png', 'jpg', 'jpeg'])
      expect(SUPPORTED_IMAGE_FORMATS).toContain('webp') // Modern format
      expect(SUPPORTED_IMAGE_FORMATS).toContain('png') // Lossless
      expect(SUPPORTED_IMAGE_FORMATS).toContain('jpg') // Common format
      expect(SUPPORTED_IMAGE_FORMATS).toContain('jpeg') // Alternative name
    })
  })
})