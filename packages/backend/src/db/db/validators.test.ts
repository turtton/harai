import { describe, expect, it } from 'vitest'
import {
  articleQuerySchema,
  articleSlugSchema,
  imageCacheCreateSchema,
  imageQuerySchema,
  resourceParamsSchema,
} from '@/db/validators'

describe('Validators', () => {
  describe('articleQuerySchema', () => {
    it('should validate valid query parameters', () => {
      const validQuery = {
        limit: '10',
        offset: '0',
        tag: 'test',
        search: 'article',
      }

      const result = articleQuerySchema.safeParse(validQuery)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.limit).toBe(10)
        expect(result.data.offset).toBe(0)
        expect(result.data.tag).toBe('test')
        expect(result.data.search).toBe('article')
      }
    })

    it('should apply default values', () => {
      const emptyQuery = {}

      const result = articleQuerySchema.safeParse(emptyQuery)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.limit).toBe(20)
        expect(result.data.offset).toBe(0)
      }
    })

    it('should reject invalid limit values', () => {
      const invalidQuery = { limit: '0' }

      const result = articleQuerySchema.safeParse(invalidQuery)
      expect(result.success).toBe(false)
    })

    it('should reject limit exceeding maximum', () => {
      const invalidQuery = { limit: '101' }

      const result = articleQuerySchema.safeParse(invalidQuery)
      expect(result.success).toBe(false)
    })

    it('should reject tag exceeding maximum length', () => {
      const invalidQuery = { tag: 'a'.repeat(51) }

      const result = articleQuerySchema.safeParse(invalidQuery)
      expect(result.success).toBe(false)
    })
  })

  describe('articleSlugSchema', () => {
    it('should validate valid slug', () => {
      const validSlug = { slug: 'valid-slug-123' }

      const result = articleSlugSchema.safeParse(validSlug)
      expect(result.success).toBe(true)
    })

    it('should reject slug with uppercase letters', () => {
      const invalidSlug = { slug: 'Invalid-Slug' }

      const result = articleSlugSchema.safeParse(invalidSlug)
      expect(result.success).toBe(false)
    })

    it('should reject slug with spaces', () => {
      const invalidSlug = { slug: 'invalid slug' }

      const result = articleSlugSchema.safeParse(invalidSlug)
      expect(result.success).toBe(false)
    })

    it('should reject slug with special characters', () => {
      const invalidSlug = { slug: 'invalid_slug@#' }

      const result = articleSlugSchema.safeParse(invalidSlug)
      expect(result.success).toBe(false)
    })
  })

  describe('imageQuerySchema', () => {
    it('should validate valid image query', () => {
      const validQuery = {
        w: '800',
        h: '600',
        f: 'webp',
      }

      const result = imageQuerySchema.safeParse(validQuery)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.w).toBe(800)
        expect(result.data.h).toBe(600)
        expect(result.data.f).toBe('webp')
      }
    })

    it('should allow optional parameters', () => {
      const partialQuery = { w: '800' }

      const result = imageQuerySchema.safeParse(partialQuery)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.w).toBe(800)
        expect(result.data.h).toBeUndefined()
        expect(result.data.f).toBeUndefined()
      }
    })

    it('should reject invalid dimensions', () => {
      const invalidQuery = { w: '0' }

      const result = imageQuerySchema.safeParse(invalidQuery)
      expect(result.success).toBe(false)
    })

    it('should reject dimensions exceeding maximum', () => {
      const invalidQuery = { w: '2001' }

      const result = imageQuerySchema.safeParse(invalidQuery)
      expect(result.success).toBe(false)
    })

    it('should reject invalid format', () => {
      const invalidQuery = { f: 'bmp' }

      const result = imageQuerySchema.safeParse(invalidQuery)
      expect(result.success).toBe(false)
    })
  })

  describe('imageCacheCreateSchema', () => {
    it('should validate valid cache creation data', () => {
      const validData = {
        width: 800,
        height: 600,
        format: 'webp',
        cached_r2_key: 'cache/image-800x600.webp',
      }

      const result = imageCacheCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should allow optional height and format', () => {
      const partialData = {
        width: 800,
        cached_r2_key: 'cache/image-800.webp',
      }

      const result = imageCacheCreateSchema.safeParse(partialData)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const invalidData = { width: 800 }

      const result = imageCacheCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('resourceParamsSchema', () => {
    it('should validate valid resource parameters', () => {
      const validParams = {
        articleId: 'article-123',
        slug: 'resource-slug',
      }

      const result = resourceParamsSchema.safeParse(validParams)
      expect(result.success).toBe(true)
    })

    it('should reject empty parameters', () => {
      const invalidParams = {
        articleId: '',
        slug: 'resource-slug',
      }

      const result = resourceParamsSchema.safeParse(invalidParams)
      expect(result.success).toBe(false)
    })
  })
})
