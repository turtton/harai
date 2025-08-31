import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Counter from './counter'

describe('Counter', () => {
  it('should render initial count as 0', () => {
    render(<Counter />)
    expect(screen.getByText('0')).toBeDefined()
  })

  it('should increment count when button is clicked', () => {
    render(<Counter />)
    const button = screen.getByRole('button', { name: 'Increment' })
    
    fireEvent.click(button)
    expect(screen.getByText('1')).toBeDefined()
    
    fireEvent.click(button)
    expect(screen.getByText('2')).toBeDefined()
  })

  it('should render button with correct text', () => {
    render(<Counter />)
    expect(screen.getByRole('button', { name: 'Increment' })).toBeDefined()
  })
})