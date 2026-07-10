import {
  Button,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import type { RolesSectionProps } from '../core/types'

export function RolesSection(props: RolesSectionProps) {
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        <Button variant="contained" onClick={props.onOpenCreateRole}>
          Crear rol
        </Button>
        <Button variant="outlined" onClick={props.onReloadRoles} disabled={props.isLoadingRoles}>
          {props.isLoadingRoles ? 'Actualizando...' : 'Actualizar roles'}
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small" aria-label="tabla de roles">
          <TableHead>
            <TableRow>
              <TableCell>Rol</TableCell>
              <TableCell>Key</TableCell>
              <TableCell>Descripcion</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.isLoadingRoles ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <CircularProgress size={22} />
                </TableCell>
              </TableRow>
            ) : props.agentRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No hay roles registrados.</TableCell>
              </TableRow>
            ) : (
              props.agentRoles.map((role) => (
                <TableRow key={role.id} hover>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.key}</TableCell>
                  <TableCell>{role.description ?? '-'}</TableCell>
                  <TableCell>{role.isActive ? 'Activo' : 'Inactivo'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.8}>
                      <Button size="small" variant="outlined" onClick={() => props.onEditRole(role)}>
                        Editar
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => props.onToggleRoleActive(role)}>
                        {role.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button size="small" color="error" variant="outlined" onClick={() => props.onDeleteRole(role.id)}>
                        Eliminar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
