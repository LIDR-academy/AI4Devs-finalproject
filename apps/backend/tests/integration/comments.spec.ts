import request from 'supertest';
import app from '../../src/app';
import { prisma } from '@/infrastructure/database/prisma';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

// Mock Prisma
jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    layer: { findUnique: jest.fn() },
    pin: { findUnique: jest.fn() },
    comment: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    projectMember: { findUnique: jest.fn() },
    project: { findUnique: jest.fn() },
  },
}));

describe('Comment Integration Tests', () => {
  let validToken: string;
  let guestToken: string;
  const pinId = 'pin-123';
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

  describe('POST /api/pins/:pinId/comments', () => {
    it('should add comment to existing pin', async () => {
      (prisma.pin.findUnique as jest.Mock).mockResolvedValue({
        id: pinId,
        layerId,
        deletedAt: null,
        xCoord: 0.5,
        yCoord: 0.5,
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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

      (prisma.comment.create as jest.Mock).mockResolvedValue({
        id: 'comment-1',
        pinId,
        content: 'Additional feedback',
        authorId: userId,
        guestName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const response = await request(app)
        .post(`/api/pins/${pinId}/comments`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ content: 'Additional feedback' });

      expect(response.status).toBe(201);
      expect(response.body.content).toBe('Additional feedback');
      expect(response.body.authorId).toBe(userId);
    });

    it('should add comment as guest user', async () => {
      (prisma.pin.findUnique as jest.Mock).mockResolvedValue({
        id: pinId,
        layerId,
        deletedAt: null,
        xCoord: 0.5,
        yCoord: 0.5,
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (prisma.layer.findUnique as jest.Mock).mockResolvedValue({
        id: layerId,
        plan: { projectId },
      });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: projectId,
      });

      (prisma.comment.create as jest.Mock).mockResolvedValue({
        id: 'comment-2',
        pinId,
        content: 'Guest feedback',
        authorId: null,
        guestName: 'Guest User',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const response = await request(app)
        .post(`/api/pins/${pinId}/comments`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ content: 'Guest feedback' });

      expect(response.status).toBe(201);
      expect(response.body.guestName).toBe('Guest User');
      expect(response.body.authorId).toBeNull();
    });

    it('should reject empty comment', async () => {
      (prisma.pin.findUnique as jest.Mock).mockResolvedValue({
        id: pinId,
        layerId,
        deletedAt: null,
        xCoord: 0.5,
        yCoord: 0.5,
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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
        .post(`/api/pins/${pinId}/comments`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ content: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('at least 1 character');
    });

    it('should reject comment exceeding 300 characters', async () => {
      (prisma.pin.findUnique as jest.Mock).mockResolvedValue({
        id: pinId,
        layerId,
        deletedAt: null,
        xCoord: 0.5,
        yCoord: 0.5,
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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

      const longContent = 'a'.repeat(301);

      const response = await request(app)
        .post(`/api/pins/${pinId}/comments`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ content: longContent });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('300');
    });

    it('should reject comment on non-existent pin', async () => {
      (prisma.pin.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post(`/api/pins/${pinId}/comments`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ content: 'Test comment' });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Pin');
    });

    it('should reject comment with whitespace only', async () => {
      (prisma.pin.findUnique as jest.Mock).mockResolvedValue({
        id: pinId,
        layerId,
        deletedAt: null,
        xCoord: 0.5,
        yCoord: 0.5,
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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
        .post(`/api/pins/${pinId}/comments`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ content: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('at least 1 character');
    });
  });

  describe('DELETE /api/comments/:commentId', () => {
    it('should allow creator to delete their comment', async () => {
      const commentId = 'comment-1';

      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
        id: commentId,
        pinId,
        content: 'Test comment',
        authorId: userId,
        guestName: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (prisma.comment.update as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(204);
    });

    it('should reject non-creator from deleting comment', async () => {
      const commentId = 'comment-1';

      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
        id: commentId,
        pinId,
        content: 'Test comment',
        authorId: 'another-user',
        guestName: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('creator');
    });

    it('should allow guest to delete their own comment', async () => {
      const commentId = 'comment-1';

      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
        id: commentId,
        pinId,
        content: 'Guest comment',
        authorId: null,
        guestName: 'Guest User',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (prisma.comment.update as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent comment', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/comments/non-existent')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 404 for already deleted comment', async () => {
      const commentId = 'comment-1';

      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
        id: commentId,
        pinId,
        content: 'Test comment',
        authorId: userId,
        guestName: null,
        deletedAt: new Date(), // Already deleted
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });
  });
});
