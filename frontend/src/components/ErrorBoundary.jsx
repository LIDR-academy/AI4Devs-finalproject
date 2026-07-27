// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: this.handleReset,
        });
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 mb-2" style={{ fontFamily: "'Chivo', sans-serif" }}>
                Algo salio mal
              </h1>
              <p className="text-sm text-zinc-500">
                Ha ocurrido un error inesperado. Podes intentar recargar la pagina o volver al inicio.
              </p>
              {this.state.error && (
                <details className="mt-3 text-left">
                  <summary className="text-xs text-zinc-400 cursor-pointer hover:text-zinc-600">
                    Detalles tecnicos
                  </summary>
                  <pre className="mt-2 p-3 bg-zinc-50 text-xs text-zinc-600 overflow-auto max-h-32 text-left">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-deep-navy text-white hover:bg-zinc-800 transition-colors"
                data-testid="error-boundary-retry"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-zinc-200 text-zinc-900 hover:bg-zinc-50 transition-colors"
                data-testid="error-boundary-home"
              >
                <Home className="w-4 h-4" />
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
