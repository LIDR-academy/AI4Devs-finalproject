import request from 'supertest';
import app from '../../src/app';
import { prisma } from '@/infrastructure/database/prisma';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import path from 'path';

// Mock Prisma
jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    plan: {
      findUnique: jest.fn(),
    },
    layer: {
      create: jest.fn(),
    },
    projectMember: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock Queue
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn()
  }))
}));

describe('Layer Integration', () => {
  const planId = 'plan-123';
  const projectId = 'project-123';
  const userId = 'user-123';
  const layersUrl = `/api/plans/${planId}/layers`;
  let validToken: string;

  beforeAll(() => {
    validToken = jwt.sign({ userId, email: 'test@example.com', role: 'CLIENT' }, env.JWT_SECRET, {
      expiresIn: '1h',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/plans/:planId/layers', () => {
    it('should upload a PDF and return 202 Accepted', async () => {
      // Arrange
      // Mock Plan existence (Plan needs ProjectId to check permissions)
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue({ id: planId, projectId });

      // Mock Permissions
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
        projectId,
        userId,
        role: 'EDITOR',
      });

      // Mock Layer Creation
      (prisma.layer.create as jest.Mock).mockResolvedValue({
        id: 'layer-1',
        planId,
        name: 'My Layer',
        status: 'PROCESSING',
        type: 'BASE'
      });

      // Act
      // We send a buffer instead of real file to avoid fs dependency in test
      const response = await request(app)
        .post(layersUrl)
        .set('Authorization', `Bearer ${validToken}`)
        .field('layerName', 'My Layer')
        .field('layerType', 'BASE')
        .attach('file', Buffer.from('dummy pdf content'), 'test.pdf');

      // Assert
      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('id', 'layer-1');
      expect(response.body).toHaveProperty('status', 'PROCESSING');
    });

    it('should reject invalid file types', async () => {
      // Arrange
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue({ id: planId, projectId });
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
         projectId, userId, role: 'EDITOR' 
      });

      // Act
      const response = await request(app)
        .post(layersUrl)
        .set('Authorization', `Bearer ${validToken}`)
        .field('layerName', 'Bad File')
        .attach('file', Buffer.from('text content'), 'test.txt');

      // Assert
      expect(response.status).toBe(400); // Bad Request
    });
  });
});
