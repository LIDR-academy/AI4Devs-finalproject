import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import BoltIcon from '@mui/icons-material/Bolt'
import InsightsIcon from '@mui/icons-material/Insights'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Complexity = 'LOW' | 'MEDIUM' | 'HIGH'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

type ProjectSummary = {
  id: string
  name: string
  description: string
  complexity: Complexity | null
  createdAt: string
  _count?: {
    useCases: number
  }
}

type EstimationResult = {
  id: string
  totalHours: number
  totalCost: number
  assumptions: string
  risks: string
  phases: {
    id: string
    name: string
    description: string
    order: number
    roleEstimates: {
      id: string
      role: string
      hours: number
    }[]
  }[]
  tokens: {
    id: string
    model: string
    tokens: number
    cost: number
  }[]
}

type ProjectReport = {
  id: string
  name: string
  description: string
  complexity: Complexity
  useCases: {
    id: string
    title: string
    description: string
    priority: Priority
  }[]
  estimation: EstimationResult | null
}

const complexityOptions: Array<{ value: Complexity; label: string }> = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
]

const priorityOptions: Array<{ value: Priority; label: string }> = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
]

const roleOptions = [
  'frontend-developer',
  'backend-developer',
  'qa-engineer',
  'devops-engineer',
  'security-reviewer',
  'product-owner',
]

const modules = [
  {
    id: 'project',
    title: 'Proyecto',
    description: 'Define alcance, presupuesto, industria y timeline del cliente.',
    icon: <AutoAwesomeIcon color="primary" />,
    testId: 'psai-home-step-project',
  },
  {
    id: 'usecases',
    title: 'Casos de Uso',
    description: 'Captura objetivos de negocio y complejidad técnica por escenario.',
    icon: <PrecisionManufacturingIcon color="primary" />,
    testId: 'psai-home-step-usecases',
  },
  {
    id: 'roles',
    title: 'Roles y Estimación',
    description: 'Selecciona perfiles y ejecuta la estimación con IA por fase.',
    icon: <BoltIcon color="primary" />,
    testId: 'psai-home-step-roles',
  },
  {
    id: 'report',
    title: 'Reporte Ejecutivo',
    description: 'Visualiza costos, supuestos y tokens en un reporte accionable.',
    icon: <InsightsIcon color="primary" />,
    testId: 'psai-home-step-report',
  },
]

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

function App() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [complexity, setComplexity] = useState<Complexity>('MEDIUM')

  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [useCaseTitle, setUseCaseTitle] = useState('')
  const [useCaseDescription, setUseCaseDescription] = useState('')
  const [useCasePriority, setUseCasePriority] = useState<Priority>('MEDIUM')

  const [selectedRoles, setSelectedRoles] = useState<string[]>(['frontend-developer', 'backend-developer'])
  const [estimationModel, setEstimationModel] = useState('gpt-4o-mini')
  const [estimationResult, setEstimationResult] = useState<EstimationResult | null>(null)
  const [reportProject, setReportProject] = useState<ProjectReport | null>(null)

  const [projects, setProjects] = useState<ProjectSummary[]>([])

  const [isSubmittingProject, setIsSubmittingProject] = useState(false)
  const [isSubmittingUseCase, setIsSubmittingUseCase] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isLoadingReport, setIsLoadingReport] = useState(false)

  const [projectMessage, setProjectMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [useCaseMessage, setUseCaseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [estimateMessage, setEstimateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [reportMessage, setReportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const selectedProject = useMemo(() => {
    return projects.find((project) => project.id === selectedProjectId) ?? null
  }, [projects, selectedProjectId])

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
  }, [isEstimating, selectedProjectId, selectedRoles.length])

  const loadProjects = async () => {
    setIsLoadingProjects(true)
    try {
      const response = await fetch(`${apiBaseUrl}/projects`)

      if (!response.ok) {
        throw new Error('No se pudo cargar la lista de proyectos.')
      }

      const data = (await response.json()) as ProjectSummary[]
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
        text: error instanceof Error ? error.message : 'Error inesperado al cargar proyectos.',
      })
    } finally {
      setIsLoadingProjects(false)
    }
  }

  useEffect(() => {
    void loadProjects()
  }, [])

  const handleCreateProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmitProject) {
      return
    }

    setIsSubmittingProject(true)
    setProjectMessage(null)

    try {
      const response = await fetch(`${apiBaseUrl}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          complexity,
        }),
      })

      if (!response.ok) {
        const responseBody = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(responseBody?.message ?? 'No se pudo crear el proyecto.')
      }

      const createdProject = (await response.json()) as ProjectSummary
      setName('')
      setDescription('')
      setComplexity('MEDIUM')
      setSelectedProjectId(createdProject.id)
      setProjectMessage({ type: 'success', text: 'Proyecto creado correctamente.' })
      await loadProjects()
    } catch (error) {
      setProjectMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error inesperado al crear el proyecto.',
      })
    } finally {
      setIsSubmittingProject(false)
    }
  }

  const handleCreateUseCase = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmitUseCase) {
      return
    }

    setIsSubmittingUseCase(true)
    setUseCaseMessage(null)

    try {
      const response = await fetch(`${apiBaseUrl}/projects/${selectedProjectId}/use-cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: useCaseTitle.trim(),
          description: useCaseDescription.trim(),
          priority: useCasePriority,
        }),
      })

      if (!response.ok) {
        const responseBody = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(responseBody?.message ?? 'No se pudo crear el caso de uso.')
      }

      setUseCaseTitle('')
      setUseCaseDescription('')
      setUseCasePriority('MEDIUM')
      setUseCaseMessage({ type: 'success', text: 'Caso de uso agregado correctamente.' })
      await loadProjects()
    } catch (error) {
      setUseCaseMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error inesperado al crear el caso de uso.',
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

  const loadProjectReport = async (projectId: string) => {
    if (!projectId) {
      return
    }

    setIsLoadingReport(true)
    setReportMessage(null)

    try {
      const response = await fetch(`${apiBaseUrl}/projects/${projectId}`)

      if (!response.ok) {
        const responseBody = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(responseBody?.message ?? 'No se pudo cargar el reporte del proyecto.')
      }

      const report = (await response.json()) as ProjectReport
      setReportProject(report)
      setReportMessage({ type: 'success', text: 'Reporte actualizado.' })
    } catch (error) {
      setReportMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error inesperado al cargar reporte.',
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
      const response = await fetch(`${apiBaseUrl}/projects/${selectedProjectId}/estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roles: selectedRoles,
          model: estimationModel.trim(),
        }),
      })

      if (!response.ok) {
        const responseBody = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(responseBody?.message ?? 'No se pudo ejecutar la estimación.')
      }

      const estimation = (await response.json()) as EstimationResult
      setEstimationResult(estimation)
      setEstimateMessage({ type: 'success', text: 'Estimación generada correctamente.' })
      await loadProjectReport(selectedProjectId)
      await loadProjects()
    } catch (error) {
      setEstimateMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error inesperado al estimar.',
      })
    } finally {
      setIsEstimating(false)
    }
  }

  return (
    <Box data-testid="psai-app-root" sx={{ minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Box
          data-testid="psai-home-header"
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 5,
            border: '1px solid rgba(140, 162, 255, 0.28)',
            background:
              'linear-gradient(160deg, rgba(20,28,66,0.9) 0%, rgba(10,14,33,0.84) 70%)',
            boxShadow: '0 24px 70px rgba(9, 15, 44, 0.55)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
            <Box>
              <Chip label="AI Estimation Platform" color="primary" sx={{ mb: 2 }} />
              <Typography
                data-testid="psai-home-title"
                variant="h1"
                sx={{ fontSize: { xs: '2rem', md: '3.4rem' }, maxWidth: '12ch' }}
              >
                ProjectScope AI
              </Typography>
              <Typography
                data-testid="psai-home-subtitle"
                variant="body1"
                color="text.secondary"
                sx={{ mt: 1.5, maxWidth: '62ch' }}
              >
                Plataforma moderna para planificar soluciones con IA, estimar esfuerzo técnico y generar
                reportes ejecutivos con trazabilidad.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  data-testid="psai-home-cta-start"
                  startIcon={<RocketLaunchIcon />}
                >
                  Crear Proyecto
                </Button>
                <Button variant="outlined" size="large" data-testid="psai-home-cta-report">
                  Ver Demo de Reporte
                </Button>
              </Stack>
            </Box>

            <Card data-testid="psai-home-metrics-card" sx={{ minWidth: { xs: '100%', md: 280 }, alignSelf: 'stretch' }}>
              <CardContent>
                <Typography variant="overline" color="secondary.main">
                  Live Signals
                </Typography>
                <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>
                  4 módulos activos
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Estado del MVP preparado para T05-T08
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Box data-testid="psai-home-next-steps" sx={{ mt: 4 }}>
          <Typography data-testid="psai-home-next-steps-title" variant="h2" sx={{ mb: 2 }}>
            Workflow del MVP
          </Typography>

          <Grid container spacing={2.5} data-testid="psai-home-next-steps-list">
            {modules.map((module) => (
              <Grid size={{ xs: 12, sm: 6 }} key={module.id}>
                <Card data-testid={module.testId} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      {module.icon}
                      <Typography variant="h6">{module.title}</Typography>
                    </Stack>
                    <Typography color="text.secondary" sx={{ mt: 1.2 }}>
                      {module.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={2.5} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card data-testid="psai-project-form-card" className="glass-card">
              <CardContent>
                <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
                  T05 - Crear Proyecto
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.8, mb: 2 }}>
                  Completá la información base para iniciar una estimación.
                </Typography>

                {projectMessage && (
                  <Alert
                    data-testid="psai-project-form-alert"
                    severity={projectMessage.type}
                    sx={{ mb: 2 }}
                    onClose={() => setProjectMessage(null)}
                  >
                    {projectMessage.text}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleCreateProject} data-testid="psai-project-form" sx={{ display: 'grid', gap: 1.5 }}>
                  <TextField
                    label="Nombre del proyecto"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    data-testid="psai-project-name-field"
                    slotProps={{ htmlInput: { 'data-testid': 'psai-project-name-input', maxLength: 120 } }}
                    helperText="Mínimo 3 caracteres"
                    required
                  />

                  <TextField
                    label="Descripción"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    data-testid="psai-project-description-field"
                    slotProps={{ htmlInput: { 'data-testid': 'psai-project-description-input', maxLength: 4000 } }}
                    helperText="Mínimo 10 caracteres"
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

                  <Button type="submit" variant="contained" disabled={!canSubmitProject} data-testid="psai-project-submit-button">
                    {isSubmittingProject ? 'Guardando...' : 'Guardar proyecto'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card data-testid="psai-project-list-card" className="glass-card">
              <CardContent>
                <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
                  Proyectos recientes
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.8, mb: 2 }}>
                  Validación rápida de persistencia desde frontend hacia backend.
                </Typography>

                {isLoadingProjects ? (
                  <Stack data-testid="psai-project-list-loading" sx={{ alignItems: 'center', py: 4 }}>
                    <CircularProgress size={28} />
                  </Stack>
                ) : projects.length === 0 ? (
                  <Alert data-testid="psai-project-list-empty" severity="info">
                    Todavía no hay proyectos cargados.
                  </Alert>
                ) : (
                  <Stack data-testid="psai-project-list" spacing={1.1}>
                    {projects.slice(0, 5).map((project) => (
                      <Box
                        key={project.id}
                        data-testid="psai-project-list-item"
                        sx={{
                          p: 1.2,
                          borderRadius: 2,
                          border: '1px solid rgba(148, 166, 255, 0.22)',
                          backgroundColor: 'rgba(12, 18, 44, 0.65)',
                        }}
                      >
                        <Typography sx={{ fontWeight: 600 }}>{project.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                          {project.description}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.9 }}>
                          <Chip size="small" label={`Complejidad: ${project.complexity ?? 'N/A'}`} />
                          <Chip size="small" label={`Casos de uso: ${project._count?.useCases ?? 0}`} color="secondary" />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2.5} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card data-testid="psai-use-case-form-card" className="glass-card">
              <CardContent>
                <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
                  T06 - Cargar Casos de Uso
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.8, mb: 2 }}>
                  Asociá escenarios funcionales al proyecto para preparar la estimación.
                </Typography>

                {useCaseMessage && (
                  <Alert
                    data-testid="psai-use-case-form-alert"
                    severity={useCaseMessage.type}
                    sx={{ mb: 2 }}
                    onClose={() => setUseCaseMessage(null)}
                  >
                    {useCaseMessage.text}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleCreateUseCase} data-testid="psai-use-case-form" sx={{ display: 'grid', gap: 1.5 }}>
                  <TextField
                    select
                    label="Proyecto"
                    value={selectedProjectId}
                    onChange={(event) => setSelectedProjectId(event.target.value)}
                    data-testid="psai-use-case-project-select"
                    helperText="Seleccioná el proyecto al que corresponde este caso de uso."
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
                    label="Título del caso de uso"
                    value={useCaseTitle}
                    onChange={(event) => setUseCaseTitle(event.target.value)}
                    data-testid="psai-use-case-title-field"
                    slotProps={{ htmlInput: { 'data-testid': 'psai-use-case-title-input', maxLength: 200 } }}
                    helperText="Mínimo 3 caracteres"
                    required
                  />

                  <TextField
                    label="Descripción del caso de uso"
                    value={useCaseDescription}
                    onChange={(event) => setUseCaseDescription(event.target.value)}
                    data-testid="psai-use-case-description-field"
                    slotProps={{ htmlInput: { 'data-testid': 'psai-use-case-description-input', maxLength: 4000 } }}
                    helperText="Mínimo 10 caracteres"
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

                  <Button type="submit" variant="contained" disabled={!canSubmitUseCase} data-testid="psai-use-case-submit-button">
                    {isSubmittingUseCase ? 'Guardando...' : 'Agregar caso de uso'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card data-testid="psai-estimation-trigger-card" className="glass-card">
              <CardContent>
                <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
                  T07 - Roles y Trigger de Estimación
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.8, mb: 2 }}>
                  Seleccioná roles de trabajo y ejecutá la estimación estructurada.
                </Typography>

                {estimateMessage && (
                  <Alert
                    data-testid="psai-estimate-alert"
                    severity={estimateMessage.type}
                    sx={{ mb: 2 }}
                    onClose={() => setEstimateMessage(null)}
                  >
                    {estimateMessage.text}
                  </Alert>
                )}

                <Stack spacing={1.5} data-testid="psai-estimate-form">
                  <TextField
                    select
                    label="Proyecto para estimar"
                    value={selectedProjectId}
                    onChange={(event) => setSelectedProjectId(event.target.value)}
                    data-testid="psai-estimate-project-select"
                    disabled={projects.length === 0}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Modelo"
                    value={estimationModel}
                    onChange={(event) => setEstimationModel(event.target.value)}
                    data-testid="psai-estimate-model-input"
                    helperText="Podés usar gpt-4o-mini o cambiar por otro identificador."
                  />

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.8 }}>
                      Roles
                    </Typography>
                    <FormGroup data-testid="psai-role-selector">
                      {roleOptions.map((role) => (
                        <FormControlLabel
                          key={role}
                          data-testid={`psai-role-${role}`}
                          control={
                            <Checkbox checked={selectedRoles.includes(role)} onChange={() => toggleRole(role)} />
                          }
                          label={role}
                        />
                      ))}
                    </FormGroup>
                  </Box>

                  <Button
                    variant="contained"
                    onClick={handleEstimate}
                    disabled={!canEstimate}
                    data-testid="psai-estimate-trigger-button"
                  >
                    {isEstimating ? 'Estimando...' : 'Generar estimación'}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => void loadProjectReport(selectedProjectId)}
                    disabled={!selectedProjectId || isLoadingReport}
                    data-testid="psai-report-load-button"
                  >
                    {isLoadingReport ? 'Cargando reporte...' : 'Cargar reporte'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2.5} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <Card data-testid="psai-estimate-result-card" className="glass-card">
              <CardContent>
                <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
                  Vista Rápida de Estimación
                </Typography>

                {!estimationResult ? (
                  <Alert data-testid="psai-estimate-result-empty" severity="info" sx={{ mt: 1.4 }}>
                    Ejecutá una estimación para ver roadmap, horas, costos y supuestos.
                  </Alert>
                ) : (
                  <Stack spacing={1.4} sx={{ mt: 1.6 }} data-testid="psai-estimate-result">
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                      <Chip label={`Proyecto: ${selectedProject?.name ?? 'N/A'}`} />
                      <Chip label={`Horas totales: ${estimationResult.totalHours}`} color="primary" />
                      <Chip label={`Costo total: USD ${estimationResult.totalCost}`} color="secondary" />
                    </Stack>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2">Fases</Typography>
                      <Stack spacing={1} sx={{ mt: 0.8 }}>
                        {estimationResult.phases.map((phase) => (
                          <Box
                            key={phase.id}
                            sx={{
                              p: 1.1,
                              borderRadius: 2,
                              border: '1px solid rgba(148, 166, 255, 0.22)',
                              backgroundColor: 'rgba(12, 18, 44, 0.65)',
                            }}
                          >
                            <Typography sx={{ fontWeight: 600 }}>
                              {phase.order}. {phase.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {phase.description}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {phase.roleEstimates.map((item) => `${item.role}: ${item.hours}h`).join(' | ')}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    <Divider />

                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      Supuestos:\n{estimationResult.assumptions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      Riesgos:\n{estimationResult.risks}
                    </Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2.5} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <Card data-testid="psai-report-view-card" className="glass-card">
              <CardContent>
                <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
                  T08 - Vista de Reporte
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.8, mb: 2 }}>
                  Reporte consolidado del proyecto con roadmap, horas, costos, supuestos y riesgos.
                </Typography>

                {reportMessage && (
                  <Alert
                    data-testid="psai-report-alert"
                    severity={reportMessage.type}
                    sx={{ mb: 2 }}
                    onClose={() => setReportMessage(null)}
                  >
                    {reportMessage.text}
                  </Alert>
                )}

                {isLoadingReport ? (
                  <Stack data-testid="psai-report-loading" sx={{ alignItems: 'center', py: 4 }}>
                    <CircularProgress size={28} />
                  </Stack>
                ) : !reportProject ? (
                  <Alert data-testid="psai-report-empty" severity="info">
                    Seleccioná un proyecto y hacé clic en Cargar reporte.
                  </Alert>
                ) : !reportProject.estimation ? (
                  <Alert data-testid="psai-report-no-estimation" severity="warning">
                    El proyecto no tiene una estimación guardada todavía. Ejecutá T07 para generarla.
                  </Alert>
                ) : (
                  <Stack data-testid="psai-report-view" spacing={1.5}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                      <Chip label={`Proyecto: ${reportProject.name}`} />
                      <Chip label={`Complejidad: ${reportProject.complexity}`} color="primary" />
                      <Chip label={`Casos de uso: ${reportProject.useCases.length}`} color="secondary" />
                      <Chip label={`Horas: ${reportProject.estimation.totalHours}`} />
                      <Chip label={`Costo: USD ${reportProject.estimation.totalCost}`} />
                    </Stack>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2">Casos de uso</Typography>
                      <Stack spacing={1} sx={{ mt: 0.8 }}>
                        {reportProject.useCases.map((useCase) => (
                          <Box
                            key={useCase.id}
                            sx={{
                              p: 1.1,
                              borderRadius: 2,
                              border: '1px solid rgba(148, 166, 255, 0.22)',
                              backgroundColor: 'rgba(12, 18, 44, 0.65)',
                            }}
                          >
                            <Typography sx={{ fontWeight: 600 }}>{useCase.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {useCase.description}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.4 }}>
                              Prioridad: {useCase.priority}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2">Roadmap</Typography>
                      <Stack spacing={1} sx={{ mt: 0.8 }}>
                        {reportProject.estimation.phases.map((phase) => (
                          <Box
                            key={phase.id}
                            sx={{
                              p: 1.1,
                              borderRadius: 2,
                              border: '1px solid rgba(148, 166, 255, 0.22)',
                              backgroundColor: 'rgba(12, 18, 44, 0.65)',
                            }}
                          >
                            <Typography sx={{ fontWeight: 600 }}>
                              {phase.order}. {phase.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {phase.description}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {phase.roleEstimates.map((item) => `${item.role}: ${item.hours}h`).join(' | ')}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2">Tokens</Typography>
                      <Stack spacing={0.8} sx={{ mt: 0.8 }}>
                        {reportProject.estimation.tokens.map((token) => (
                          <Typography key={token.id} variant="body2" color="text.secondary">
                            {token.model}: {token.tokens} tokens (USD {token.cost})
                          </Typography>
                        ))}
                      </Stack>
                    </Box>

                    <Divider />

                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      Supuestos:\n{reportProject.estimation.assumptions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      Riesgos:\n{reportProject.estimation.risks}
                    </Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default App