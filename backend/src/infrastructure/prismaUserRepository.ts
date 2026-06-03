import type { PrismaClient } from '@prisma/client'
import type { UserReadRepository } from '../application/ports/UserReadRepository'
import type { UserProfile } from '../domain/userProfile'

export function createPrismaUserRepository(prisma: PrismaClient): UserReadRepository {
  return {
    async findById(id: number): Promise<UserProfile | null> {
      const user = await prisma.user.findUnique({ where: { id } })
      if (!user) return null
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    },
  }
}
