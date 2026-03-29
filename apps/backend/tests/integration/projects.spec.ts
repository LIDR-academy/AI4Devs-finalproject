import request from 'supertest';
import app from '../../src/app';
import { prisma } from '@/infrastructure/database/prisma';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

// Mock Prisma
jest.mock('@/infrastructure/database/prisma', () => {
  const mockCreate = jest.fn();
  const mockFindMany = jest.fn();
  const mockCount = jest.fn();
  const mockFindUnique = jest.fn();
  const mockUpdate = jest.fn();
  const mockUserFindUnique = jest.fn();
  const mockProjectMemberCreate = jest.fn();

  return {
    prisma: {
      project: {
        create: mockCreate,
        findMany: mockFindMany,
        count: mockCount,
        findUnique: mockFindUnique,
        update: mockUpdate,
      },
      user: {
        findUnique: mockUserFindUnique,
      },
      projectMember: {
        create: mockProjectMemberCreate,
      },
      $transaction: jest.fn(async (callback) => {
        // Create a mock transaction context
        const tx = {
          project: { create: mockCreate },
          projectMember: { create: mockProjectMemberCreate },
        };
        return callback(tx);
      }),
    },
  };
});

describe('Project Integration', () => {
  const projectsUrl = '/api/projects'; // Adjusted based on likely prefix
  let validToken: string;
  const userId = 'user-uuid-123';

  beforeAll(() => {
    // Generate a valid JWT for the test user
    validToken = jwt.sign({ userId, email: 'test@example.com', role: 'CLIENT' }, env.JWT_SECRET, {
      expiresIn: '1h',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/projects', () => {
    it('should create a project successfully when user has available slots (FREE tier)', async () => {
      // Arrange
      const projectData = { title: 'New House', description: 'A lovely place' };
      
      // Mock User retrieval (for Tier check)
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        subscriptionTier: 'FREE',
      });

      // Mock Count of active projects
      (prisma.project.count as jest.Mock).mockResolvedValue(0);

      // Mock Project Creation
      (prisma.project.create as jest.Mock).mockResolvedValue({
        id: 'project-uuid-1',
        ...projectData,
        architectId: userId,
        status: 'ACTIVE',
        shareToken: null,
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      // Mock ProjectMember Creation
      (prisma.projectMember.create as jest.Mock).mockResolvedValue({
        id: 'member-uuid-1',
        projectId: 'project-uuid-1',
        userId,
        role: 'OWNER',
      });

      // Act
      const response = await request(app)
        .post(projectsUrl)
        .set('Authorization', `Bearer ${validToken}`)
        .send(projectData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(projectData.title);
    });

    it('should return 403 Forbidden when FREE user reaches limit (3 active projects)', async () => {
      // Arrange
      const projectData = { title: '4th Project' };

      // Mock User
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        subscriptionTier: 'FREE',
      });

      // Mock Count (Already has 3)
      (prisma.project.count as jest.Mock).mockResolvedValue(3);

      // Act
      const response = await request(app)
        .post(projectsUrl)
        .set('Authorization', `Bearer ${validToken}`)
        .send(projectData);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should create a project successfully when user is PRO (unlimited)', async () => {
        // Arrange
        const projectData = { title: 'Pro Project' };
  
        // Mock User (PRO)
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
          id: userId,
          subscriptionTier: 'PRO',
        });
  
        // Mock Count (Has 10 projects)
        (prisma.project.count as jest.Mock).mockResolvedValue(10);

        (prisma.project.create as jest.Mock).mockResolvedValue({
            id: 'project-uuid-pro',
            ...projectData,
            architectId: userId,
            status: 'ACTIVE',
            shareToken: null,
            isPublic: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        });

        // Mock ProjectMember Creation
        (prisma.projectMember.create as jest.Mock).mockResolvedValue({
          id: 'member-uuid-pro',
          projectId: 'project-uuid-pro',
          userId,
          role: 'OWNER',
        });
  
        // Act
        const response = await request(app)
          .post(projectsUrl)
          .set('Authorization', `Bearer ${validToken}`)
          .send(projectData);
  
        // Assert
        expect(response.status).toBe(201);
      });
  });

  describe('GET /api/projects', () => {
    it('should return list of user projects', async () => {
      // Arrange
      const mockProjects = [
        { id: 'p1', title: 'Project 1', architectId: userId },
        { id: 'p2', title: 'Project 2', architectId: userId },
      ];
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      // Act
      const response = await request(app)
        .get(projectsUrl)
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete a project successfully', async () => {
      // Arrange
      const projectId = 'project-to-delete';
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: projectId,
        architectId: userId,
        status: 'ACTIVE',
      });
      // Mock update (soft delete)
      (prisma.project.update as jest.Mock).mockResolvedValue({
        id: projectId,
        status: 'ARCHIVED',
        deletedAt: new Date(),
      });

      // Act
      const response = await request(app)
        .delete(`${projectsUrl}/${projectId}`)
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(204);
    });

    it('should return 404 if project not found', async () => {
        // Arrange
        const projectId = 'non-existent';
        (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);
  
        // Act
        const response = await request(app)
          .delete(`${projectsUrl}/${projectId}`)
          .set('Authorization', `Bearer ${validToken}`);
  
        // Assert
        expect(response.status).toBe(404);
    });
  });
});
