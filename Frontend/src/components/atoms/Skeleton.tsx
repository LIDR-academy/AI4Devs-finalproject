interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton atom component
 * Loading placeholder component for better UX
 */
export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded ${className}`}
      aria-label="Cargando..."
      role="status"
    />
  );
};
