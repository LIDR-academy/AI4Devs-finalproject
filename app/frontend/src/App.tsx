import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import BoltIcon from '@mui/icons-material/Bolt'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import EngineeringIcon from '@mui/icons-material/Engineering'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import InsightsIcon from '@mui/icons-material/Insights'
import MenuIcon from '@mui/icons-material/Menu'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing'
import LogoutIcon from '@mui/icons-material/Logout'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Drawer,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTheme } from '@mui/material/styles'
import { DashboardSection } from './modules/dashboard/view/DashboardSection'
import { EstimationSection } from './modules/estimation/view/EstimationSection'
import { ProjectsSection } from './modules/projects/view/ProjectsSection'
import { ReportSection } from './modules/report/view/ReportSection'
import { RolesSection } from './modules/roles/view/RolesSection'
import { UpcomingSection } from './modules/upcoming/view/UpcomingSection'
import { UseCasesSection } from './modules/usecases/view/UseCasesSection'
import { complexityOptions, priorityOptions } from './modules/shared/core/constants'
import type {
  AgentRole,
  Complexity,
  EstimationResult,
  Priority,
  ProjectEstimationHistoryItem,
  ProjectReport,
  ProjectSummary,
  SectionView,
  SidebarItem,
  UseCaseTableRow,
} from './modules/shared/core/types'
import { estimationClient } from './modules/estimation/infrastructure/estimationClient'
import { projectsClient } from './modules/projects/infrastructure/projectsClient'
import { reportClient } from './modules/report/infrastructure/reportClient'
import { rolesClient } from './modules/roles/infrastructure/rolesClient'
import { upcomingRepository } from './modules/upcoming/infrastructure/upcomingRepository'
import { useCasesClient } from './modules/usecases/infrastructure/useCasesClient'
import { authApi } from './services/authApi'
import { clearAuthSession, readAuthSession, saveAuthSession, type AuthSession } from './services/authSession'
import { AUTH_UNAUTHORIZED_EVENT, getApiErrorMessage, setAuthToken } from './services/http'
import './App.css'

const sidebarItems: SidebarItem[] = [
  { section: 'dashboard', label: 'Inicio', icon: <DashboardCustomizeIcon color="primary" /> },
  { section: 'projects', label: 'Proyectos', icon: <AutoAwesomeIcon color="primary" /> },
  { section: 'usecases', label: 'Casos de uso', icon: <PrecisionManufacturingIcon color="primary" /> },
  { section: 'roles', label: 'Roles', icon: <EngineeringIcon color="primary" /> },
  { section: 'estimation', label: 'Estimacion', icon: <BoltIcon color="primary" /> },
  { section: 'report', label: 'Reporte', icon: <InsightsIcon color="primary" /> },
]

const sectionTitles: Record<SectionView, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Inicio',
    subtitle: 'Vista general con estado actual del sistema.',
  },
  projects: {
    title: 'Proyectos',
    subtitle: 'Gestiona proyectos y crea nuevos desde modal.',
  },
  usecases: {
    title: 'Casos de uso',
    subtitle: 'Consulta y agrega casos asociados a proyectos.',
  },
  roles: {
    title: 'Roles',
    subtitle: 'Administra roles de agentes con operaciones CRUD.',
  },
  estimation: {
    title: 'Estimacion',
    subtitle: 'Configura proyecto, roles y ejecuta la estimacion.',
  },
  report: {
    title: 'Reporte',
    subtitle: 'Analiza resultados y exporta para clientes.',
  },
  upcoming: {
    title: 'Proximas funcionalidades',
    subtitle: 'Listado de funcionalidades futuras del producto (solo lectura).',
  },
}

function App() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  const [sectionView, setSectionView] = useState<SectionView>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => readAuthSession())
  const [loginActorId, setLoginActorId] = useState('')
  const [loginDisplayName, setLoginDisplayName] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [complexity, setComplexity] = useState<Complexity>('MEDIUM')

  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [projectSearch, setProjectSearch] = useState('')
  const [projectFilterComplexity, setProjectFilterComplexity] = useState<'ALL' | Complexity>('ALL')
  const [projectFilterMinUseCases, setProjectFilterMinUseCases] = useState('')
  const [projectPage, setProjectPage] = useState(0)
  const [projectRowsPerPage, setProjectRowsPerPage] = useState(8)

  const [useCaseTitle, setUseCaseTitle] = useState('')
  const [useCaseDescription, setUseCaseDescription] = useState('')
  const [useCasePriority, setUseCasePriority] = useState<Priority>('MEDIUM')
  const [useCaseFilterProject, setUseCaseFilterProject] = useState('')
  const [useCaseFilterTitle, setUseCaseFilterTitle] = useState('')
  const [useCaseFilterPriority, setUseCaseFilterPriority] = useState<'ALL' | Priority>('ALL')
  const [useCasePage, setUseCasePage] = useState(0)
  const [useCaseRowsPerPage, setUseCaseRowsPerPage] = useState(8)

  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [estimationModel, setEstimationModel] = useState('gpt-4o-mini')
  const [estimationResult, setEstimationResult] = useState<EstimationResult | null>(null)
  const [reportProject, setReportProject] = useState<ProjectReport | null>(null)
  const [projectEstimations, setProjectEstimations] = useState<ProjectEstimationHistoryItem[]>([])
  const [selectedReportVersion, setSelectedReportVersion] = useState<string>('latest')

  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [useCasesTable, setUseCasesTable] = useState<UseCaseTableRow[]>([])
  const [agentRoles, setAgentRoles] = useState<AgentRole[]>([])
  const [roleName, setRoleName] = useState('')
  const [roleKey, setRoleKey] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)

  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [useCaseModalOpen, setUseCaseModalOpen] = useState(false)
  const [roleModalOpen, setRoleModalOpen] = useState(false)

  const [isSubmittingProject, setIsSubmittingProject] = useState(false)
  const [isSubmittingUseCase, setIsSubmittingUseCase] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)
  const [isSubmittingRole, setIsSubmittingRole] = useState(false)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isLoadingReport, setIsLoadingReport] = useState(false)
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  const [isLoadingUseCasesTable, setIsLoadingUseCasesTable] = useState(false)

  const [projectMessage, setProjectMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [useCaseMessage, setUseCaseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [estimateMessage, setEstimateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [reportMessage, setReportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [roleMessage, setRoleMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [hasHydratedUiState, setHasHydratedUiState] = useState(false)

  const selectedProject = useMemo(() => {
    return projects.find((project) => project.id === selectedProjectId) ?? null
  }, [projects, selectedProjectId])

  const filteredProjects = useMemo(() => {
    const term = projectSearch.trim().toLowerCase()
    const minUseCases = Number(projectFilterMinUseCases)

    return projects.filter((project) => {
      const matchesSearch =
        term.length === 0 ||
        project.name.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term)

      const matchesComplexity =
        projectFilterComplexity === 'ALL' || (project.complexity ?? 'MEDIUM') === projectFilterComplexity

      const matchesMinUseCases =
        Number.isNaN(minUseCases) || projectFilterMinUseCases.trim().length === 0
          ? true
          : (project._count?.useCases ?? 0) >= minUseCases

      return matchesSearch && matchesComplexity && matchesMinUseCases
    })
  }, [projectFilterComplexity, projectFilterMinUseCases, projectSearch, projects])

  const paginatedProjects = useMemo(() => {
    const start = projectPage * projectRowsPerPage
    return filteredProjects.slice(start, start + projectRowsPerPage)
  }, [filteredProjects, projectPage, projectRowsPerPage])

  const filteredUseCasesTable = useMemo(() => {
    const byProject = useCaseFilterProject.trim().toLowerCase()
    const byTitle = useCaseFilterTitle.trim().toLowerCase()

    return useCasesTable.filter((row) => {
      const matchesProject = byProject.length === 0 || row.project.name.toLowerCase().includes(byProject)
      const matchesTitle = byTitle.length === 0 || row.title.toLowerCase().includes(byTitle)
      const matchesPriority = useCaseFilterPriority === 'ALL' || row.priority === useCaseFilterPriority

      return matchesProject && matchesTitle && matchesPriority
    })
  }, [useCaseFilterPriority, useCaseFilterProject, useCaseFilterTitle, useCasesTable])

  const paginatedUseCases = useMemo(() => {
    const start = useCasePage * useCaseRowsPerPage
    return filteredUseCasesTable.slice(start, start + useCaseRowsPerPage)
  }, [filteredUseCasesTable, useCasePage, useCaseRowsPerPage])

  const activeAgentRoles = useMemo(() => {
    return agentRoles.filter((role) => role.isActive)
  }, [agentRoles])

  const totalUseCases = useMemo(() => {
    return projects.reduce((acc, project) => acc + (project._count?.useCases ?? 0), 0)
  }, [projects])

  const hasProject = projects.length > 0
  const hasUseCase = totalUseCases > 0
  const hasEstimate = Boolean(estimationResult || reportProject?.estimation)

  const workflowProgress = useMemo(() => {
    const completed = [hasProject, hasUseCase, hasEstimate].filter(Boolean).length
    return Math.round((completed / 3) * 100)
  }, [hasEstimate, hasProject, hasUseCase])

  const canSubmitProject = useMemo(() => {
    return name.trim().length >= 3 && description.trim().length >= 10 && !isSubmittingProject
  }, [description, isSubmittingProject, name])

  const canSubmitUseCase = useMemo(() => {
    return (
      selectedProjectId.length > 0 &&
      useCaseTitle.trim().length >= 3 &&
      useCaseDescription.trim().length >= 10 &&
      !isSubmittingUseCase
    )
  }, [isSubmittingUseCase, selectedProjectId, useCaseDescription, useCaseTitle])

  const canEstimate = useMemo(() => {
    return selectedProjectId.length > 0 && selectedRoles.length > 0 && !isEstimating
  }, [isEstimating, selectedProjectId.length, selectedRoles.length])

  const canSubmitRole = useMemo(() => {
    return roleName.trim().length >= 2 && !isSubmittingRole
  }, [isSubmittingRole, roleName])

  const isSuperAdmin = authSession?.role === 'SUPERADMIN'
  const isAdmin = authSession?.role === 'ADMIN'
  const isUser = authSession?.role === 'USER'
  const canCreateProjects = isSuperAdmin || isAdmin
  const canManageRoles = isSuperAdmin || isAdmin

  const sidebarItemsByRole = useMemo(() => {
    if (!authSession) {
      return sidebarItems
    }

    if (isUser) {
      return sidebarItems.filter((item) => item.section !== 'roles')
    }

    return sidebarItems
  }, [authSession, isUser])

  const resetAuthenticatedState = useCallback((message: string) => {
    clearAuthSession()
    setAuthToken(null)
    setAuthSession(null)

    setProjects([])
    setUseCasesTable([])
    setAgentRoles([])
    setProjectEstimations([])
    setReportProject(null)
    setEstimationResult(null)
    setSelectedProjectId('')
    setSelectedRoles([])

    setAuthMessage({ type: 'success', text: message })
  }, [])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isLoggingIn) {
      return
    }

    const normalizedActorId = loginActorId.trim().toLowerCase()
    const normalizedDisplayName = loginDisplayName.trim()
    const normalizedPassword = loginPassword.trim()

    if (normalizedActorId.length < 3) {
      setAuthMessage({ type: 'error', text: 'El identificador de usuario debe tener al menos 3 caracteres.' })
      return
    }

    if (normalizedPassword.length === 0) {
      setAuthMessage({ type: 'error', text: 'Debes ingresar tu clave para iniciar sesion.' })
      return
    }

    setIsLoggingIn(true)
    setAuthMessage(null)

    try {
      const loginResult = await authApi.login({
        actorId: normalizedActorId,
        displayName: normalizedDisplayName || undefined,
        password: normalizedPassword,
      })

      const session: AuthSession = {
        actorId: loginResult.actor.id,
        displayName: loginResult.actor.displayName,
        role: loginResult.actor.role,
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
        expiresAt: loginResult.expiresAt,
        signedInAt: new Date().toISOString(),
      }

      saveAuthSession(session)
      setAuthToken(session.accessToken)
      setAuthSession(session)
      setLoginActorId('')
      setLoginDisplayName('')
      setLoginPassword('')
      setAuthMessage({ type: 'success', text: 'Sesion iniciada correctamente.' })
    } catch (error) {
      setAuthMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo iniciar sesion. Intenta nuevamente.'),
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    void (async () => {
      try {
        await authApi.logout()
      } catch {
        // Si falla la revocacion remota, igual cerramos sesion local.
      } finally {
        resetAuthenticatedState('Sesion cerrada.')
      }
    })()
  }

  const loadProjects = async () => {
    setIsLoadingProjects(true)
    try {
      const data = (await projectsClient.list()) as ProjectSummary[]
      setProjects(data)
      setSelectedProjectId((current) => {
        if (current && data.some((project) => project.id === current)) {
          return current
        }

        return data[0]?.id ?? ''
      })
    } catch (error) {
      setProjectMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'Error inesperado al cargar proyectos.'),
      })
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const loadUseCasesTable = async () => {
    setIsLoadingUseCasesTable(true)
    try {
      const data = (await useCasesClient.listByProject()) as UseCaseTableRow[]
      setUseCasesTable(data)
    } catch (error) {
      setUseCaseMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'Error inesperado al cargar casos de uso.'),
      })
    } finally {
      setIsLoadingUseCasesTable(false)
    }
  }

  const loadAgentRoles = async () => {
    setIsLoadingRoles(true)
    try {
      const data = (await rolesClient.list()) as AgentRole[]
      setAgentRoles(data)
      const activeRoleKeys = data.filter((role) => role.isActive).map((role) => role.key)
      setSelectedRoles((current) => {
        const stillValid = current.filter((role) => activeRoleKeys.includes(role))
        if (stillValid.length > 0) {
          return stillValid
        }
        return activeRoleKeys.slice(0, 2)
      })
    } catch (error) {
      setRoleMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'Error inesperado al cargar roles.'),
      })
    } finally {
      setIsLoadingRoles(false)
    }
  }

  useEffect(() => {
    setAuthToken(authSession?.accessToken ?? null)
  }, [authSession])

  useEffect(() => {
    if (!authSession) {
      return
    }

    const expiresAtMs = Date.parse(authSession.expiresAt)

    if (Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now()) {
      resetAuthenticatedState('Tu sesion expiro. Inicia sesion nuevamente.')
      return
    }

    const timeoutId = window.setTimeout(() => {
      resetAuthenticatedState('Tu sesion expiro. Inicia sesion nuevamente.')
    }, expiresAtMs - Date.now())

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [authSession, resetAuthenticatedState])

  useEffect(() => {
    const onUnauthorized = () => {
      resetAuthenticatedState('Tu sesion ya no es valida. Vuelve a iniciar sesion.')
    }

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)
    }
  }, [resetAuthenticatedState])

  useEffect(() => {
    if (!authSession) {
      return
    }

    void Promise.all([loadProjects(), loadUseCasesTable(), loadAgentRoles()])
  }, [authSession])

  useEffect(() => {
    if (!authSession) {
      return
    }

    if (sectionView === 'upcoming' && !isSuperAdmin) {
      setSectionView('dashboard')
      return
    }

    const allowedSections = new Set(sidebarItemsByRole.map((item) => item.section))

    if (sectionView !== 'upcoming' && !allowedSections.has(sectionView)) {
      setSectionView('dashboard')
    }
  }, [authSession, isSuperAdmin, sectionView, sidebarItemsByRole])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('psai-ui-state')
      if (!raw) {
        setHasHydratedUiState(true)
        return
      }

      const parsed = JSON.parse(raw) as {
        sectionView?: SectionView
        sidebarCollapsed?: boolean
        projectSearch?: string
        projectFilterComplexity?: 'ALL' | Complexity
        projectFilterMinUseCases?: string
        projectPage?: number
        projectRowsPerPage?: number
        useCaseFilterProject?: string
        useCaseFilterTitle?: string
        useCaseFilterPriority?: 'ALL' | Priority
        useCasePage?: number
        useCaseRowsPerPage?: number
        selectedReportVersion?: string
      }

      if (parsed.sectionView) setSectionView(parsed.sectionView)
        if (typeof parsed.sidebarCollapsed === 'boolean') setSidebarCollapsed(parsed.sidebarCollapsed)
      if (typeof parsed.projectSearch === 'string') setProjectSearch(parsed.projectSearch)
      if (parsed.projectFilterComplexity) setProjectFilterComplexity(parsed.projectFilterComplexity)
      if (typeof parsed.projectFilterMinUseCases === 'string') setProjectFilterMinUseCases(parsed.projectFilterMinUseCases)
      if (typeof parsed.projectPage === 'number') setProjectPage(parsed.projectPage)
      if (typeof parsed.projectRowsPerPage === 'number') setProjectRowsPerPage(parsed.projectRowsPerPage)
      if (typeof parsed.useCaseFilterProject === 'string') setUseCaseFilterProject(parsed.useCaseFilterProject)
      if (typeof parsed.useCaseFilterTitle === 'string') setUseCaseFilterTitle(parsed.useCaseFilterTitle)
      if (parsed.useCaseFilterPriority) setUseCaseFilterPriority(parsed.useCaseFilterPriority)
      if (typeof parsed.useCasePage === 'number') setUseCasePage(parsed.useCasePage)
      if (typeof parsed.useCaseRowsPerPage === 'number') setUseCaseRowsPerPage(parsed.useCaseRowsPerPage)
      if (typeof parsed.selectedReportVersion === 'string') setSelectedReportVersion(parsed.selectedReportVersion)
    } catch {
      localStorage.removeItem('psai-ui-state')
    } finally {
      setHasHydratedUiState(true)
    }
  }, [])

  useEffect(() => {
    if (!hasHydratedUiState) {
      return
    }

    localStorage.setItem(
      'psai-ui-state',
      JSON.stringify({
        sectionView,
        sidebarCollapsed,
        projectSearch,
        projectFilterComplexity,
        projectFilterMinUseCases,
        projectPage,
        projectRowsPerPage,
        useCaseFilterProject,
        useCaseFilterTitle,
        useCaseFilterPriority,
        useCasePage,
        useCaseRowsPerPage,
        selectedReportVersion,
      }),
    )
  }, [
    hasHydratedUiState,
    projectFilterComplexity,
    projectFilterMinUseCases,
    projectPage,
    projectRowsPerPage,
    projectSearch,
    sidebarCollapsed,
    sectionView,
    useCaseFilterPriority,
    useCaseFilterProject,
    useCaseFilterTitle,
    useCasePage,
    useCaseRowsPerPage,
    selectedReportVersion,
  ])

  useEffect(() => {
    if (isDesktop) {
      setMobileSidebarOpen(false)
    }
  }, [isDesktop])

  useEffect(() => {
    setProjectPage(0)
  }, [projectFilterComplexity, projectFilterMinUseCases, projectSearch, projects.length])

  useEffect(() => {
    setUseCasePage(0)
  }, [useCaseFilterPriority, useCaseFilterProject, useCaseFilterTitle, useCasesTable.length])

  useEffect(() => {
    setSelectedReportVersion('latest')
    setProjectEstimations([])
  }, [selectedProjectId])

  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmitProject) {
      return
    }

    setIsSubmittingProject(true)
    setProjectMessage(null)

    try {
      const createdProject = await projectsClient.create({
        name: name.trim(),
        description: description.trim(),
        complexity,
      })

      setName('')
      setDescription('')
      setComplexity('MEDIUM')
      setSelectedProjectId(createdProject.id)
      setProjectModalOpen(false)
      setProjectMessage({ type: 'success', text: 'Proyecto creado correctamente.' })
      await loadProjects()
      await loadUseCasesTable()
      setSectionView('projects')
    } catch (error) {
      setProjectMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'Error inesperado al crear el proyecto.'),
      })
    } finally {
      setIsSubmittingProject(false)
    }
  }

  const handleCreateUseCase = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmitUseCase) {
      return
    }

    setIsSubmittingUseCase(true)
    setUseCaseMessage(null)

    try {
      await useCasesClient.create(selectedProjectId, {
        title: useCaseTitle.trim(),
        description: useCaseDescription.trim(),
        priority: useCasePriority,
      })

      setUseCaseTitle('')
      setUseCaseDescription('')
      setUseCasePriority('MEDIUM')
      setUseCaseModalOpen(false)
      setUseCaseMessage({ type: 'success', text: 'Caso de uso agregado correctamente.' })
      await loadProjects()
      await loadUseCasesTable()
      setSectionView('usecases')
    } catch (error) {
      setUseCaseMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'Error inesperado al crear el caso de uso.'),
      })
    } finally {
      setIsSubmittingUseCase(false)
    }
  }

  const toggleRole = (role: string) => {
    setSelectedRoles((current) => {
      if (current.includes(role)) {
        return current.filter((item) => item !== role)
      }

      return [...current, role]
    })
  }

  const loadProjectEstimations = async (projectId: string) => {
    if (!projectId) {
      setProjectEstimations([])
      return
    }

    try {
      const data = await reportClient.listEstimations(projectId)
      setProjectEstimations(data)
    } catch (error) {
      setProjectEstimations([])
      setReportMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'Error inesperado al cargar historial.'),
      })
    }
  }

  const loadProjectReport = async (projectId: string, version?: number) => {
    if (!projectId) {
      return
    }

    setIsLoadingReport(true)
    setReportMessage(null)

    try {
      const report = await reportClient.getProjectReport(projectId, version)
      setReportProject(report)
      setReportMessage({ type: 'success', text: 'Reporte actualizado.' })
    } catch (error) {
      setReportMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'Error inesperado al cargar reporte.'),
      })
    } finally {
      setIsLoadingReport(false)
    }
  }

  const handleEstimate = async () => {
    if (!canEstimate) {
      return
    }

    setIsEstimating(true)
    setEstimateMessage(null)

    try {
      const estimation = await estimationClient.estimate(selectedProjectId, {
        roles: selectedRoles,
        model: estimationModel.trim(),
      })

      setEstimationResult(estimation)
      setEstimateMessage({ type: 'success', text: 'Estimación generada correctamente.' })
      setSelectedReportVersion('latest')
      await loadProjectEstimations(selectedProjectId)
      await loadProjectReport(selectedProjectId)
      await loadProjects()
      await loadUseCasesTable()
    } catch (error) {
      setEstimateMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'Error inesperado al estimar.'),
      })
    } finally {
      setIsEstimating(false)
    }
  }

  const resetRoleForm = () => {
    setEditingRoleId(null)
    setRoleName('')
    setRoleKey('')
    setRoleDescription('')
  }

  const handleEditRole = (role: AgentRole) => {
    setEditingRoleId(role.id)
    setRoleName(role.name)
    setRoleKey(role.key)
    setRoleDescription(role.description ?? '')
    setRoleModalOpen(true)
  }

  const handleSubmitRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmitRole) {
      return
    }

    setIsSubmittingRole(true)
    setRoleMessage(null)

    try {
      if (editingRoleId) {
        await rolesClient.update(editingRoleId, {
          name: roleName.trim(),
          key: roleKey.trim() || undefined,
          description: roleDescription.trim() || undefined,
        })
      } else {
        await rolesClient.create({
          name: roleName.trim(),
          key: roleKey.trim() || undefined,
          description: roleDescription.trim() || undefined,
        })
      }

      setRoleModalOpen(false)
      setRoleMessage({ type: 'success', text: editingRoleId ? 'Rol actualizado.' : 'Rol creado.' })
      resetRoleForm()
      await loadAgentRoles()
    } catch (error) {
      setRoleMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'Error inesperado al guardar rol.'),
      })
    } finally {
      setIsSubmittingRole(false)
    }
  }

  const handleToggleRoleActive = async (role: AgentRole) => {
    setRoleMessage(null)
    try {
      await rolesClient.update(role.id, {
        name: role.name,
        key: role.key,
        description: role.description ?? undefined,
        isActive: !role.isActive,
      })

      setRoleMessage({ type: 'success', text: 'Estado del rol actualizado.' })
      await loadAgentRoles()
    } catch (error) {
      setRoleMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'Error inesperado al actualizar estado.'),
      })
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    setRoleMessage(null)
    try {
      await rolesClient.remove(roleId)

      setRoleMessage({ type: 'success', text: 'Rol eliminado.' })
      if (editingRoleId === roleId) {
        resetRoleForm()
      }
      await loadAgentRoles()
    } catch (error) {
      setRoleMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'Error inesperado al eliminar rol.'),
      })
    }
  }

  const sanitizeFileName = (value: string) => {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)
  }

  const escapeCsvCell = (value: string | number) => {
    const cell = String(value).replace(/"/g, '""')
    return `"${cell}"`
  }

  const escapeHtml = (value: string) => {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const exportBaseName = reportProject ? sanitizeFileName(reportProject.name) || 'reporte-estimacion' : 'reporte-estimacion'

  const handleExportCsv = () => {
    if (!reportProject?.estimation) {
      setReportMessage({ type: 'error', text: 'Generá o cargá un reporte antes de exportar.' })
      return
    }

    const estimation = reportProject.estimation
    const summary = reportProject.summary

    const rows: Array<Array<string | number>> = [
      ['Seccion', 'Campo', 'Valor'],
      ['Proyecto', 'Nombre', reportProject.name],
      ['Proyecto', 'Complejidad', reportProject.complexity],
      ['Resumen', 'Casos de uso', reportProject.useCases.length],
      ['Resumen', 'Horas totales', estimation.totalHours],
      ['Resumen', 'Costo total', estimation.totalCost],
    ]

    reportProject.useCases.forEach((useCase, index) => {
      rows.push(['Caso de uso', `#${index + 1} Titulo`, useCase.title])
      rows.push(['Caso de uso', `#${index + 1} Prioridad`, useCase.priority])
      rows.push(['Caso de uso', `#${index + 1} Descripcion`, useCase.description])
    })

    estimation.phases.forEach((phase) => {
      rows.push(['Roadmap', `${phase.order}. ${phase.name}`, phase.description])
      phase.roleEstimates.forEach((item) => {
        rows.push(['Roadmap', `${phase.name} - ${item.role}`, `${item.hours}h`])
      })
    })

    estimation.tokens.forEach((token) => {
      rows.push(['Tokens', token.model, `${token.tokens} tokens / USD ${token.cost}`])
    })

    rows.push(['Analisis', 'Supuestos', estimation.assumptions])
    rows.push(['Analisis', 'Riesgos', estimation.risks])

    if (summary) {
      rows.push(['Resumen avanzado', 'Costo humano', summary.laborCost])
      rows.push(['Resumen avanzado', 'Costo IA', summary.tokenCost])
      rows.push(['Resumen avanzado', 'Tokens totales', summary.totalTokens])
      rows.push(['Resumen avanzado', 'Horas por caso', summary.averageHoursPerUseCase])
      Object.entries(summary.hoursByRole).forEach(([role, hours]) => {
        rows.push(['Resumen avanzado', `Horas por rol - ${role}`, hours])
      })
    }

    const csv = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
    downloadFile(`\uFEFF${csv}`, `${exportBaseName}-estimacion.csv`, 'text/csv;charset=utf-8;')
    setReportMessage({ type: 'success', text: 'Archivo CSV generado para Excel.' })
  }

  const handleExportJson = () => {
    if (!reportProject?.estimation) {
      setReportMessage({ type: 'error', text: 'Generá o cargá un reporte antes de exportar.' })
      return
    }

    const payload = JSON.stringify(reportProject, null, 2)
    downloadFile(payload, `${exportBaseName}-estimacion.json`, 'application/json;charset=utf-8;')
    setReportMessage({ type: 'success', text: 'Archivo JSON generado correctamente.' })
  }

  const handleExportPdf = () => {
    if (!reportProject?.estimation) {
      setReportMessage({ type: 'error', text: 'Generá o cargá un reporte antes de exportar.' })
      return
    }

    const estimation = reportProject.estimation

    const phasesHtml = estimation.phases
      .map((phase) => {
        const roles = phase.roleEstimates.map((item) => `${escapeHtml(item.role)}: ${item.hours}h`).join(' | ')
        return `<li><strong>${phase.order}. ${escapeHtml(phase.name)}</strong><br/>${escapeHtml(phase.description)}<br/><small>${roles}</small></li>`
      })
      .join('')

    const useCasesHtml = reportProject.useCases
      .map((useCase) => {
        return `<li><strong>${escapeHtml(useCase.title)}</strong> (${escapeHtml(useCase.priority)})<br/>${escapeHtml(useCase.description)}</li>`
      })
      .join('')

    const tokensHtml = estimation.tokens
      .map((token) => `<li>${escapeHtml(token.model)}: ${token.tokens} tokens (USD ${token.cost})</li>`)
      .join('')

    const printableHtml = `
      <html>
        <head>
          <title>Reporte - ${escapeHtml(reportProject.name)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; color: #1a1a1a; }
            h1 { margin-bottom: 4px; }
            h2 { margin-top: 24px; }
            .meta { margin-top: 0; color: #555; }
            .kpi { display: flex; gap: 12px; margin: 14px 0 18px 0; flex-wrap: wrap; }
            .kpi div { border: 1px solid #ddd; border-radius: 10px; padding: 10px 12px; min-width: 160px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
            pre { white-space: pre-wrap; border: 1px solid #ddd; border-radius: 10px; padding: 10px; background: #fafafa; }
          </style>
        </head>
        <body>
          <h1>Reporte de Estimacion</h1>
          <p class="meta">Proyecto: ${escapeHtml(reportProject.name)} | Complejidad: ${escapeHtml(reportProject.complexity)}</p>
          <div class="kpi">
            <div><strong>Horas</strong><br/>${estimation.totalHours}</div>
            <div><strong>Costo</strong><br/>USD ${estimation.totalCost}</div>
            <div><strong>Casos</strong><br/>${reportProject.useCases.length}</div>
          </div>

          <h2>Casos de uso</h2>
          <ul>${useCasesHtml}</ul>

          <h2>Roadmap</h2>
          <ul>${phasesHtml}</ul>

          <h2>Tokens</h2>
          <ul>${tokensHtml}</ul>

          <h2>Supuestos</h2>
          <pre>${escapeHtml(estimation.assumptions)}</pre>

          <h2>Riesgos</h2>
          <pre>${escapeHtml(estimation.risks)}</pre>
        </body>
      </html>
    `

    const frame = document.createElement('iframe')
    frame.setAttribute('aria-hidden', 'true')
    frame.style.position = 'fixed'
    frame.style.width = '0'
    frame.style.height = '0'
    frame.style.border = '0'
    frame.style.right = '0'
    frame.style.bottom = '0'
    frame.srcdoc = printableHtml

    frame.onload = () => {
      const frameWindow = frame.contentWindow
      if (!frameWindow) {
        setReportMessage({ type: 'error', text: 'No se pudo iniciar la impresión del PDF.' })
        frame.remove()
        return
      }

      frameWindow.focus()
      frameWindow.print()
      setTimeout(() => {
        frame.remove()
      }, 1000)
    }

    document.body.appendChild(frame)
    setReportMessage({ type: 'success', text: 'Se abrió el diálogo de impresión para guardar en PDF.' })
  }

  const renderSectionContent = () => {
    if (sectionView === 'dashboard') {
      return (
        <DashboardSection
          projects={projects}
          filteredProjects={filteredProjects}
          totalUseCases={totalUseCases}
          workflowProgress={workflowProgress}
          selectedProjectName={selectedProject?.name}
          onSelectProject={setSelectedProjectId}
        />
      )
    }

    if (sectionView === 'projects') {
      return (
        <ProjectsSection
          projectSearch={projectSearch}
          projectFilterComplexity={projectFilterComplexity}
          projectFilterMinUseCases={projectFilterMinUseCases}
          complexityOptions={complexityOptions}
          isLoadingProjects={isLoadingProjects}
          filteredProjects={filteredProjects}
          paginatedProjects={paginatedProjects}
          projectPage={projectPage}
          projectRowsPerPage={projectRowsPerPage}
          onProjectSearchChange={setProjectSearch}
          onProjectFilterComplexityChange={setProjectFilterComplexity}
          onProjectFilterMinUseCasesChange={setProjectFilterMinUseCases}
          onSelectProject={setSelectedProjectId}
          onProjectPageChange={setProjectPage}
          onProjectRowsPerPageChange={(rowsPerPage) => {
            setProjectRowsPerPage(rowsPerPage)
            setProjectPage(0)
          }}
        />
      )
    }

    if (sectionView === 'usecases') {
      return (
        <UseCasesSection
          useCaseFilterProject={useCaseFilterProject}
          useCaseFilterTitle={useCaseFilterTitle}
          useCaseFilterPriority={useCaseFilterPriority}
          priorityOptions={priorityOptions}
          isLoadingUseCasesTable={isLoadingUseCasesTable}
          filteredUseCasesTable={filteredUseCasesTable}
          paginatedUseCases={paginatedUseCases}
          useCasePage={useCasePage}
          useCaseRowsPerPage={useCaseRowsPerPage}
          onUseCaseFilterProjectChange={setUseCaseFilterProject}
          onUseCaseFilterTitleChange={setUseCaseFilterTitle}
          onUseCaseFilterPriorityChange={setUseCaseFilterPriority}
          onUseCasePageChange={setUseCasePage}
          onUseCaseRowsPerPageChange={(rowsPerPage) => {
            setUseCaseRowsPerPage(rowsPerPage)
            setUseCasePage(0)
          }}
        />
      )
    }

    if (sectionView === 'upcoming') {
      return <UpcomingSection upcomingFeatures={upcomingRepository.list()} />
    }

    if (sectionView === 'roles') {
      return (
        <RolesSection
          isLoadingRoles={isLoadingRoles}
          agentRoles={agentRoles}
          onOpenCreateRole={() => {
            resetRoleForm()
            setRoleModalOpen(true)
          }}
          onReloadRoles={() => void loadAgentRoles()}
          onEditRole={handleEditRole}
          onToggleRoleActive={(role) => void handleToggleRoleActive(role)}
          onDeleteRole={(roleId) => void handleDeleteRole(roleId)}
        />
      )
    }

    if (sectionView === 'estimation') {
      return (
        <EstimationSection
          selectedProjectId={selectedProjectId}
          projects={projects}
          estimationModel={estimationModel}
          canEstimate={canEstimate}
          isEstimating={isEstimating}
          activeAgentRoles={activeAgentRoles}
          selectedRoles={selectedRoles}
          selectedProjectName={selectedProject?.name}
          estimationResult={estimationResult}
          onSelectedProjectChange={setSelectedProjectId}
          onEstimationModelChange={setEstimationModel}
          onEstimate={() => void handleEstimate()}
          onToggleRole={toggleRole}
          onGoToRoles={() => setSectionView('roles')}
        />
      )
    }

    return (
      <ReportSection
        selectedProjectId={selectedProjectId}
        selectedReportVersion={selectedReportVersion}
        projects={projects}
        projectEstimations={projectEstimations}
        reportProject={reportProject}
        isLoadingReport={isLoadingReport}
        onSelectedProjectChange={setSelectedProjectId}
        onSelectedVersionChange={setSelectedReportVersion}
        onLoadReport={() => {
          void (async () => {
            await loadProjectEstimations(selectedProjectId)
            const version = selectedReportVersion === 'latest' ? undefined : Number(selectedReportVersion)
            await loadProjectReport(selectedProjectId, Number.isNaN(version as number) ? undefined : version)
          })()
        }}
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
      />
    )
  }

  const sectionHeader = sectionTitles[sectionView]

  if (!authSession) {
    return (
      <Box
        data-testid="psai-auth-gate"
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          px: 2,
          py: 3,
        }}
      >
        <Card className="glass-card psai-auth-card" sx={{ width: '100%', maxWidth: 520 }}>
          <CardContent>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.55rem', md: '1.95rem' }, mb: 0.6 }}>
              Iniciar sesion
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2.2 }}>
              Inicia sesion para generar tu token y activar el contexto de autenticacion de la API.
            </Typography>

            <Box component="form" onSubmit={handleLogin} sx={{ display: 'grid', gap: 1.2 }} data-testid="psai-login-form">
              <TextField
                label="Actor ID"
                value={loginActorId}
                onChange={(event) => setLoginActorId(event.target.value)}
                helperText="Se usara como identidad del usuario autenticado"
                required
                slotProps={{ htmlInput: { 'data-testid': 'psai-login-actor-id-input', maxLength: 80 } }}
              />
              <TextField
                label="Nombre visible (opcional)"
                value={loginDisplayName}
                onChange={(event) => setLoginDisplayName(event.target.value)}
                slotProps={{ htmlInput: { 'data-testid': 'psai-login-display-name-input', maxLength: 100 } }}
              />
              <TextField
                label="Clave"
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
                slotProps={{ htmlInput: { 'data-testid': 'psai-login-password-input', maxLength: 200 } }}
              />

              <Button type="submit" variant="contained" data-testid="psai-login-submit-button" sx={{ mt: 0.8 }} disabled={isLoggingIn}>
                {isLoggingIn ? 'Validando...' : 'Entrar al dashboard'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Snackbar
          open={Boolean(authMessage)}
          autoHideDuration={4200}
          onClose={() => setAuthMessage(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={authMessage?.type ?? 'success'} onClose={() => setAuthMessage(null)} sx={{ width: '100%' }}>
            {authMessage?.text ?? ''}
          </Alert>
        </Snackbar>
      </Box>
    )
  }

  const renderSidebar = ({ compact }: { compact: boolean }) => {
    const showExpandedContent = !compact

    return (
      <Card
        className={`glass-card psai-sidebar-shell${compact ? ' is-collapsed' : ''}`}
        data-testid="psai-sidebar-card"
        sx={{ height: '100%' }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {showExpandedContent ? (
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Box className="psai-logo-dot" />
                <Box>
                  <Typography variant="h2" sx={{ fontSize: '1.06rem' }}>
                    ProjectScope AI
                  </Typography>
                  <Typography sx={{ fontSize: '0.84rem', opacity: 0.76 }}>Espacio de trabajo</Typography>
                </Box>
              </Stack>
              {isDesktop && (
                <IconButton
                  size="small"
                  onClick={() => setSidebarCollapsed((current) => !current)}
                  sx={{ color: 'inherit' }}
                  aria-label="Contraer barra lateral"
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          ) : (
            isDesktop && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => setSidebarCollapsed((current) => !current)}
                  sx={{ color: 'inherit' }}
                  aria-label="Expandir barra lateral"
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
            )
          )}

          <List>
            {sidebarItemsByRole.map((item) => (
              <ListItemButton
                key={item.section}
                className="psai-sidebar-item"
                selected={sectionView === item.section}
                onClick={() => {
                  setSectionView(item.section)
                  setMobileSidebarOpen(false)
                }}
                sx={{ borderRadius: 2, mb: 0.5, px: compact ? 1 : 1.5 }}
              >
                <ListItemIcon sx={{ minWidth: compact ? 34 : 34, mr: compact ? 0 : 0.4 }}>{item.icon}</ListItemIcon>
                {showExpandedContent && <ListItemText primary={item.label} />}
              </ListItemButton>
            ))}
          </List>

          {showExpandedContent && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1.1, display: 'block' }}>
                Progreso general: {workflowProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={workflowProgress} sx={{ mt: 0.8, borderRadius: 999 }} />

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 1.4 }}
                onClick={() => void Promise.all([loadProjects(), loadUseCasesTable(), loadAgentRoles()])}
              >
                Actualizar
              </Button>
            </>
          )}

          <Stack sx={{ mt: 'auto', pt: 1.4 }} spacing={1}>
            <Divider sx={{ borderColor: 'rgba(194, 207, 255, 0.22)' }} />
            {!compact && (
              <Box sx={{ px: 1.2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Sesion activa
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {authSession.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {authSession.actorId} - {authSession.role}
                </Typography>
              </Box>
            )}
            {isSuperAdmin && (
              compact ? (
                <IconButton
                  size="small"
                  onClick={() => {
                    setSectionView('upcoming')
                    setMobileSidebarOpen(false)
                  }}
                  aria-label="Abrir proximas funcionalidades"
                  sx={{
                    alignSelf: 'center',
                    color: sectionView === 'upcoming' ? 'text.primary' : 'text.secondary',
                    border: '1px solid rgba(194, 207, 255, 0.28)',
                  }}
                >
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              ) : (
                <Typography
                  variant="body2"
                  onClick={() => {
                    setSectionView('upcoming')
                    setMobileSidebarOpen(false)
                  }}
                  sx={{
                    px: 1.2,
                    py: 0.4,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    color: sectionView === 'upcoming' ? 'text.primary' : 'text.secondary',
                    fontWeight: sectionView === 'upcoming' ? 700 : 500,
                    fontSize: '0.875rem',
                  }}
                >
                  Proximas funcionalidades
                </Typography>
              )
            )}
            {compact ? (
              <IconButton
                size="small"
                onClick={handleLogout}
                aria-label="Cerrar sesion"
                sx={{
                  alignSelf: 'center',
                  color: 'inherit',
                  border: '1px solid rgba(194, 207, 255, 0.28)',
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            ) : (
              <Button variant="outlined" size="small" onClick={handleLogout} sx={{ mx: 1.2 }}>
                Salir
              </Button>
            )}
            {!compact && (
              <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.86, px: 1.2 }}>
                Release v1.0.0
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box data-testid="psai-app-root" sx={{ minHeight: '100vh', py: { xs: 2, md: 3 } }}>
      <Container maxWidth="xl">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'stretch' }}>
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              width: { md: sidebarCollapsed ? 96 : 280 },
              position: { md: 'sticky' },
              top: { md: 0 },
              height: { md: '90dvh' },
              alignSelf: 'stretch',
              transition: 'width 0.25s ease',
            }}
          >
            {renderSidebar({ compact: sidebarCollapsed })}
          </Box>

          <Drawer anchor="left" open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)}>
            <Box sx={{ width: 292, p: 1.1 }}>{renderSidebar({ compact: false })}</Box>
          </Drawer>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card className="glass-card" data-testid="psai-main-panel">
              <CardContent>
                <Box
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 3,
                    mb: 2,
                    pb: 1,
                    borderBottom: '1px solid rgba(96, 120, 211, 0.25)',
                    backdropFilter: 'blur(6px)',
                    backgroundColor: 'rgba(12, 18, 42, 0.74)',
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
                    spacing={1.2}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => setMobileSidebarOpen(true)}
                        sx={{ display: { xs: 'inline-flex', md: 'none' }, color: 'text.primary' }}
                        aria-label="Abrir menu lateral"
                      >
                        <MenuIcon />
                      </IconButton>
                      <Breadcrumbs aria-label="breadcrumb" separator=">">
                        <Typography color="text.secondary">Sistema</Typography>
                        <Typography color="text.secondary">ProjectScope AI</Typography>
                        <Typography>{sectionHeader.title}</Typography>
                      </Breadcrumbs>
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8}>
                      <Button size="small" variant="outlined" onClick={() => setProjectModalOpen(true)} disabled={!canCreateProjects}>
                        Nuevo proyecto
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => setUseCaseModalOpen(true)} disabled={!hasProject}>
                        Nuevo caso
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          resetRoleForm()
                          setRoleModalOpen(true)
                        }}
                        disabled={!canManageRoles}
                      >
                        Nuevo rol
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => void Promise.all([loadProjects(), loadUseCasesTable(), loadAgentRoles()])}
                      >
                        Refrescar
                      </Button>
                    </Stack>
                  </Stack>
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', mb: 2 }} spacing={1}>
                  <Box>
                    <Typography variant="h2" sx={{ fontSize: '1.6rem' }} data-testid="psai-home-title">
                      {sectionHeader.title}
                    </Typography>
                    <Typography color="text.secondary">{sectionHeader.subtitle}</Typography>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8}>
                    <Chip label={`Usuario: ${authSession.displayName} (${authSession.role})`} variant="outlined" />
                    {selectedProject && <Chip label={`Proyecto activo: ${selectedProject.name}`} color="primary" />}
                  </Stack>
                </Stack>

                {renderSectionContent()}
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Container>

      <Dialog open={projectModalOpen} onClose={() => setProjectModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Crear proyecto</DialogTitle>
        <Box component="form" onSubmit={handleCreateProject} data-testid="psai-project-form">
          <DialogContent sx={{ display: 'grid', gap: 1.2 }}>
            <TextField
              label="Nombre del proyecto"
              value={name}
              onChange={(event) => setName(event.target.value)}
              data-testid="psai-project-name-field"
              slotProps={{ htmlInput: { 'data-testid': 'psai-project-name-input', maxLength: 120 } }}
              helperText="Minimo 3 caracteres"
              required
            />
            <TextField
              label="Descripcion"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              data-testid="psai-project-description-field"
              slotProps={{ htmlInput: { 'data-testid': 'psai-project-description-input', maxLength: 4000 } }}
              helperText="Minimo 10 caracteres"
              multiline
              minRows={4}
              required
            />
            <TextField
              select
              label="Complejidad"
              value={complexity}
              onChange={(event) => setComplexity(event.target.value as Complexity)}
              data-testid="psai-project-complexity-select"
            >
              {complexityOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProjectModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={!canSubmitProject} data-testid="psai-project-submit-button">
              {isSubmittingProject ? 'Guardando...' : 'Guardar proyecto'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={useCaseModalOpen} onClose={() => setUseCaseModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Agregar caso de uso</DialogTitle>
        <Box component="form" onSubmit={handleCreateUseCase} data-testid="psai-use-case-form">
          <DialogContent sx={{ display: 'grid', gap: 1.2 }}>
            <TextField
              select
              label="Proyecto"
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              data-testid="psai-use-case-project-select"
              disabled={projects.length === 0}
              required
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Titulo del caso de uso"
              value={useCaseTitle}
              onChange={(event) => setUseCaseTitle(event.target.value)}
              data-testid="psai-use-case-title-field"
              slotProps={{ htmlInput: { 'data-testid': 'psai-use-case-title-input', maxLength: 200 } }}
              required
            />

            <TextField
              label="Descripcion del caso de uso"
              value={useCaseDescription}
              onChange={(event) => setUseCaseDescription(event.target.value)}
              data-testid="psai-use-case-description-field"
              slotProps={{ htmlInput: { 'data-testid': 'psai-use-case-description-input', maxLength: 4000 } }}
              multiline
              minRows={3}
              required
            />

            <TextField
              select
              label="Prioridad"
              value={useCasePriority}
              onChange={(event) => setUseCasePriority(event.target.value as Priority)}
              data-testid="psai-use-case-priority-select"
            >
              {priorityOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUseCaseModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={!canSubmitUseCase} data-testid="psai-use-case-submit-button">
              {isSubmittingUseCase ? 'Guardando...' : 'Guardar caso'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={roleModalOpen} onClose={() => setRoleModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingRoleId ? 'Editar rol' : 'Crear rol'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmitRole}>
          <DialogContent sx={{ display: 'grid', gap: 1.2 }}>
            <TextField
              label="Nombre"
              value={roleName}
              onChange={(event) => setRoleName(event.target.value)}
              required
            />
            <TextField
              label="Key (opcional)"
              value={roleKey}
              onChange={(event) => setRoleKey(event.target.value)}
            />
            <TextField
              label="Descripcion"
              value={roleDescription}
              onChange={(event) => setRoleDescription(event.target.value)}
              multiline
              minRows={2}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setRoleModalOpen(false)
                resetRoleForm()
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={!canSubmitRole}>
              {isSubmittingRole ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar
        open={Boolean(projectMessage)}
        autoHideDuration={4200}
        onClose={() => setProjectMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={projectMessage?.type ?? 'success'} onClose={() => setProjectMessage(null)} sx={{ width: '100%' }}>
          {projectMessage?.text ?? ''}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(useCaseMessage)}
        autoHideDuration={4200}
        onClose={() => setUseCaseMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={useCaseMessage?.type ?? 'success'} onClose={() => setUseCaseMessage(null)} sx={{ width: '100%' }}>
          {useCaseMessage?.text ?? ''}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(estimateMessage)}
        autoHideDuration={4200}
        onClose={() => setEstimateMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={estimateMessage?.type ?? 'success'} onClose={() => setEstimateMessage(null)} sx={{ width: '100%' }}>
          {estimateMessage?.text ?? ''}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(reportMessage)}
        autoHideDuration={4200}
        onClose={() => setReportMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={reportMessage?.type ?? 'success'} onClose={() => setReportMessage(null)} sx={{ width: '100%' }}>
          {reportMessage?.text ?? ''}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(roleMessage)}
        autoHideDuration={4200}
        onClose={() => setRoleMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={roleMessage?.type ?? 'success'} onClose={() => setRoleMessage(null)} sx={{ width: '100%' }}>
          {roleMessage?.text ?? ''}
        </Alert>
      </Snackbar>

    </Box>
  )
}

export default App
