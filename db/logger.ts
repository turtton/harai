// 構造化ログ出力のためのユーティリティ

export interface LogContext {
  [key: string]: unknown
}

export function logError(message: string, error: unknown, context?: LogContext) {
  const logEntry = {
    level: 'error',
    message,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : String(error),
    context,
    timestamp: new Date().toISOString(),
  }
  console.error(JSON.stringify(logEntry))
}

export function logWarn(message: string, context?: LogContext) {
  const logEntry = {
    level: 'warn',
    message,
    context,
    timestamp: new Date().toISOString(),
  }
  console.warn(JSON.stringify(logEntry))
}

export function logInfo(message: string, context?: LogContext) {
  const logEntry = {
    level: 'info',
    message,
    context,
    timestamp: new Date().toISOString(),
  }
  console.log(JSON.stringify(logEntry))
}

export function logDebug(message: string, context?: LogContext) {
  const logEntry = {
    level: 'debug',
    message,
    context,
    timestamp: new Date().toISOString(),
  }
  console.debug(JSON.stringify(logEntry))
}
