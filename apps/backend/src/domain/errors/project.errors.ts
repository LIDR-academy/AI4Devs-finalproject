
export class MaxProjectsLimitReachedError extends Error {
  constructor() {
    super('Maximum number of active projects reached for Free plan.');
    this.name = 'MaxProjectsLimitReachedError';
  }
}

export class ProjectNotFoundError extends Error {
    constructor() {
        super('Project not found');
        this.name = 'ProjectNotFoundError';
    }
}
