import { describe, expect, it } from 'vitest'
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_PDF_TYPE,
  MAX_FILE_SIZE,
  validateFileType,
  validateFileSize,
  sanitizeSlug,
  sanitizeExtension,
  generateR2Key,
  generateCacheKey,
} from '../../../app/lib/file-utils'

describe('file-utils', () => {
  describe('validateFileType', () => {
    it('should validate image types correctly', () => {
      expect(validateFileType('image/jpeg', 'image')).toBe(true)
      expect(validateFileType('image/png', 'image')).toBe(true)
      expect(validateFileType('image/webp', 'image')).toBe(true)
      expect(validateFileType('image/gif', 'image')).toBe(true)
      expect(validateFileType('text/plain', 'image')).toBe(false)
      expect(validateFileType('application/pdf', 'image')).toBe(false)
    })

    it('should validate PDF type correctly', () => {
      expect(validateFileType('application/pdf', 'pdf')).toBe(true)
      expect(validateFileType('image/jpeg', 'pdf')).toBe(false)
      expect(validateFileType('text/plain', 'pdf')).toBe(false)
    })
  })

  describe('validateFileSize', () => {
    it('should validate file size correctly', () => {
      expect(validateFileSize(1024)).toBe(true)
      expect(validateFileSize(MAX_FILE_SIZE)).toBe(true)
      expect(validateFileSize(MAX_FILE_SIZE + 1)).toBe(false)
      expect(validateFileSize(0)).toBe(true)
    })
  })

  describe('sanitizeSlug', () => {
    it('should sanitize path traversal characters', () => {
      expect(sanitizeSlug('../test')).toBe('---test')
      expect(sanitizeSlug('test/../file')).toBe('test----file')
      expect(sanitizeSlug('test\\file')).toBe('test-file')
      expect(sanitizeSlug('test.file')).toBe('test-file')
    })

    it('should convert to lowercase', () => {
      expect(sanitizeSlug('TestFile')).toBe('testfile')
      expect(sanitizeSlug('UPPERCASE')).toBe('uppercase')
    })

    it('should handle normal slugs', () => {
      expect(sanitizeSlug('normal-slug')).toBe('normal-slug')
      expect(sanitizeSlug('test_file')).toBe('test_file')
      expect(sanitizeSlug('123abc')).toBe('123abc')
    })
  })

  describe('sanitizeExtension', () => {
    it('should remove non-alphanumeric characters', () => {
      expect(sanitizeExtension('jpg')).toBe('jpg')
      expect(sanitizeExtension('p.d.f')).toBe('pdf')
      expect(sanitizeExtension('web-p')).toBe('webp')
      expect(sanitizeExtension('jpeg!')).toBe('jpeg')
      expect(sanitizeExtension('../exe')).toBe('exe')
    })

    it('should convert to lowercase', () => {
      expect(sanitizeExtension('JPG')).toBe('jpg')
      expect(sanitizeExtension('PNG')).toBe('png')
      expect(sanitizeExtension('PDF')).toBe('pdf')
    })

    it('should handle empty and special cases', () => {
      expect(sanitizeExtension('')).toBe('')
      expect(sanitizeExtension('123')).toBe('123')
      expect(sanitizeExtension('!@#$%')).toBe('')
    })
  })

  describe('generateR2Key', () => {
    it('should generate correct R2 key with sanitization', () => {
      const result = generateR2Key('my-article', 'my-image', 'jpg')
      expect(result).toBe('articles/my-article/my-image.jpg')
    })

    it('should sanitize dangerous input', () => {
      const result = generateR2Key('../malicious', 'test\\file', 'png')
      expect(result).toBe('articles/---malicious/test-file.png')
    })

    it('should handle uppercase input', () => {
      const result = generateR2Key('Article-Slug', 'Image.Name', 'PNG')
      expect(result).toBe('articles/article-slug/image-name.png')
    })

    it('should sanitize malicious extension', () => {
      const result = generateR2Key('test', 'file', '../exe')
      expect(result).toBe('articles/test/file.exe')
    })

    it('should handle special characters in extension', () => {
      const result = generateR2Key('test', 'file', 'jp!g')
      expect(result).toBe('articles/test/file.jpg')
    })
  })

  describe('generateCacheKey', () => {
    it('should generate cache key with dimensions', () => {
      const result = generateCacheKey('test/image.jpg', 800, 600, 'webp')
      expect(result).toBe('cache/dGVzdC9pbWFnZS5qcGc_800x600.webp')
    })

    it('should generate cache key without height', () => {
      const result = generateCacheKey('test/image.jpg', 800)
      expect(result).toBe('cache/dGVzdC9pbWFnZS5qcGc_800.webp')
    })

    it('should use default format when not specified', () => {
      const result = generateCacheKey('test/image.jpg', 800, 600)
      expect(result).toBe('cache/dGVzdC9pbWFnZS5qcGc_800x600.webp')
    })

    it('should handle special characters in original key', () => {
      const result = generateCacheKey('test/image+name=special.jpg', 400)
      expect(result).toBe('cache/dGVzdC9pbWFnZStuYW1lPXNwZWNpYWwuanBn_400.webp')
    })

    it('should generate consistent hash for same input', () => {
      const key = 'articles/my-post/image.jpg'
      const result1 = generateCacheKey(key, 500, 300, 'png')
      const result2 = generateCacheKey(key, 500, 300, 'png')
      expect(result1).toBe(result2)
    })

    it('should generate different cache keys for different dimensions', () => {
      const key = 'test/image.jpg'
      const result1 = generateCacheKey(key, 800, 600)
      const result2 = generateCacheKey(key, 400, 300)
      expect(result1).not.toBe(result2)
      expect(result1).toContain('800x600')
      expect(result2).toContain('400x300')
    })
  })

  describe('constants', () => {
    it('should have expected image types', () => {
      expect(ALLOWED_IMAGE_TYPES).toEqual(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    })

    it('should have expected PDF type', () => {
      expect(ALLOWED_PDF_TYPE).toBe('application/pdf')
    })

    it('should have expected max file size (10MB)', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024)
    })
  })
})