export interface R2Service {
  upload(key: string, data: ArrayBuffer, contentType?: string): Promise<void>
  get(key: string): Promise<R2Object | null>
  delete(key: string): Promise<void>
  list(prefix?: string): Promise<R2Objects>
  getSignedUrl(key: string, expiresIn?: number): Promise<string>
}

export class CloudflareR2Service implements R2Service {
  constructor(private r2: R2Bucket) {}

  async upload(key: string, data: ArrayBuffer, contentType?: string): Promise<void> {
    await this.r2.put(key, data, {
      httpMetadata: contentType ? { contentType } : undefined,
    })
  }

  async get(key: string): Promise<R2Object | null> {
    return await this.r2.get(key)
  }

  async delete(key: string): Promise<void> {
    await this.r2.delete(key)
  }

  async list(prefix?: string): Promise<R2Objects> {
    return await this.r2.list({ prefix })
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return await this.r2.createPresignedUrl(key, 'GET', { expiresIn })
  }
}
