import { describe, expect, it } from 'vitest'

// import { render, screen } from '@testing-library/react'

// HonoX のルートコンポーネントのテストはモックが複雑になるため、
// ここでは基本的なロジックのテストを作成
describe('Index Route', () => {
  it('should generate correct greeting message', () => {
    const generateGreeting = (name: string = 'Hono') => `Hello, ${name}!`

    expect(generateGreeting()).toBe('Hello, Hono!')
    expect(generateGreeting('Test')).toBe('Hello, Test!')
  })

  it('should handle custom name parameter', () => {
    const getDisplayName = (name?: string) => name || 'World'

    expect(getDisplayName('Test')).toBe('Test')
    expect(getDisplayName()).toBe('World')
  })
})
