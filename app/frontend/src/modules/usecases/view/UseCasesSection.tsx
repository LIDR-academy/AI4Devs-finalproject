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
import type { Priority } from '../../shared/core/types'
import type { UseCasesSectionProps } from '../core/types'
import { useCasesStyles } from './styles'

export function UseCasesSection(props: UseCasesSectionProps) {
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        <TextField
          label="Filtro proyecto"
          size="small"
          value={props.useCaseFilterProject}
          onChange={(event) => props.onUseCaseFilterProjectChange(event.target.value)}
          sx={useCasesStyles.projectFilterField}
        />
        <TextField
          label="Filtro titulo"
          size="small"
          value={props.useCaseFilterTitle}
          onChange={(event) => props.onUseCaseFilterTitleChange(event.target.value)}
          sx={useCasesStyles.titleFilterField}
        />
        <TextField
          select
          label="Prioridad"
          size="small"
          value={props.useCaseFilterPriority}
          onChange={(event) => props.onUseCaseFilterPriorityChange(event.target.value as 'ALL' | Priority)}
          sx={useCasesStyles.priorityFilterField}
        >
          <MenuItem value="ALL">Todas</MenuItem>
          {props.priorityOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <TableContainer>
        <Table size="small" aria-label="tabla de casos de uso">
          <TableHead>
            <TableRow>
              <TableCell>Proyecto</TableCell>
              <TableCell>Titulo</TableCell>
              <TableCell>Descripcion</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell>Alta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.isLoadingUseCasesTable ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <CircularProgress size={22} />
                </TableCell>
              </TableRow>
            ) : props.filteredUseCasesTable.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No hay casos registrados.</TableCell>
              </TableRow>
            ) : (
              props.paginatedUseCases.map((useCase) => (
                <TableRow key={useCase.id} hover>
                  <TableCell>{useCase.project.name}</TableCell>
                  <TableCell>{useCase.title}</TableCell>
                  <TableCell>{useCase.description}</TableCell>
                  <TableCell>{useCase.priority}</TableCell>
                  <TableCell>{new Date(useCase.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={props.filteredUseCasesTable.length}
        page={props.useCasePage}
        onPageChange={(_event, newPage) => props.onUseCasePageChange(newPage)}
        rowsPerPage={props.useCaseRowsPerPage}
        onRowsPerPageChange={(event) => props.onUseCaseRowsPerPageChange(Number(event.target.value))}
        rowsPerPageOptions={[5, 8, 12, 20]}
      />
    </Stack>
  )
}
