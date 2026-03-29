import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/infrastructure/database/prisma';

export const guestAccessMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.role === 'GUEST') {
    // Extract the requested projectId from params or resolve from layerId
    let requestedProjectId = req.params.projectId || req.params.id;
    
    // If we have layerId but not projectId, fetch it from the layer
    if (!requestedProjectId && req.params.layerId) {
      try {
        const layer = await prisma.layer.findUnique({
          where: { id: req.params.layerId },
          select: { plan: { select: { projectId: true } } }
        });
        
        if (!layer) {
          return res.status(404).json({ error: 'Layer not found' });
        }
        
        requestedProjectId = layer.plan.projectId;
      } catch (error) {
        console.error('Error fetching layer project:', error);
        return res.status(500).json({ error: 'Failed to validate access' });
      }
    }
    
    // If we have pinId but not projectId, fetch it from the pin
    if (!requestedProjectId && req.params.pinId) {
      try {
        const pin = await prisma.pin.findUnique({
          where: { id: req.params.pinId },
          select: { layer: { select: { plan: { select: { projectId: true } } } } }
        });
        
        if (!pin) {
          return res.status(404).json({ error: 'Pin not found' });
        }
        
        requestedProjectId = pin.layer.plan.projectId;
      } catch (error) {
        console.error('Error fetching pin project:', error);
        return res.status(500).json({ error: 'Failed to validate access' });
      }
    }
    
    if (!requestedProjectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    // Verify guest can only access their assigned project
    if (requestedProjectId !== user.projectId) {
      return res.status(403).json({ 
        error: 'Access denied: Guest can only access assigned project' 
      });
    }

    // Guest can POST for creating pins/comments (US-005)
    // but cannot UPDATE or DELETE
    if (['PATCH', 'PUT', 'DELETE'].includes(req.method)) {
      return res.status(403).json({
        error: 'Access denied: Guest cannot modify existing resources'
      });
    }
  }
  
  return next();
};
