import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { EstimationSectionProps } from '../core/types'
import { estimationStyles } from './styles'

export function EstimationSection(props: EstimationSectionProps) {
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
        <TextField
          select
          label="Proyecto"
          value={props.selectedProjectId}
          onChange={(event) => props.onSelectedProjectChange(event.target.value)}
          data-testid="psai-estimate-project-select"
          sx={estimationStyles.projectField}
        >
          {props.projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Modelo"
          value={props.estimationModel}
          onChange={(event) => props.onEstimationModelChange(event.target.value)}
          data-testid="psai-estimate-model-input"
          sx={estimationStyles.modelField}
        />

        <Button variant="contained" onClick={props.onEstimate} disabled={!props.canEstimate} data-testid="psai-estimate-trigger-button">
          {props.isEstimating ? 'Estimando...' : 'Generar estimacion'}
        </Button>
      </Stack>

      <Typography variant="subtitle2">Roles activos para estimacion</Typography>
      <FormGroup row data-testid="psai-role-selector">
        {props.activeAgentRoles.map((role) => (
          <FormControlLabel
            key={role.id}
            data-testid={`psai-role-${role.key}`}
            control={<Checkbox checked={props.selectedRoles.includes(role.key)} onChange={() => props.onToggleRole(role.key)} />}
            label={role.name}
          />
        ))}
      </FormGroup>

      <Button variant="outlined" onClick={props.onGoToRoles} sx={estimationStyles.goToRolesButton}>
        Administrar roles
      </Button>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Resultado rapido</Typography>
        {!props.estimationResult ? (
          <Alert data-testid="psai-estimate-result-empty" severity="info">
            Ejecuta una estimacion para ver resultados.
          </Alert>
        ) : (
          <Stack spacing={1} data-testid="psai-estimate-result">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <Chip label={`Proyecto: ${props.selectedProjectName ?? 'N/A'}`} />
              <Chip label={`Horas: ${props.estimationResult.totalHours}`} color="primary" />
              <Chip label={`Costo: USD ${props.estimationResult.totalCost}`} color="secondary" />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              Supuestos:\n{props.estimationResult.assumptions}
            </Typography>
          </Stack>
        )}
      </Box>
    </Stack>
  )
}
