import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import AddVideoForm from '../../src/components/AddVideoForm'

describe('AddVideoForm', () => {
  it('calls onAdd with normalized URL and clears input', () => {
    const onAdd = vi.fn()
    render(<AddVideoForm onAdd={onAdd} />)
    const input = screen.getByLabelText('YouTube URL') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'https://youtu.be/dQw4w9WgXcQ' } })
    const button = screen.getByRole('button', { name: /add/i })
    fireEvent.click(button)
    expect(onAdd).toHaveBeenCalledWith('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(input.value).toBe('')
  })

  it('shows an error for invalid url', () => {
    const onAdd = vi.fn()
    render(<AddVideoForm onAdd={onAdd} />)
    const input = screen.getByLabelText('YouTube URL') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'not a url' } })
    const button = screen.getByRole('button', { name: /add/i })
    fireEvent.click(button)
    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeTruthy()
  })
})
