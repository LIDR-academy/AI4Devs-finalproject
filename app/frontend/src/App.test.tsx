import { CssBaseline, ThemeProvider } from '@mui/material'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { appTheme } from './theme'

const jsonResponse = (data: unknown, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders app title and project empty state', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)

    render(
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('psai-home-title')).toHaveTextContent('ProjectScope AI')

    await waitFor(() => {
      expect(screen.getByTestId('psai-project-list-empty')).toBeInTheDocument()
    })
  })

  it('submits project form and calls API', async () => {
    const user = userEvent.setup()

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'project-1',
          name: 'MVP Project',
          description: 'This is a valid project description for test',
          complexity: 'MEDIUM',
          createdAt: new Date().toISOString(),
        }, 201),
      )
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 'project-1',
            name: 'MVP Project',
            description: 'This is a valid project description for test',
            complexity: 'MEDIUM',
            createdAt: new Date().toISOString(),
            _count: { useCases: 0 },
          },
        ]),
      )

    vi.stubGlobal('fetch', fetchMock)

    render(
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>,
    )

    await user.type(screen.getByTestId('psai-project-name-input'), 'MVP Project')
    await user.type(
      screen.getByTestId('psai-project-description-input'),
      'This is a valid project description for test',
    )

    await user.click(screen.getByTestId('psai-project-submit-button'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3001/projects',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('psai-project-form-alert')).toHaveTextContent(
        'Proyecto creado correctamente.',
      )
    })
  })
})
