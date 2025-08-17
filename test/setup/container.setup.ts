import { DockerComposeEnvironment, StartedDockerComposeEnvironment } from 'testcontainers';
import { join } from 'path';
import { execSync } from 'child_process';

export class ContainerSetup {
  private environment: StartedDockerComposeEnvironment | null = null;
  private readonly projectName?: string = process.env.PROJECT_NAME;

  async startContainers(): Promise<void> {
    if (await this.areContainersRunning()) {
      console.log(`Containers for project '${this.projectName}' are already running, skipping startup`);
      return;
    }

    const pwd = join(process.cwd());
    
    const composeFilePath = join(pwd, 'docker-compose.yml');
    const environmentFilePath = join(pwd, '.env.test');

    const environment = new DockerComposeEnvironment(pwd, composeFilePath)
        .withEnvironmentFile(environmentFilePath)

    if (this.projectName) {
        environment.withProjectName(this.projectName);
    }
    
    this.environment = await environment.up();

  }

  async stopContainers(): Promise<void> {
    if (this.environment) {
      console.log(`Stopping containers for project '${this.projectName}'...`);
      await this.environment.down();
      this.environment = null;
      console.log('Containers stopped successfully');
    } else {
      console.log('No containers to stop');
    }
  }

  public async areContainersRunning(): Promise<boolean> {
    try {
      const result = execSync(`docker-compose -p ${this.projectName} ps --services --filter "status=running"`, { 
        encoding: 'utf8' 
      });
      const runningServices = result.trim().split('\n').filter(line => line.length > 0);
      
      // Check if all expected services are running
      const expectedServices = ['db', 'backend', 'frontend'];
      return expectedServices.every(service => runningServices.includes(service));
    } catch (error) {
      return false;
    }
  }

  public async waitForService(serviceName: string): Promise<void> {
    if (!this.environment && !(await this.areContainersRunning())) {
      throw new Error('Containers must be started before waiting');
    }
    
    // If containers are running but not managed by testcontainers, use docker exec directly
    if (!this.environment && await this.areContainersRunning()) {
      let attempts = 0;
      const maxAttempts = 12;
      
      while (attempts < maxAttempts) {
        try {
          const containerName = `${this.projectName}-${serviceName}-1`;
          const inspectResult = execSync(`docker inspect --format '{{.State.Health.Status}}' ${containerName}`, { 
            encoding: 'utf8' 
          });
          if (inspectResult.trim() === 'healthy') {
            break;
          }
        } catch (error) {
          // If health check fails, wait and retry
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      if (attempts === maxAttempts) {
        throw new Error(`${serviceName} health check timed out`);
      }
      return;
    }
    
    // Original logic for testcontainers-managed containers
    const serviceContainer = this.environment!.getContainer(serviceName);
    
    let attempts = 0;
    const maxAttempts = 12;
    
    while (attempts < maxAttempts) {
      try {
        const inspectResult = await serviceContainer.exec(['docker', 'inspect', '--format', '{{.State.Health.Status}}', serviceContainer.getId()]);
        if (inspectResult.output.trim() === 'healthy') {
          break;
        }
      } catch (error) {
        throw new Error(`Health check is not configured for service '${serviceName}'`);
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    if (attempts === maxAttempts) {
      throw new Error(`${serviceName} health check timed out`);
    }
  }
} 
