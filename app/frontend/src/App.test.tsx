import { CssBaseline, ThemeProvider } from '@mui/material'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { projectsClient } from './modules/projects/infrastructure/projectsClient'
import { rolesClient } from './modules/roles/infrastructure/rolesClient'
import { useCasesClient } from './modules/usecases/infrastructure/useCasesClient'
import { authApi } from './services/authApi'
import { appTheme } from './theme'

vi.mock('./modules/projects/infrastructure/projectsClient', () => ({
  projectsClient: {
    list: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('./modules/usecases/infrastructure/useCasesClient', () => ({
  useCasesClient: {
    listByProject: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('./modules/roles/infrastructure/rolesClient', () => ({
  rolesClient: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('./modules/estimation/infrastructure/estimationClient', () => ({
  estimationClient: {
    estimate: vi.fn(),
  },
}))

vi.mock('./modules/report/infrastructure/reportClient', () => ({
  reportClient: {
    listEstimations: vi.fn(),
    getProjectReport: vi.fn(),
  },
}))

vi.mock('./modules/upcoming/infrastructure/upcomingRepository', () => ({
  upcomingRepository: {
    list: vi.fn(() => []),
  },
}))

vi.mock('./services/authApi', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

const defaultRoles = [
  {
    id: 'role-1',
    key: 'frontend-developer',
    name: 'Frontend Developer',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-2',
    key: 'backend-developer',
    name: 'Backend Developer',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'token-test-123',
      refreshToken: 'refresh-test-123',
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      actor: {
        id: 'qa-actor',
        displayName: 'QA Actor',
        role: 'ADMIN',
      },
    })
    vi.mocked(projectsClient.list).mockResolvedValue([])
    vi.mocked(useCasesClient.listByProject).mockResolvedValue([])
    vi.mocked(rolesClient.list).mockResolvedValue(defaultRoles)
  })

  const loginAsActor = async (user: ReturnType<typeof userEvent.setup>, actorId = 'qa-actor') => {
    await user.type(screen.getByTestId('psai-login-actor-id-input'), actorId)
    await user.type(screen.getByTestId('psai-login-password-input'), 'dev-pass-123')
    await user.click(screen.getByTestId('psai-login-submit-button'))
  }

  it('renders app title and project empty state', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('psai-auth-gate')).toBeInTheDocument()
    await loginAsActor(user)

    expect(screen.getByTestId('psai-app-root')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('psai-home-title')).toHaveTextContent('Inicio')
    })
  })

  it('submits project form and calls create project client', async () => {
    const user = userEvent.setup()
    vi.mocked(projectsClient.create).mockResolvedValue({
      id: 'project-1',
      name: 'MVP Project',
      description: 'This is a valid project description for test',
      complexity: 'MEDIUM',
      createdAt: new Date().toISOString(),
      _count: { useCases: 0 },
    })

    render(
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>,
    )

    await loginAsActor(user)

    await user.click(screen.getByRole('button', { name: 'Nuevo proyecto' }))

    await user.type(screen.getByTestId('psai-project-name-input'), 'MVP Project')
    await user.type(
      screen.getByTestId('psai-project-description-input'),
      'This is a valid project description for test',
    )

    await user.click(screen.getByTestId('psai-project-submit-button'))

    await waitFor(() => {
      expect(projectsClient.create).toHaveBeenCalledWith({
        name: 'MVP Project',
        description: 'This is a valid project description for test',
        complexity: 'MEDIUM',
      })
    })

    await waitFor(() => {
      expect(screen.getByText(
        'Proyecto creado correctamente.',
      )).toBeInTheDocument()
    })
  })
})
