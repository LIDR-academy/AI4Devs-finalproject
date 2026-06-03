import type { PrismaClient } from '@prisma/client'
import cors from 'cors'
import express, { type Express } from 'express'
import { config } from '../../config.js'
import { getUserProfileById } from '../../application/getUserProfile'
import { createPrismaUserRepository } from '../../infrastructure/prismaUserRepository'
import { asyncHandler } from './middleware/asyncHandler'
import { errorHandler } from './middleware/errorHandler'

export function createApp(prisma: PrismaClient): Express {
  const app = express()
  const userRepository = createPrismaUserRepository(prisma)
  const origin = config.corsOrigin

  app.use(
    cors({
      origin,
      credentials: false,
    })
  )

  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.get(
    '/api/profile',
    asyncHandler(async (_req, res) => {
      const user = await getUserProfileById(userRepository, 1)

      if (!user) {
        return res.status(404).json({ error: 'Usuario con id 1 no encontrado' })
      }

      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
      })
    })
  )

  app.use(errorHandler)

  return app
}
