import type { UserProfile } from '../../domain/userProfile'

export interface UserReadRepository {
  findById(id: number): Promise<UserProfile | null>
}
