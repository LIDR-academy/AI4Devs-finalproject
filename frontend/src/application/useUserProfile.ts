import { useEffect, useState } from 'react'
import { fetchUserProfile } from '../infrastructure/profileApi'
import type { ProfileUserDto } from '../infrastructure/profileApi'

export function useUserProfile() {
  const [user, setUser] = useState<ProfileUserDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const result = await fetchUserProfile()
      if (cancelled) return
      if (result.ok) {
        setUser(result.user)
        setError(null)
      } else {
        setError(result.error)
        setUser(null)
      }
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return { user, loading, error }
}
