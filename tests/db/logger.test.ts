import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { logDebug, logError, logInfo, logWarn } from '../../db/logger'

describe('Logger Functions', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('logError', () => {
    it('should log error with Error object', () => {
      const error = new Error('Test error')
      const context = { userId: 123 }

      logError('Something went wrong', error, context)

      expect(consoleErrorSpy).toHaveBeenCalledOnce()

      const loggedMessage = consoleErrorSpy.mock.calls[0][0] as string
      const parsedLog = JSON.parse(loggedMessage)

      expect(parsedLog.level).toBe('error')
      expect(parsedLog.message).toBe('Something went wrong')
      expect(parsedLog.error.name).toBe('Error')
      expect(parsedLog.error.message).toBe('Test error')
      expect(parsedLog.error.stack).toBeDefined()
      expect(parsedLog.context).toEqual({ userId: 123 })
      expect(parsedLog.timestamp).toBeDefined()
    })

    it('should log error with non-Error object', () => {
      const error = 'String error'

      logError('Something went wrong', error)

      expect(consoleErrorSpy).toHaveBeenCalledOnce()

      const loggedMessage = consoleErrorSpy.mock.calls[0][0] as string
      const parsedLog = JSON.parse(loggedMessage)

      expect(parsedLog.error).toBe('String error')
    })

    it('should log error without context', () => {
      const error = new Error('Test error')

      logError('Something went wrong', error)

      expect(consoleErrorSpy).toHaveBeenCalledOnce()

      const loggedMessage = consoleErrorSpy.mock.calls[0][0] as string
      const parsedLog = JSON.parse(loggedMessage)

      expect(parsedLog.context).toBeUndefined()
    })
  })

  describe('logWarn', () => {
    it('should log warning message', () => {
      const context = { feature: 'deprecated' }

      logWarn('This feature is deprecated', context)

      expect(consoleWarnSpy).toHaveBeenCalledOnce()

      const loggedMessage = consoleWarnSpy.mock.calls[0][0] as string
      const parsedLog = JSON.parse(loggedMessage)

      expect(parsedLog.level).toBe('warn')
      expect(parsedLog.message).toBe('This feature is deprecated')
      expect(parsedLog.context).toEqual({ feature: 'deprecated' })
      expect(parsedLog.timestamp).toBeDefined()
    })
  })

  describe('logInfo', () => {
    it('should log info message', () => {
      const context = { operation: 'startup' }

      logInfo('Application started', context)

      expect(consoleLogSpy).toHaveBeenCalledOnce()

      const loggedMessage = consoleLogSpy.mock.calls[0][0] as string
      const parsedLog = JSON.parse(loggedMessage)

      expect(parsedLog.level).toBe('info')
      expect(parsedLog.message).toBe('Application started')
      expect(parsedLog.context).toEqual({ operation: 'startup' })
      expect(parsedLog.timestamp).toBeDefined()
    })
  })

  describe('logDebug', () => {
    it('should log debug message', () => {
      const context = { queryTime: 50 }

      logDebug('Database query executed', context)

      expect(consoleDebugSpy).toHaveBeenCalledOnce()

      const loggedMessage = consoleDebugSpy.mock.calls[0][0] as string
      const parsedLog = JSON.parse(loggedMessage)

      expect(parsedLog.level).toBe('debug')
      expect(parsedLog.message).toBe('Database query executed')
      expect(parsedLog.context).toEqual({ queryTime: 50 })
      expect(parsedLog.timestamp).toBeDefined()
    })
  })

  describe('Log format consistency', () => {
    it('should have consistent timestamp format across all log levels', () => {
      const beforeTime = Date.now()

      logError('Error message', new Error())
      logWarn('Warning message')
      logInfo('Info message')
      logDebug('Debug message')

      const afterTime = Date.now()

      // Check that all logs have valid timestamps
      const errorLog = JSON.parse(consoleErrorSpy.mock.calls[0][0] as string)
      const warnLog = JSON.parse(consoleWarnSpy.mock.calls[0][0] as string)
      const infoLog = JSON.parse(consoleLogSpy.mock.calls[0][0] as string)
      const debugLog = JSON.parse(consoleDebugSpy.mock.calls[0][0] as string)

      const errorTime = new Date(errorLog.timestamp).getTime()
      const warnTime = new Date(warnLog.timestamp).getTime()
      const infoTime = new Date(infoLog.timestamp).getTime()
      const debugTime = new Date(debugLog.timestamp).getTime()

      expect(errorTime).toBeGreaterThanOrEqual(beforeTime)
      expect(errorTime).toBeLessThanOrEqual(afterTime)
      expect(warnTime).toBeGreaterThanOrEqual(beforeTime)
      expect(warnTime).toBeLessThanOrEqual(afterTime)
      expect(infoTime).toBeGreaterThanOrEqual(beforeTime)
      expect(infoTime).toBeLessThanOrEqual(afterTime)
      expect(debugTime).toBeGreaterThanOrEqual(beforeTime)
      expect(debugTime).toBeLessThanOrEqual(afterTime)
    })
  })
})
