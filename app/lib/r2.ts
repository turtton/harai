import { R2Error, R2UploadError } from './r2-errors'

export interface R2Service {
  upload(key: string, data: ArrayBuffer, contentType?: string): Promise<void>
  get(key: string): Promise<R2Object | null>
  delete(key: string): Promise<void>
  list(prefix?: string): Promise<R2Objects>
  /**
   * Generate a signed URL for accessing the object
   * @param key - The object key
   * @param expiresIn - Expiration time in seconds (default: 3600)
   */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>
}

export class CloudflareR2Service implements R2Service {
  constructor(private r2: R2Bucket) {}

  async upload(key: string, data: ArrayBuffer, contentType?: string): Promise<void> {
    if (!key || key.trim().length === 0) {
      throw new R2Error('Key cannot be empty', 'INVALID_KEY')
    }
    if (data.byteLength === 0) {
      throw new R2Error('Data cannot be empty', 'INVALID_DATA')
    }
    
    try {
      await this.r2.put(key, data, {
        httpMetadata: contentType ? { contentType } : undefined,
      })
    } catch (error) {
      throw new R2UploadError(key, error)
    }
  }

  async get(key: string): Promise<R2Object | null> {
    if (!key || key.trim().length === 0) {
      throw new R2Error('Key cannot be empty', 'INVALID_KEY')
    }
    
    try {
      return await this.r2.get(key)
    } catch (_error) {
      throw new R2Error(`Failed to get object: ${key}`, 'GET_FAILED')
    }
  }

  async delete(key: string): Promise<void> {
    if (!key || key.trim().length === 0) {
      throw new R2Error('Key cannot be empty', 'INVALID_KEY')
    }
    
    try {
      await this.r2.delete(key)
    } catch (_error) {
      throw new R2Error(`Failed to delete object: ${key}`, 'DELETE_FAILED')
    }
  }

  async list(prefix?: string): Promise<R2Objects> {
    try {
      return await this.r2.list({ prefix })
    } catch (_error) {
      throw new R2Error(`Failed to list objects with prefix: ${prefix}`, 'LIST_FAILED')
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!key || key.trim().length === 0) {
      throw new R2Error('Key cannot be empty', 'INVALID_KEY')
    }
    if (expiresIn <= 0) {
      throw new R2Error('Expiration time must be positive', 'INVALID_EXPIRY')
    }
    
    try {
      return await this.r2.createPresignedUrl(key, 'GET', { expiresIn })
    } catch (_error) {
      throw new R2Error(`Failed to create signed URL for: ${key}`, 'SIGNED_URL_FAILED')
    }
  }
}
