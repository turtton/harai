export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ALLOWED_PDF_TYPE = 'application/pdf'
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFileType(contentType: string, type: 'image' | 'pdf'): boolean {
  if (type === 'image') {
    return ALLOWED_IMAGE_TYPES.includes(contentType)
  }
  return contentType === ALLOWED_PDF_TYPE
}

export function generateR2Key(articleSlug: string, resourceSlug: string, extension: string): string {
  return `articles/${articleSlug}/${resourceSlug}.${extension}`
}

export function generateCacheKey(originalKey: string, width: number, height?: number, format?: string): string {
  const hash = btoa(originalKey).replace(/[+/=]/g, '')
  const dimensions = height ? `${width}x${height}` : `${width}`
  const ext = format || 'webp'
  return `cache/${hash}_${dimensions}.${ext}`
}