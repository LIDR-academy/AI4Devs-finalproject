import { DockerComposeEnvironment, StartedDockerComposeEnvironment } from 'testcontainers';
import { join } from 'path';
import { execSync } from 'child_process';
import { faker } from '@faker-js/faker';
import { config } from 'dotenv';

// The order of services is important as the have dependencies on each other
const SERVICE_NAMES = ['db', 'backend', 'frontend'] as const;

type ServiceName = typeof SERVICE_NAMES[number];

const FALLBACK_PROJECT_NAME = `test-${faker.string.uuid()}`;

export class ContainerSetup {
  private environment: StartedDockerComposeEnvironment | null = null;
  private projectName: string;

  async up(): Promise<void> {
    const pwd = join(process.cwd());
    const environmentFilePath = join(pwd, '.env.test');

    config({ path: environmentFilePath });
    
    this.projectName = process.env.PROJECT_NAME ?? FALLBACK_PROJECT_NAME
    
    if (await this.areContainersRunning()) {
      console.log(`Containers for project '${this.projectName}' are already running, skipping startup`);
      return;
    }

    const composeFilePath = join(pwd, 'docker-compose.yml');

    const environment = new DockerComposeEnvironment(pwd, composeFilePath)
        .withEnvironmentFile(environmentFilePath)
        .withProjectName(this.projectName);
    
    this.environment = await environment.up()

    // Do not wait all at once
    for (const serviceName of SERVICE_NAMES) {
      await this.waitForService(serviceName);
    }
  }

  async down(): Promise<void> {
    if (this.environment) {
      console.log('Stopping containers...');
      await this.environment.down();
      this.environment = null;
      console.log('Containers stopped successfully');
    } else {
      console.log('No containers to stop');
    }
  }

  private async areContainersRunning(): Promise<boolean> {
    try {
      const result = execSync(`docker compose -p ${this.projectName} ps --services --filter "status=running"`, { 
        encoding: 'utf8' 
      });
      const runningServices = result.trim().split('\n').filter(line => line.length > 0);
      
      // Check if all expected services are running
      return SERVICE_NAMES.every(service => runningServices.includes(service));
    } catch (error) {
      return false;
    }
  }

  private async checkServiceReadiness(serviceName: ServiceName): Promise<boolean> {
    try {
      const healthCheck = execSync(`docker compose -p ${this.projectName} exec -T ${serviceName} echo ready`, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return healthCheck.trim() === 'ready';
    } catch (error) {
      return false;
    }
  }

  public async waitForService(serviceName: ServiceName): Promise<void> {
    console.log(`Waiting for service '${serviceName}' to be ready...`);
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        if (await this.checkServiceReadiness(serviceName)) {
          return;
        }
      } catch (error) {
        console.log(`Service ${serviceName} readiness check failed, attempt ${attempts + 1}/${maxAttempts}`);
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error(`${serviceName} service has timed out after ${maxAttempts * 5} seconds`);
  }
} 
