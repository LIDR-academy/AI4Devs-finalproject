import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import DataObjectIcon from '@mui/icons-material/DataObject'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import TableChartIcon from '@mui/icons-material/TableChart'
import type { ReportSectionProps } from '../core/types'
import { reportStyles } from './styles'

export function ReportSection(props: ReportSectionProps) {
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
        <TextField
          select
          label="Proyecto"
          size="small"
          value={props.selectedProjectId}
          onChange={(event) => props.onSelectedProjectChange(event.target.value)}
          sx={reportStyles.projectField}
        >
          {props.projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Version"
          size="small"
          value={props.selectedReportVersion}
          onChange={(event) => props.onSelectedVersionChange(event.target.value)}
          sx={reportStyles.versionField}
        >
          <MenuItem value="latest">Ultima</MenuItem>
          {props.projectEstimations.map((item) => (
            <MenuItem key={item.id} value={String(item.version)}>
              v{item.version}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="outlined"
          onClick={props.onLoadReport}
          disabled={!props.selectedProjectId || props.isLoadingReport}
          data-testid="psai-report-load-button"
        >
          {props.isLoadingReport ? 'Cargando...' : 'Cargar reporte'}
        </Button>

        <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={props.onExportPdf} disabled={!props.reportProject?.estimation}>
          PDF
        </Button>
        <Button variant="outlined" startIcon={<TableChartIcon />} onClick={props.onExportCsv} disabled={!props.reportProject?.estimation}>
          Excel
        </Button>
        <Button variant="outlined" startIcon={<DataObjectIcon />} onClick={props.onExportJson} disabled={!props.reportProject?.estimation}>
          JSON
        </Button>
      </Stack>

      {!props.reportProject ? (
        <Alert data-testid="psai-report-empty" severity="info">
          Selecciona un proyecto y presiona Cargar reporte.
        </Alert>
      ) : !props.reportProject.estimation ? (
        <Alert data-testid="psai-report-no-estimation" severity="warning">
          El proyecto no tiene estimacion guardada.
        </Alert>
      ) : (
        <Stack data-testid="psai-report-view" spacing={1.2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <Chip label={`Proyecto: ${props.reportProject.name}`} />
            <Chip label={`Version: ${props.selectedReportVersion === 'latest' ? 'Ultima' : `v${props.selectedReportVersion}`}`} />
            <Chip label={`Complejidad: ${props.reportProject.complexity}`} color="primary" />
            <Chip label={`Horas: ${props.reportProject.estimation.totalHours}`} />
            <Chip label={`Costo: USD ${props.reportProject.estimation.totalCost}`} color="secondary" />
          </Stack>

          {props.reportProject.summary && (
            <TableContainer>
              <Table size="small" aria-label="resumen avanzado de reporte">
                <TableHead>
                  <TableRow>
                    <TableCell>Indicador</TableCell>
                    <TableCell>Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Costo humano</TableCell>
                    <TableCell>USD {props.reportProject.summary.laborCost}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Costo IA</TableCell>
                    <TableCell>USD {props.reportProject.summary.tokenCost}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tokens</TableCell>
                    <TableCell>{props.reportProject.summary.totalTokens}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Horas por caso</TableCell>
                    <TableCell>{props.reportProject.summary.averageHoursPerUseCase}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Typography variant="subtitle2">Casos de uso</Typography>
          <TableContainer>
            <Table size="small" aria-label="casos del reporte">
              <TableHead>
                <TableRow>
                  <TableCell>Titulo</TableCell>
                  <TableCell>Prioridad</TableCell>
                  <TableCell>Descripcion</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {props.reportProject.useCases.map((useCase) => (
                  <TableRow key={useCase.id}>
                    <TableCell>{useCase.title}</TableCell>
                    <TableCell>{useCase.priority}</TableCell>
                    <TableCell>{useCase.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      )}
    </Stack>
  )
}
