import { useUserProfile } from '../../application/useUserProfile'

/**
 * Tarjeta de “usuario logueado” en la esquina superior.
 * Petición relativa `/api/profile`: en desarrollo Vite (vite.config.ts) hace proxy al API en :3001.
 */
export default function UserProfileCard() {
  const { user, loading, error } = useUserProfile()

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm max-w-xs text-left">
      {loading && <p className="text-sm text-gray-500">Cargando perfil…</p>}

      {!loading && error && <p className="text-sm text-gray-500">{error}</p>}

      {!loading && !error && user && (
        <>
          {/* Nombre: mismo peso visual que títulos secundarios de la app */}
          <p className="font-semibold text-gray-800 truncate" title={user.name ?? undefined}>
            {user.name ?? 'Sin nombre'}
          </p>
          <p className="text-sm text-gray-600 truncate mt-0.5" title={user.email}>
            {user.email}
          </p>
        </>
      )}
    </div>
  )
}
