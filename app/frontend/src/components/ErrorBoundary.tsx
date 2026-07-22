import { Button, Stack, Typography } from '@mui/material'
import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Keep runtime error details in the browser console for debugging.
    console.error('Error no controlado en la interfaz:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Stack
          spacing={2}
          sx={{
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4">Ocurrio un error inesperado</Typography>
          <Typography color="text.secondary">
            La aplicacion encontro un problema y no pudo continuar.
          </Typography>
          <Button variant="contained" onClick={this.handleReload}>
            Recargar aplicacion
          </Button>
        </Stack>
      )
    }

    return this.props.children
  }
}
