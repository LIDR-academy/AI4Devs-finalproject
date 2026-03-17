/**
 * DevIndicator atom component
 * Displays a development mode badge when using mock data
 * Only visible in development environment
 */

interface DevIndicatorProps {
  isUsingMockData: boolean;
  className?: string;
}

export const DevIndicator = ({ isUsingMockData, className = '' }: DevIndicatorProps) => {
  // Only show in development mode
  if (!import.meta.env.DEV || !isUsingMockData) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-medium ${className}`}
      role="status"
      aria-label="Modo desarrollo activo"
    >
      <span className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" aria-hidden="true" />
      <span>Modo desarrollo - Datos de prueba</span>
    </div>
  );
};
