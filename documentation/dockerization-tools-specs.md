## Overview and description
You are a senior devOps engineer tasked with creating Dockerization and deployment specifications for a python and js projects.
You are currently working on a project and need to create automation scripts and Dockerfiles to containerize the application and streamline the deployment process.

## Features and functionalities
- The current project relies on different technology stacks for the backend and frontend services.
- The backend is built using Python with Flask as the web framework, while the frontend is developed using Next.js.
- The python backend packaging is managed using uv.
- The backend service uses PostgreSQL as the database, Celery for task queuing, and Redis as the message broker.

## Technical specifications

- **Backend**: 

  a. `python Flask` for API development and server-side logic

  c. postgresql for database management and user data storage

  d. Celery for asynchronous task processing

  e. Redis for caching and message brokering

  f. `Alembic` for database migrations

  g. `pytest` for testing

  h. `gunicorn` for WSGI server

  i. `uv` for packaging and dependency management
  
  j. `nginx` for web server and reverse proxy

- **Frontend**: 

  a. `Next.js` for server-side rendering and frontend development

## Deployment specifications
- Containerization: Use Docker to create container images for both backend and frontend services.
- Orchestration: Use Docker Compose to manage multi-container applications, including backend, frontend, database, and other services.
- Environment Variables: Use `.env` files to manage configuration settings for different environments (development, staging, production).
- Volume Management: Use Docker volumes to persist data for the PostgreSQL database and other services.
- Networking: Configure Docker networks to enable communication between containers.
- Health Checks: Implement health checks for backend and frontend services to ensure they are running correctly.
- Logging: Configure logging for both backend and frontend services to capture application logs and errors.
- Monitoring: Set up monitoring tools to track the performance and health of the application.
- CI/CD Integration: Integrate Dockerization and deployment processes into the CI/CD pipeline for automated builds and deployments.
- Seamless integration: Create 2 scripts, one in powershell and the other in bash shell that will be a CLI menu proposing different commands to:
    1. choose an environement [production, development, staging]
    2. list all the existing images of the application.
    3. Define a version for an image in the format v1.2.1
    4. build images for backend and frontend
    5. rename the tag of an image
    6. push images to a docker registry (docker hub for example)
    7. deploy the application using docker compose in the chosen environment
    8. Run an image of the backend or frontend in detached mode
- Documentation: Provide clear documentation on how to use the Dockerfiles, Docker Compose files, and deployment scripts. 

All creeated files should be in a `deployment/` directory at the root of the project. The documentation should be in a `README.md` file within the `deployment/` directory.


