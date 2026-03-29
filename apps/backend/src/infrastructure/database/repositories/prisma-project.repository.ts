
import { IProjectRepository } from '../../../domain/repositories/project.repository';
import { Project, ProjectStatus } from '../../../domain/entities/project.entity';
import { prisma } from '../prisma';

export class PrismaProjectRepository implements IProjectRepository {
  async save(project: Project): Promise<void> {
    // Transactional create: Project + Owner Membership
    await prisma.$transaction(async (tx) => {
      await tx.project.create({
        data: {
          id: project.id,
          title: project.title,
          description: project.description,
          architectId: project.architectId,
          status: project.status,
          shareToken: project.shareToken,
          isPublic: project.isPublic,
          createdAt: project.createdAt || new Date(),
          updatedAt: project.updatedAt || new Date(),
        },
      });

      // Automatically add owner as member
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: project.architectId,
          role: 'OWNER',
        }
      });
    });
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const projects = await prisma.project.findMany({
      where: {
        architectId: userId,
        deletedAt: null 
      },
      orderBy: { updatedAt: 'desc' }
    });

    return projects.map(p => new Project(
      p.id,
      p.title,
      p.architectId,
      p.status as ProjectStatus,
      p.description,
      p.shareToken,
      p.isPublic,
      p.createdAt,
      p.updatedAt,
      p.deletedAt
    ));
  }

  async countActiveByUserId(userId: string): Promise<number> {
    return await prisma.project.count({
      where: {
        architectId: userId,
        status: 'ACTIVE',
        deletedAt: null
      }
    });
  }

  async findById(id: string): Promise<Project | null> {
    const p = await prisma.project.findUnique({
      where: { id }
    });

    if (!p) return null;

    return new Project(
        p.id,
        p.title,
        p.architectId,
        p.status as ProjectStatus,
        p.description,
        p.shareToken,
        p.isPublic,
        p.createdAt,
        p.updatedAt,
        p.deletedAt
    );
  }

  async findByShareToken(token: string): Promise<Project | null> {
    const p = await prisma.project.findUnique({
      where: { shareToken: token }
    });

    if (!p) return null;

    return new Project(
      p.id,
      p.title,
      p.architectId,
      p.status as ProjectStatus,
      p.description,
      p.shareToken,
      p.isPublic,
      p.createdAt,
      p.updatedAt,
      p.deletedAt
    );
  }

  async update(project: Project): Promise<void> {
      await prisma.project.update({
          where: { id: project.id },
          data: {
              title: project.title,
              description: project.description,
              status: project.status,
              deletedAt: project.deletedAt,
              updatedAt: new Date()
          }
      });
  }
}
