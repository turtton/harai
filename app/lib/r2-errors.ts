export class R2Error extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'R2Error'
  }
}

export class R2NotFoundError extends R2Error {
  constructor(key: string) {
    super(`Object not found: ${key}`, 'NOT_FOUND')
  }
}

export class R2UploadError extends R2Error {
  constructor(key: string, cause?: unknown) {
    super(`Failed to upload: ${key}`, 'UPLOAD_FAILED')
    this.cause = cause
  }
}