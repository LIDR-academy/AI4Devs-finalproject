## Prompt 1: Plan AWS migration and fully containeraize it
~~~markdown
/plan
Following the details at: docs/tickets/extendedMVP/EXT-003-production-infrastructure.md 
I want to migrate the RealSaveFooding project to run on AWS and fully containerize it.

Please analyze the current repository and propose an incremental implementation plan covering:

- Dockerize the frontend and backend.
- Create a local Docker Compose setup (including PostgreSQL).
- Prepare the application for AWS deployment using an MVP-friendly architecture (ECS Fargate, ECR, RDS, ALB, CloudWatch, Secrets Manager).
- Identify required configuration and environment variable changes.
- Highlight any code changes needed for containerization.
- Recommend the order of implementation, risks, and dependencies.
- MANDATORY: Security first, don't do anything risky.

Do not implement anything yet. Just provide a detailed execution plan and architectural recommendations based on the current project structure.
~~~

---
After a manual review of the plan: 
~~~text
Add back/Dockerfile and .dockerignore
Set nitro preset in front/vite.config.ts and verify build works
Add front/Dockerfile for the node-server build
Add infra/docker/docker-compose.prod.yml for both containers
Add production env var comment to back/.env.example
Add infra/terraform/envs/prod (RDS, EC2, SGs, IAM, CloudFront)
Add .github/workflows/deploy.yml
Update readme.md deployment section and add docs/deployment runbook
~~~

## Prompt 2: Plan confirmation 
Plan confirmed, proceed with it and ask me for any doubt.

## Prompt 3: Fixing Terraform deploy 
The deployment suddenly stop <stacktrace added as context>. Review it and help me to fix it.

## Prompt 4: Create a makefile
Create a Makefile to facilitate: 
1. Deploy locally using a script called dev.sh
2. Deploy in production (AWS). Should be 100% automated. Wrap it in a script call prod.sh
3. Destroy from production (AWS) - It will need to ensure no cost to the user
4. Help command with the instructions.