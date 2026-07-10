import {
  CircularProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from '@mui/material'
import type { Complexity } from '../../shared/core/types'
import type { ProjectsSectionProps } from '../core/types'
import { projectsStyles } from './styles'

export function ProjectsSection(props: ProjectsSectionProps) {
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        <TextField
          label="Filtro nombre/descripcion"
          size="small"
          value={props.projectSearch}
          onChange={(event) => props.onProjectSearchChange(event.target.value)}
          sx={projectsStyles.searchField}
        />
        <TextField
          select
          label="Complejidad"
          size="small"
          value={props.projectFilterComplexity}
          onChange={(event) => props.onProjectFilterComplexityChange(event.target.value as 'ALL' | Complexity)}
          sx={projectsStyles.complexityField}
        >
          <MenuItem value="ALL">Todas</MenuItem>
          {props.complexityOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Min casos"
          size="small"
          value={props.projectFilterMinUseCases}
          onChange={(event) => props.onProjectFilterMinUseCasesChange(event.target.value.replace(/[^0-9]/g, ''))}
          sx={projectsStyles.minCasesField}
        />
      </Stack>

      <TableContainer>
        <Table size="small" aria-label="tabla de proyectos">
          <TableHead>
            <TableRow>
              <TableCell>Proyecto</TableCell>
              <TableCell>Descripcion</TableCell>
              <TableCell>Complejidad</TableCell>
              <TableCell>Casos</TableCell>
              <TableCell>Creado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.isLoadingProjects ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <CircularProgress size={22} />
                </TableCell>
              </TableRow>
            ) : props.filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No hay proyectos.</TableCell>
              </TableRow>
            ) : (
              props.paginatedProjects.map((project) => (
                <TableRow key={project.id} hover onClick={() => props.onSelectProject(project.id)}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>{project.complexity ?? 'N/A'}</TableCell>
                  <TableCell>{project._count?.useCases ?? 0}</TableCell>
                  <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={props.filteredProjects.length}
        page={props.projectPage}
        onPageChange={(_event, newPage) => props.onProjectPageChange(newPage)}
        rowsPerPage={props.projectRowsPerPage}
        onRowsPerPageChange={(event) => props.onProjectRowsPerPageChange(Number(event.target.value))}
        rowsPerPageOptions={[5, 8, 12, 20]}
      />
    </Stack>
  )
}
