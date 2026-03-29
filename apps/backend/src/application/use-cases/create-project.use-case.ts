
import { randomUUID } from 'crypto';
import { IProjectRepository } from '../../domain/repositories/project.repository';
import { CreateProjectDto } from '../../domain/dtos/create-project.dto';
import { Project } from '../../domain/entities/project.entity';
import { MaxProjectsLimitReachedError } from '../../domain/errors/project.errors';
import { IUserRepository } from '../../domain/repositories/user.repository';

export class CreateProjectUseCase {
  constructor(
    private projectRepository: IProjectRepository,
    private userRepository: IUserRepository 
  ) {}

  async execute(userId: string, dto: CreateProjectDto): Promise<Project> {
    // 1. Check User Subscription Tier
    const user = await this.userRepository.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (user.subscriptionTier === 'FREE') {
        const activeProjectsCount = await this.projectRepository.countActiveByUserId(userId);
        if (activeProjectsCount >= 3) {
            throw new MaxProjectsLimitReachedError();
        }
    }

    // 2. Create Project
    const project = new Project(
        randomUUID(),
        dto.title,
        userId,
        'ACTIVE',
        dto.description,
        null, // shareToken
        false, // isPublic
        new Date(), // createdAt
        new Date(), // updatedAt
        null // deletedAt
    );

    // 3. Persist
    await this.projectRepository.save(project);

    return project;
  }
}
