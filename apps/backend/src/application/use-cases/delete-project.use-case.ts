
import { IProjectRepository } from '../../domain/repositories/project.repository';
import { ProjectNotFoundError } from '../../domain/errors/project.errors';
import { Project } from '../../domain/entities/project.entity';

export class DeleteProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(userId: string, projectId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
        throw new ProjectNotFoundError();
    }

    if (project.architectId !== userId) {
        throw new ProjectNotFoundError(); // Or ForbiddenError, but usually 404 is safer/standard to hide existence
    }

    // Soft Delete
    const updatedProject = {
        ...project,
        status: 'ARCHIVED',
        deletedAt: new Date(),
        updatedAt: new Date()
    };
    
    // We need to cast back to Project or create a method in entity to 'archive'
    // Cleaner: project.archive() -> method on entity. For now simple assignment.
    // However, project props are readonly.
    // Let's assume I should update the entity logic or recreate it.
    
    // Simplest approach: Pass updated object to repository update (which expects Project)
    // But Project class has readonly props.
    // I should create a new instance or add a method 'delete()' to the entity that returns a new instance.
    
    // Let's try to stick to "Anemic Domain Model" for now as done in `create-project.use-case.ts` (new Project(...))
    // Recreating the project object with new status
    const deletedProject = new Project(
        project.id,
        project.title,
        project.architectId,
        'ARCHIVED', // status
        project.description,
        project.shareToken,
        project.isPublic,
        project.createdAt,
        new Date(), // updatedAt
        new Date()  // deletedAt
    );

    await this.projectRepository.update(deletedProject);
  }
}
