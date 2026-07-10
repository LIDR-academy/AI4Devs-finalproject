import { Alert, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import type { UpcomingSectionProps } from '../core/types'
import { upcomingStyles } from './styles'

export function UpcomingSection({ upcomingFeatures }: UpcomingSectionProps) {
  return (
    <Stack spacing={2}>
      <Alert severity="info">This section is read-only for now.</Alert>

      <TableContainer sx={upcomingStyles.table}>
        <Table size="small" aria-label="upcoming features">
          <TableHead>
            <TableRow>
              <TableCell>Upcoming feature</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Priority</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {upcomingFeatures.map((feature) => (
              <TableRow key={feature.key} hover>
                <TableCell>{feature.title}</TableCell>
                <TableCell>{feature.description}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={feature.priority === 'HIGH' ? 'secondary' : 'primary'}
                    label={feature.priority === 'HIGH' ? 'High' : 'Medium'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
