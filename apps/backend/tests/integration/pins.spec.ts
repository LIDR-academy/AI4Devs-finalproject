import request from 'supertest';
import app from '../../src/app';
import { prisma } from '@/infrastructure/database/prisma';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

// Mock Prisma
jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    layer: { findUnique: jest.fn() },
    pin: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    comment: { create: jest.fn(), findMany: jest.fn() },
    projectMember: { findUnique: jest.fn() },
    project: { findUnique: jest.fn() },
  },
}));

describe('Pin Integration Tests', () => {
  let validToken: string;
  let guestToken: string;
  const layerId = 'layer-123';
  const projectId = 'project-123';
  const userId = 'user-123';

  beforeAll(() => {
    validToken = jwt.sign(
      { userId, email: 'test@example.com', role: 'CLIENT' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    guestToken = jwt.sign(
      { projectId, permissions: ['view', 'comment'], guestName: 'Guest User' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/layers/:layerId/pins', () => {
    it('should create a pin with initial comment as authenticated user', async () => {
      // Setup mocks
      (prisma.layer.findUnique as jest.Mock).mockResolvedValue({
        id: layerId,
        plan: { projectId },
      });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: projectId,
        shareToken: 'test-token',
        isPublic: false,
      });

      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
        projectId,
        userId,
        role: 'EDITOR',
      });

      (prisma.pin.create as jest.Mock).mockResolvedValue({
        id: 'pin-1',
        layerId,
        xCoord: 0.5,
        yCoord: 0.75,
        status: 'OPEN',
        createdBy: userId,
        guestName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (prisma.comment.create as jest.Mock).mockResolvedValue({
        id: 'comment-1',
        pinId: 'pin-1',
        content: 'This needs fixing',
        authorId: userId,
        guestName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const response = await request(app)
        .post(`/api/layers/${layerId}/pins`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          xCoord: 0.5,
          yCoord: 0.75,
          content: 'This needs fixing',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        xCoord: 0.5,
        yCoord: 0.75,
        status: 'OPEN',
        createdBy: userId,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.guestName).toBeNull();
      expect(response.body.comments).toHaveLength(1);
      expect(response.body.comments[0].content).toBe('This needs fixing');
    });

    it('should create a pin as guest user', async () => {
      (prisma.layer.findUnique as jest.Mock).mockResolvedValue({
        id: layerId,
        plan: { projectId },
      });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: projectId,
        shareToken: 'test-token',
        isPublic: false,
      });

      (prisma.pin.create as jest.Mock).mockResolvedValue({
        id: 'pin-2',
        layerId,
        xCoord: 0.3,
        yCoord: 0.4,
        status: 'OPEN',
        createdBy: null,
        guestName: 'Guest User',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      (prisma.comment.create as jest.Mock).mockResolvedValue({
        id: 'comment-2',
        pinId: 'pin-2',
        content: 'Guest comment',
        authorId: null,
        guestName: 'Guest User',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const response = await request(app)
        .post(`/api/layers/${layerId}/pins`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          xCoord: 0.3,
          yCoord: 0.4,
          content: 'Guest comment',
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.guestName).toBe('Guest User');
      expect(response.body.createdBy).toBeNull();
    });

    it('should reject invalid coordinates (> 1)', async () => {
      (prisma.layer.findUnique as jest.Mock).mockResolvedValue({
        id: layerId,
        plan: { projectId },
      });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: projectId,
      });

      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
        projectId,
        userId,
        role: 'EDITOR',
      });

      const response = await request(app)
        .post(`/api/layers/${layerId}/pins`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          xCoord: 1.5,
          yCoord: 0.5,
          content: 'Test',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('xCoord');
    });

    it('should reject invalid coordinates (< 0)', async () => {
      (prisma.layer.findUnique as jest.Mock).mockResolvedValue({
        id: layerId,
        plan: { projectId },
      });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: projectId,
      });

      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
        projectId,
        userId,
        role: 'EDITOR',
      });

      const response = await request(app)
        .post(`/api/layers/${layerId}/pins`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          xCoord: -0.1,
          yCoord: 0.5,
          content: 'Test',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('xCoord');
    });

    it('should reject missing content', async () => {
      (prisma.layer.findUnique as jest.Mock).mockResolvedValue({
        id: layerId,
        plan: { projectId },
      });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: projectId,
      });

      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
        projectId,
        userId,
        role: 'EDITOR',
      });

      const response = await request(app)
        .post(`/api/layers/${layerId}/pins`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          xCoord: 0.5,
          yCoord: 0.5,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('content');
    });

    it('should reject content exceeding 300 characters', async () => {
      (prisma.layer.findUnique as jest.Mock).mockResolvedValue({
        id: layerId,
        plan: { projectId },
      });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: projectId,
      });

      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
        projectId,
        userId,
        role: 'EDITOR',
      });

      const longContent = 'a'.repeat(301);

      const response = await request(app)
        .post(`/api/layers/${layerId}/pins`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          xCoord: 0.5,
          yCoord: 0.5,
          content: longContent,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('300');
    });

    it('should reject empty content (whitespace only)', async () => {
      (prisma.layer.findUnique as jest.Mock).mockResolvedValue({
        id: layerId,
        plan: { projectId },
      });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: projectId,
      });

      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
        projectId,
        userId,
        role: 'EDITOR',
      });

      const response = await request(app)
        .post(`/api/layers/${layerId}/pins`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          xCoord: 0.5,
          yCoord: 0.5,
          content: '   ',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('at least 1 character');
    });
  });

  describe('GET /api/pins/:pinId', () => {
    it('should get pin with comments', async () => {
      const pinId = 'pin-1';

      (prisma.pin.findUnique as jest.Mock).mockResolvedValue({
        id: pinId,
        layerId,
        xCoord: 0.5,
        yCoord: 0.5,
        status: 'OPEN',
        createdBy: userId,
        guestName: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (prisma.comment.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'comment-1',
          pinId,
          content: 'First comment',
          authorId: userId,
          guestName: null,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      (prisma.layer.findUnique as jest.Mock).mockResolvedValue({
        id: layerId,
        plan: { projectId },
      });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: projectId,
      });

      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
        projectId,
        userId,
        role: 'VIEWER',
      });

      const response = await request(app)
        .get(`/api/pins/${pinId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(pinId);
      expect(response.body.comments).toHaveLength(1);
    });

    it('should return 404 for non-existent pin', async () => {
      (prisma.pin.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/pins/non-existent')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/layers/:layerId/pins', () => {
    it('should list all pins for a layer', async () => {
      (prisma.layer.findUnique as jest.Mock).mockResolvedValue({
        id: layerId,
        plan: { projectId },
      });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: projectId,
      });

      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
        projectId,
        userId,
        role: 'VIEWER',
      });

      (prisma.pin.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'pin-1',
          layerId,
          xCoord: 0.5,
          yCoord: 0.5,
          status: 'OPEN',
          createdBy: userId,
          guestName: null,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'pin-2',
          layerId,
          xCoord: 0.3,
          yCoord: 0.7,
          status: 'RESOLVED',
          createdBy: userId,
          guestName: null,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const response = await request(app)
        .get(`/api/layers/${layerId}/pins`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pins).toHaveLength(2);
    });

    it('should filter pins by status', async () => {
      (prisma.layer.findUnique as jest.Mock).mockResolvedValue({
        id: layerId,
        plan: { projectId },
      });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: projectId,
      });

      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
        projectId,
        userId,
        role: 'VIEWER',
      });

      (prisma.pin.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'pin-1',
          layerId,
          xCoord: 0.5,
          yCoord: 0.5,
          status: 'OPEN',
          createdBy: userId,
          guestName: null,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const response = await request(app)
        .get(`/api/layers/${layerId}/pins?status=OPEN`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pins).toHaveLength(1);
      expect(response.body.pins[0].status).toBe('OPEN');
    });
  });

  describe('PATCH /api/pins/:pinId/status', () => {
    it('should allow authenticated user to resolve pin', async () => {
      const pinId = 'pin-1';

      (prisma.pin.findUnique as jest.Mock).mockResolvedValue({
        id: pinId,
        layerId,
        xCoord: 0.5,
        yCoord: 0.5,
        status: 'OPEN',
        createdBy: userId,
        guestName: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (prisma.pin.update as jest.Mock).mockResolvedValue({
        id: pinId,
        status: 'RESOLVED',
        updatedAt: new Date(),
      });

      const response = await request(app)
        .patch(`/api/pins/${pinId}/status`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'RESOLVED' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('RESOLVED');
    });

    it('should allow authenticated user to reopen pin', async () => {
      const pinId = 'pin-1';

      (prisma.pin.findUnique as jest.Mock).mockResolvedValue({
        id: pinId,
        layerId,
        xCoord: 0.5,
        yCoord: 0.5,
        status: 'RESOLVED',
        createdBy: userId,
        guestName: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (prisma.pin.update as jest.Mock).mockResolvedValue({
        id: pinId,
        status: 'OPEN',
        updatedAt: new Date(),
      });

      const response = await request(app)
        .patch(`/api/pins/${pinId}/status`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'OPEN' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OPEN');
    });

    it('should reject guest user from resolving pin', async () => {
      const pinId = 'pin-1';

      (prisma.pin.findUnique as jest.Mock).mockResolvedValue({
        id: pinId,
        status: 'OPEN',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .patch(`/api/pins/${pinId}/status`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ status: 'RESOLVED' });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Guest');
    });

    it('should reject invalid status', async () => {
      const pinId = 'pin-1';

      (prisma.pin.findUnique as jest.Mock).mockResolvedValue({
        id: pinId,
        status: 'OPEN',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .patch(`/api/pins/${pinId}/status`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'INVALID' });

      expect(response.status).toBe(500); // Will be caught as general error
    });
  });

  describe('DELETE /api/pins/:pinId', () => {
    it('should allow creator to delete their pin', async () => {
      const pinId = 'pin-1';

      (prisma.pin.findUnique as jest.Mock).mockResolvedValue({
        id: pinId,
        createdBy: userId,
        guestName: null,
        deletedAt: null,
        layerId,
        xCoord: 0.5,
        yCoord: 0.5,
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (prisma.pin.update as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .delete(`/api/pins/${pinId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(204);
    });

    it('should reject non-creator from deleting pin', async () => {
      const pinId = 'pin-1';

      (prisma.pin.findUnique as jest.Mock).mockResolvedValue({
        id: pinId,
        createdBy: 'another-user',
        guestName: null,
        deletedAt: null,
        layerId,
        xCoord: 0.5,
        yCoord: 0.5,
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .delete(`/api/pins/${pinId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(403);
    });

    it('should allow guest to delete their own pin', async () => {
      const pinId = 'pin-1';

      (prisma.pin.findUnique as jest.Mock).mockResolvedValue({
        id: pinId,
        createdBy: null,
        guestName: 'Guest User',
        deletedAt: null,
        layerId,
        xCoord: 0.5,
        yCoord: 0.5,
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (prisma.pin.update as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .delete(`/api/pins/${pinId}`)
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(204);
    });
  });
});
