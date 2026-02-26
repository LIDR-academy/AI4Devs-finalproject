/**
 * ViewerErrorBoundary - Error Boundary for 3D Viewer
 * T-1009-TEST-FRONT: Handles Three.js, WebGL, and GLB loading errors
 * 
 * @remarks
 * Catches errors from:
 * - WebGL initialization failures
 * - GLB file loading errors (404, network issues)
 * - Three.js parsing errors (corrupted files)
 * 
 * Provides graceful degradation - other modal tabs remain accessible.
 * 
 * @module ViewerErrorBoundary
 */

import React, { Component, ReactNode } from 'react';

interface ViewerErrorBoundaryProps {
  children: ReactNode;
}

interface ViewerErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary that catches 3D viewer errors
 * Displays user-friendly error messages while keeping other modal functionality working
 */
export class ViewerErrorBoundary extends Component<
  ViewerErrorBoundaryProps,
  ViewerErrorBoundaryState
> {
  constructor(props: ViewerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ViewerErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ViewerErrorBoundary] Caught error:', error, errorInfo);
  }

  /**
   * Determines error message based on error type
   */
  private getErrorMessage(): { title: string; detail: string } {
    const error = this.state.error;
    if (!error) {
      return {
        title: 'Error al cargar el modelo 3D',
        detail: 'Ha ocurrido un error inesperado.',
      };
    }

    const errorMessage = error.message.toLowerCase();

    // WebGL unavailable
    if (errorMessage.includes('webgl')) {
      return {
        title: 'WebGL no está disponible en este navegador',
        detail:
          'Tu navegador no soporta WebGL o está deshabilitado. Puedes consultar los metadatos y el reporte de validación en las otras pestañas.',
      };
    }

    // GLB file not found (404)
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return {
        title: 'Error al cargar el modelo 3D',
        detail: 'Archivo no encontrado en CDN. El archivo puede haber sido movido o eliminado.',
      };
    }

    // Corrupted GLB or parsing error
    if (
      errorMessage.includes('gltf') ||
      errorMessage.includes('parse') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('corrupted')
    ) {
      return {
        title: 'El archivo 3D está corrupto',
        detail:
          'El archivo no pudo ser leído correctamente. Puede estar dañado o en un formato incompatible.',
      };
    }

    // Generic Three.js/R3F error
    if (errorMessage.includes('r3f') || errorMessage.includes('hooks')) {
      return {
        title: 'Error de renderizado 3D',
        detail: 'Hubo un problema al inicializar el visor 3D. Intenta recargar la página.',
      };
    }

    // Generic error
    return {
      title: 'Error al cargar el modelo 3D',
      detail: error.message || 'Ha ocurrido un error desconocido al cargar el modelo.',
    };
  }

  render() {
    if (this.state.hasError) {
      const { title, detail } = this.getErrorMessage();

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              color: '#EF4444',
              marginBottom: '1rem',
            }}
          >
            🔴
          </div>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '0.5rem',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#6B7280',
              maxWidth: '500px',
              marginBottom: '1rem',
            }}
          >
            {detail}
          </p>
          {this.state.error?.message.toLowerCase().includes('corrupto') ||
          this.state.error?.message.toLowerCase().includes('gltf') ? (
            <button
              onClick={() => {
                console.warn('[ViewerErrorBoundary] Problema reportado:', this.state.error);
                alert('Problema reportado al equipo técnico.');
              }}
              style={{
                backgroundColor: '#2563EB',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Reportar problema
            </button>
          ) : null}
        </div>
      );
    }

    return this.props.children;
  }
}
