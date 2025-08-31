import { describe, expect, it } from 'vitest'
import {
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  getErrorResponse,
  NotFoundError,
  ValidationError,
} from '../../db/errors'

describe('Error Classes', () => {
  describe('DatabaseError', () => {
    it('should create database error with context', () => {
      const error = new DatabaseError(
        'Database connection failed',
        'connect',
        new Error('Connection timeout'),
        { host: 'localhost', port: 3306 }
      )

      expect(error.name).toBe('DatabaseError')
      expect(error.message).toBe('Database connection failed')
      expect(error.operation).toBe('connect')
      expect(error.context).toEqual({ host: 'localhost', port: 3306 })
      expect(error.originalError).toBeInstanceOf(Error)
    })
  })

  describe('ValidationError', () => {
    it('should create validation error with field and code', () => {
      const error = new ValidationError('Invalid email format', 'email', 'INVALID_FORMAT')

      expect(error.name).toBe('ValidationError')
      expect(error.message).toBe('Invalid email format')
      expect(error.field).toBe('email')
      expect(error.code).toBe('INVALID_FORMAT')
    })
  })

  describe('NotFoundError', () => {
    it('should create not found error with resource info', () => {
      const error = new NotFoundError('User not found', 'user', '123')

      expect(error.name).toBe('NotFoundError')
      expect(error.message).toBe('User not found')
      expect(error.resource).toBe('user')
      expect(error.identifier).toBe('123')
    })
  })

  describe('AuthenticationError', () => {
    it('should create authentication error with default message', () => {
      const error = new AuthenticationError()

      expect(error.name).toBe('AuthenticationError')
      expect(error.message).toBe('Authentication required')
    })

    it('should create authentication error with custom message', () => {
      const error = new AuthenticationError('Invalid credentials')

      expect(error.name).toBe('AuthenticationError')
      expect(error.message).toBe('Invalid credentials')
    })
  })

  describe('AuthorizationError', () => {
    it('should create authorization error with default message', () => {
      const error = new AuthorizationError()

      expect(error.name).toBe('AuthorizationError')
      expect(error.message).toBe('Insufficient permissions')
    })

    it('should create authorization error with custom message', () => {
      const error = new AuthorizationError('Access denied to admin panel')

      expect(error.name).toBe('AuthorizationError')
      expect(error.message).toBe('Access denied to admin panel')
    })
  })
})

describe('getErrorResponse', () => {
  it('should handle ValidationError', () => {
    const error = new ValidationError('Invalid input', 'name', 'REQUIRED')
    const response = getErrorResponse(error)

    expect(response.status).toBe(400)
    expect(response.success).toBe(false)
    expect(response.error).toBe('Invalid input')
    expect(response.field).toBe('name')
    expect(response.code).toBe('REQUIRED')
  })

  it('should handle NotFoundError', () => {
    const error = new NotFoundError('Article not found', 'article', 'test-slug')
    const response = getErrorResponse(error)

    expect(response.status).toBe(404)
    expect(response.success).toBe(false)
    expect(response.error).toBe('Article not found')
    expect(response.resource).toBe('article')
    expect(response.identifier).toBe('test-slug')
  })

  it('should handle AuthenticationError', () => {
    const error = new AuthenticationError('Token expired')
    const response = getErrorResponse(error)

    expect(response.status).toBe(401)
    expect(response.success).toBe(false)
    expect(response.error).toBe('Token expired')
  })

  it('should handle AuthorizationError', () => {
    const error = new AuthorizationError('Admin access required')
    const response = getErrorResponse(error)

    expect(response.status).toBe(403)
    expect(response.success).toBe(false)
    expect(response.error).toBe('Admin access required')
  })

  it('should handle DatabaseError', () => {
    const error = new DatabaseError('Query failed', 'select')
    const response = getErrorResponse(error)

    expect(response.status).toBe(500)
    expect(response.success).toBe(false)
    expect(response.error).toBe('Database operation failed')
    expect(response.operation).toBe('select')
  })

  it('should handle unknown errors', () => {
    const error = new Error('Unknown error')
    const response = getErrorResponse(error)

    expect(response.status).toBe(500)
    expect(response.success).toBe(false)
    expect(response.error).toBe('Internal server error')
  })

  it('should handle non-Error objects', () => {
    const error = 'String error'
    const response = getErrorResponse(error)

    expect(response.status).toBe(500)
    expect(response.success).toBe(false)
    expect(response.error).toBe('Internal server error')
  })
})
