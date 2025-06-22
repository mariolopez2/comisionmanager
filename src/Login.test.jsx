import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, test, expect } from 'vitest'
import Login from './Login.jsx'

test('submitting the form calls onLogin with credentials', async () => {
  const onLogin = vi.fn()
  render(<Login onLogin={onLogin} />)
  fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'myuser' } })
  fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'mypassword' } })
  fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
  await waitFor(() => {
    expect(onLogin).toHaveBeenCalledWith('myuser', 'mypassword')
  })
})
