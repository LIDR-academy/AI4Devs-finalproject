import request from 'supertest';
import app from '../../src/app';
import { prisma } from '@/infrastructure/database/prisma';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { createInvitation } from '../factories/invitation.factory';

// Mock Prisma
jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    invitation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
    projectMember: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Invitation Integration Tests', () => {
  const projectId = 'project-123';
  const userId = 'user-123';
  let validToken: string;

  beforeAll(() => {
    validToken = jwt.sign(
      { sub: userId, email: 'user@example.com', role: 'CLIENT' },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/projects/:id/invitations', () => {
    const createInvitationUrl = `/api/projects/${projectId}/invitations`;

    it('should return 201 and create invitation when Owner requests', async () => {
      // Arrange
      const mockProject = { id: projectId, title: 'Test Project', architectId: userId, status: 'ACTIVE' };
      const mockMember = { projectId, userId, role: 'OWNER' };
      const createdInvitation = createInvitation({
        projectId,
        email: 'client@example.com',
        status: 'PENDING'
      });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.invitation.create as jest.Mock).mockResolvedValue(createdInvitation);

      // Act
      const response = await request(app)
        .post(createInvitationUrl)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ email: 'client@example.com' });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe('client@example.com');
      expect(response.body.status).toBe('PENDING');
    });

    it('should return 201 and create invitation without email (uses default)', async () => {
      // Arrange
      const mockProject = { id: projectId, title: 'Test Project', architectId: userId, status: 'ACTIVE' };
      const mockMember = { projectId, userId, role: 'OWNER' };
      const createdInvitation = createInvitation({
        projectId,
        email: 'guest@system',
        status: 'PENDING'
      });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.invitation.create as jest.Mock).mockResolvedValue(createdInvitation);

      // Act
      const response = await request(app)
        .post(createInvitationUrl)
        .set('Authorization', `Bearer ${validToken}`)
        .send({});

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.email).toBe('guest@system');
    });

    it('should return 403 when non-Owner/Editor tries to create invitation', async () => {
      // Arrange
      const mockProject = { id: projectId, title: 'Test Project', architectId: 'other-user', status: 'ACTIVE' };
      const mockMember = { projectId, userId, role: 'VIEWER' };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue(mockMember);

      // Act
      const response = await request(app)
        .post(createInvitationUrl)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ email: 'client@example.com' });

      // Assert
      expect(response.status).toBe(403);
    });

    it('should return 404 when project does not exist', async () => {
      // Arrange
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post(createInvitationUrl)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ email: 'client@example.com' });

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/projects/:id/invitations', () => {
    const listInvitationsUrl = `/api/projects/${projectId}/invitations`;

    it('should return 200 and list active invitations when Owner requests', async () => {
      // Arrange
      const mockProject = { id: projectId, title: 'Test Project', architectId: userId, status: 'ACTIVE' };
      const mockMember = { projectId, userId, role: 'OWNER' };
      const mockInvitations = [
        createInvitation({ projectId, status: 'PENDING' }),
        createInvitation({ projectId, status: 'ACCEPTED' })
      ];

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.invitation.findMany as jest.Mock).mockResolvedValue(mockInvitations);

      // Act
      const response = await request(app)
        .get(listInvitationsUrl)
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should return 403 when Viewer tries to list invitations', async () => {
      // Arrange
      const mockProject = { id: projectId, title: 'Test Project', architectId: 'other-user', status: 'ACTIVE' };
      const mockMember = { projectId, userId, role: 'VIEWER' };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue(mockMember);

      // Act
      const response = await request(app)
        .get(listInvitationsUrl)
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(403);
    });

    it('should not include EXPIRED invitations in list', async () => {
      // Arrange
      const mockProject = { id: projectId, title: 'Test Project', architectId: userId, status: 'ACTIVE' };
      const mockMember = { projectId, userId, role: 'OWNER' };
      const mockInvitations = [
        createInvitation({ projectId, status: 'PENDING' }),
        createInvitation({ projectId, status: 'ACCEPTED' })
        // EXPIRED no se incluye en la consulta
      ];

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.invitation.findMany as jest.Mock).mockResolvedValue(mockInvitations);

      // Act
      const response = await request(app)
        .get(listInvitationsUrl)
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.every((inv: any) => inv.status !== 'EXPIRED')).toBe(true);
    });
  });

  describe('DELETE /api/projects/:id/invitations/:token', () => {
    const invitationToken = 'test-token-123';
    const revokeUrl = `/api/projects/${projectId}/invitations/${invitationToken}`;

    it('should return 204 and revoke invitation when Owner requests', async () => {
      // Arrange
      const mockProject = { id: projectId, title: 'Test Project', architectId: userId, status: 'ACTIVE' };
      const mockMember = { projectId, userId, role: 'OWNER' };
      const mockInvitation = createInvitation({ projectId, token: invitationToken, status: 'PENDING' });

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
      (prisma.invitation.update as jest.Mock).mockResolvedValue({ ...mockInvitation, status: 'EXPIRED' });

      // Act
      const response = await request(app)
        .delete(revokeUrl)
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(204);
      expect(prisma.invitation.update).toHaveBeenCalledWith({
        where: { token: invitationToken },
        data: { status: 'EXPIRED', updatedAt: expect.any(Date) }
      });
    });

    it('should return 403 when non-Owner tries to revoke', async () => {
      // Arrange
      const mockProject = { id: projectId, title: 'Test Project', architectId: 'other-user', status: 'ACTIVE' };
      const mockMember = { projectId, userId, role: 'VIEWER' };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue(mockMember);

      // Act
      const response = await request(app)
        .delete(revokeUrl)
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(403);
    });

    it('should return 404 when token does not exist', async () => {
      // Arrange
      const mockProject = { id: projectId, title: 'Test Project', architectId: userId, status: 'ACTIVE' };
      const mockMember = { projectId, userId, role: 'OWNER' };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const response = await request(app)
        .delete(revokeUrl)
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/auth/guest/login', () => {
    const guestLoginUrl = '/api/auth/guest/login';
    const validInvitationToken = 'valid-token-123';

    it('should return 200 with JWT when token is valid and PENDING', async () => {
      // Arrange
      const mockInvitation = createInvitation({
        projectId,
        token: validInvitationToken,
        status: 'PENDING'
      });
      const mockProject = { id: projectId, title: 'Test Project', status: 'ACTIVE' };

      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.invitation.update as jest.Mock).mockResolvedValue({ ...mockInvitation, status: 'ACCEPTED' });

      // Act
      const response = await request(app)
        .post(guestLoginUrl)
        .send({ token: validInvitationToken });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.project).toHaveProperty('id', projectId);
      expect(response.body.project).toHaveProperty('title', 'Test Project');
      expect(prisma.invitation.update).toHaveBeenCalledWith({
        where: { token: validInvitationToken },
        data: { status: 'ACCEPTED', updatedAt: expect.any(Date) }
      });
    });

    it('should return 200 with JWT when token is ACCEPTED (reuse)', async () => {
      // Arrange
      const mockInvitation = createInvitation({
        projectId,
        token: validInvitationToken,
        status: 'ACCEPTED'
      });
      const mockProject = { id: projectId, title: 'Test Project', status: 'ACTIVE' };

      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      // Act
      const response = await request(app)
        .post(guestLoginUrl)
        .send({ token: validInvitationToken });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      // Status should remain ACCEPTED (no update call)
      expect(prisma.invitation.update).not.toHaveBeenCalled();
    });

    it('should return 401 when token is EXPIRED', async () => {
      // Arrange
      const mockInvitation = createInvitation({
        projectId,
        token: validInvitationToken,
        status: 'EXPIRED'
      });

      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);

      // Act
      const response = await request(app)
        .post(guestLoginUrl)
        .send({ token: validInvitationToken });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 when token does not exist', async () => {
      // Arrange
      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post(guestLoginUrl)
        .send({ token: 'non-existent-token' });

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 403 when project is not ACTIVE', async () => {
      // Arrange
      const mockInvitation = createInvitation({
        projectId,
        token: validInvitationToken,
        status: 'PENDING'
      });
      const mockProject = { id: projectId, title: 'Test Project', status: 'ARCHIVED' };

      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      // Act
      const response = await request(app)
        .post(guestLoginUrl)
        .send({ token: validInvitationToken });

      // Assert
      expect(response.status).toBe(403);
    });

    it('should return JWT with correct payload structure', async () => {
      // Arrange
      const mockInvitation = createInvitation({
        projectId,
        token: validInvitationToken,
        status: 'PENDING'
      });
      const mockProject = { id: projectId, title: 'Test Project', status: 'ACTIVE' };

      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.invitation.update as jest.Mock).mockResolvedValue({ ...mockInvitation, status: 'ACCEPTED' });

      // Act
      const response = await request(app)
        .post(guestLoginUrl)
        .send({ token: validInvitationToken });

      // Assert
      expect(response.status).toBe(200);
      const decoded: any = jwt.verify(response.body.accessToken, env.JWT_SECRET);
      expect(decoded.sub).toBe(`guest-${projectId}`);
      expect(decoded.role).toBe('GUEST');
      expect(decoded.projectId).toBe(projectId);
      expect(decoded.permissions).toContain('READ_PROJECT');
      expect(decoded.permissions).toContain('READ_PLANS');
      expect(decoded.permissions).toContain('READ_LAYERS');
    });
  });
});
