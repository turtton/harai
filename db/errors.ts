// カスタムエラークラスとエラーハンドリングユーティリティ

export class DatabaseError extends Error {
  constructor(
    message: string,
    public operation: string,
    public originalError?: unknown,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(
    message: string,
    public resource: string,
    public identifier?: string
  ) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

// エラー分析とHTTPステータス決定
export function getErrorResponse(error: unknown) {
  if (error instanceof ValidationError) {
    return {
      status: 400,
      success: false,
      error: error.message,
      field: error.field,
      code: error.code,
    }
  }

  if (error instanceof NotFoundError) {
    return {
      status: 404,
      success: false,
      error: error.message,
      resource: error.resource,
      identifier: error.identifier,
    }
  }

  if (error instanceof AuthenticationError) {
    return {
      status: 401,
      success: false,
      error: error.message,
    }
  }

  if (error instanceof AuthorizationError) {
    return {
      status: 403,
      success: false,
      error: error.message,
    }
  }

  if (error instanceof DatabaseError) {
    return {
      status: 500,
      success: false,
      error: 'Database operation failed',
      operation: error.operation,
    }
  }

  // 予期しないエラー
  return {
    status: 500,
    success: false,
    error: 'Internal server error',
  }
}
