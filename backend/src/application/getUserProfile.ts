import type { UserReadRepository } from './ports/UserReadRepository'
import type { UserProfile } from '../domain/userProfile'

export async function getUserProfileById(
  repo: UserReadRepository,
  id: number
): Promise<UserProfile | null> {
  return repo.findById(id)
}
