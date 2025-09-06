import { R2Error, R2UploadError } from './r2-errors'

export interface R2Service {
  upload(key: string, data: ArrayBuffer, contentType?: string): Promise<void>
  get(key: string): Promise<R2Object | null>
  delete(key: string): Promise<void>
  list(prefix?: string): Promise<R2Objects>
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
}
