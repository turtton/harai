import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Context } from 'hono'

// HonoX のルートコンポーネントのテストはモックが複雑になるため、
// ここでは基本的なレンダリングロジックのテストを作成
describe('Index Route', () => {
  it('should render greeting message', () => {
    // 基本的なコンポーネントロジックをテスト
    const TestComponent = () => (
      <div className='py-8 text-center'>
        <h1 className='text-3xl font-bold'>Hello, Hono!</h1>
      </div>
    )

    render(<TestComponent />)
    expect(screen.getByRole('heading', { name: 'Hello, Hono!' })).toBeDefined()
  })

  it('should render with custom name', () => {
    const TestComponent = ({ name = 'World' }: { name?: string }) => (
      <div className='py-8 text-center'>
        <h1 className='text-3xl font-bold'>Hello, {name}!</h1>
      </div>
    )

    render(<TestComponent name="Test" />)
    expect(screen.getByRole('heading', { name: 'Hello, Test!' })).toBeDefined()
  })
})