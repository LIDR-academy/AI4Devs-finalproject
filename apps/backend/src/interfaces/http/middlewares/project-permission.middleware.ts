import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/infrastructure/database/prisma';
import { ProjectRole } from '@prisma/client';

export const ensureProjectPermission = (allowedRoles: ProjectRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore - 'user' is populated by authMiddleware
    const userId = req.user?.userId;
    // @ts-ignore
    const userRole = req.user?.role;
    // @ts-ignore
    const guestProjectId = req.user?.projectId;
    const projectId = req.params.projectId || req.body.projectId;

    // Verificar autenticación (guests tienen userId null pero tienen role y projectId)
    if (!userId && userRole !== 'GUEST') {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    try {
      // Special case: GUEST users
      if (userRole === 'GUEST') {
        // Guests can only access their assigned project
        if (guestProjectId !== projectId) {
          return res.status(403).json({ error: 'Access denied' });
        }
        
        // Guests have read-only permissions (equivalent to VIEWER)
        if (allowedRoles.includes(ProjectRole.VIEWER)) {
          return next();
        }
        
        return res.status(403).json({ error: 'Guests have read-only access' });
      }

      // 1. Check if user is member of the project
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      });

      if (!membership) {
        // Fallback: Check if user is the architect (owner) directly
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { architectId: true }
        });

        if (project && project.architectId === userId) {
          // If the requirements allow OWNER, and user is the architect, let them pass
          if (allowedRoles.includes(ProjectRole.OWNER)) {
            return next();
          }
        }

        return res.status(403).json({ error: 'Access denied' });
      }

      // 2. Check role
      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};
