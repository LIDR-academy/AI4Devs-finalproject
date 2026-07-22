import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { appTheme } from './theme'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('No se encontro el nodo root para iniciar la aplicacion.')
}

const renderStartupError = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Error desconocido durante el inicio.'
  rootElement.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #090d1f;
      color: #edf2ff;
    ">
      <div style="max-width: 640px; border: 1px solid #3d4f8f; border-radius: 14px; padding: 20px; background: #111734;">
        <h1 style="margin: 0 0 8px 0; font-size: 1.3rem;">No se pudo iniciar la aplicacion</h1>
        <p style="margin: 0 0 10px 0; color: #a8b6de;">Recarga la pagina. Si el problema persiste, revisa la consola del navegador.</p>
        <pre style="margin: 0; white-space: pre-wrap; color: #ffb4b4;">${message}</pre>
      </div>
    </div>
  `
}

const boot = async () => {
  try {
    const { default: App } = await import('./App.tsx')

    createRoot(rootElement).render(
      <StrictMode>
        <ThemeProvider theme={appTheme}>
          <CssBaseline />
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ThemeProvider>
      </StrictMode>,
    )
  } catch (error) {
    console.error('Error al iniciar la app:', error)
    renderStartupError(error)
  }
}

void boot()
