import {
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { DashboardSectionProps } from '../core/types'
import { dashboardClient } from '../infrastructure/dashboardClient'
import { dashboardStyles } from './styles'

export function DashboardSection({
  projects,
  filteredProjects,
  totalUseCases,
  workflowProgress,
  selectedProjectName,
  onSelectProject,
}: DashboardSectionProps) {
  const { estimatedProjects, averageUseCasesPerProject } = dashboardClient.buildMetrics(projects)

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
        <Card sx={dashboardStyles.kpiCard}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Proyectos</Typography>
            <Typography variant="h5">{projects.length}</Typography>
          </CardContent>
        </Card>
        <Card sx={dashboardStyles.kpiCard}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Casos de uso</Typography>
            <Typography variant="h5">{totalUseCases}</Typography>
          </CardContent>
        </Card>
        <Card sx={dashboardStyles.kpiCard}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Promedio casos/proyecto</Typography>
            <Typography variant="h5">{averageUseCasesPerProject}</Typography>
          </CardContent>
        </Card>
        <Card sx={dashboardStyles.kpiCard}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Proyectos estimables</Typography>
            <Typography variant="h5">{estimatedProjects}</Typography>
          </CardContent>
        </Card>
      </Stack>

      <LinearProgress variant="determinate" value={workflowProgress} sx={dashboardStyles.progress} />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <Chip label={`Progreso: ${workflowProgress}%`} color="primary" />
        <Chip label={`Proyecto activo: ${selectedProjectName ?? 'Ninguno'}`} />
      </Stack>

      <TableContainer>
        <Table size="small" aria-label="dashboard proyectos recientes">
          <TableHead>
            <TableRow>
              <TableCell>Proyecto</TableCell>
              <TableCell>Complejidad</TableCell>
              <TableCell>Casos</TableCell>
              <TableCell>Creado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.slice(0, 8).map((project) => (
              <TableRow key={project.id} hover onClick={() => onSelectProject(project.id)}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.complexity ?? 'N/A'}</TableCell>
                <TableCell>{project._count?.useCases ?? 0}</TableCell>
                <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {filteredProjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>No hay datos para mostrar.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
