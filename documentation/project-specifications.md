# IPFS Gateway Project Specifications

## Overview and description
    The IPFS Gateway project aims to create a robust and scalable api that allows users to access and store content on the InterPlanetary File System (IPFS) network. The gateway will serve as a bridge between traditional web applications and the decentralized IPFS network, enabling seamless content delivery and retrieval.
    The platform will be based on filebase-ipfs, leveraging its capabilities to interact with the IPFS network. The gateway will provide a user-friendly interface and a set of APIs for developers to integrate IPFS functionality into their applications easily.
    To date the API will be available for free to all users, with plans to introduce premium features and services in the future to support the project's sustainability and growth.
    The main gaol of this API is to give access to a CID (Content Identifier) based storage system that is decentralized and secure, allowing users to store and retrieve content without relying on centralized servers.
    The application will be a SaaS (Software as a Service) and as such will handle user management, authentication, and in the future billing for premium features.

## Features and functionalities

1. **Content Upload and Retrieval**: Users can upload files to the IPFS network and retrieve them using their unique CIDs.
2. **API Endpoints**: A set of RESTful API endpoints for developers to interact with the IPFS network programmatically.
3. **User Authentication**: Simple user authentication through email and API keys to manage access to the gateway services.
4. **Content Pinning and Management**: Users can pin and unpin content to ensure its availability on the IPFS network on a lifetime basis.
5. **Scalability**: The gateway will be designed to handle a large number of requests and scale as needed to accommodate growing user demand.
6. **Documentation and Support**: Comprehensive documentation and support resources to help users and developers get started with the IPFS gateway.
7. **Free Access**: The API will be available for free to all users, with plans to introduce premium features in the future.
8. **Premium plans (Future)**: Introduction of premium plans offering enhanced features such as increased storage limits, priority support, and advanced analytics. The payment processing will be handled through the $NEAR token, on the blockchain of the same name.

## Technical specifications

- **Backend**: 

  a. `python Flask` for API development and server-side logic

  b. `filebase-ipfs` for IPFS interactions

  c. postgresql for database management and user data storage

  d. Celery for asynchronous task processing

  e. Redis for caching and message brokering

  f. `SQLModel` for ORM (Object-Relational Mapping)

  g. `Alembic` for database migrations

  h. `pytest` for testing

  i. `gunicorn` for WSGI server

  j. `Docker` for containerization
  
  k. `nginx` for web server and reverse proxy

- **Frontend**:
  
    a. `Next.js` for server-side rendering and frontend development

- **Hosting and Deployment**:

  a. Cloud-based hosting solution GCP with GAE for scalability and reliability

  b. Docker containers for consistent deployment environments

  d. CI/CD pipeline for automated testing and deployment with github actions
  
  e. Monitoring and logging tools for performance tracking and issue resolution

- **Security and Privacy**:

  a. HTTPS for secure data transmission

  b. API key management for user authentication

## Project workflows

1. **User Registration and Authentication**: Users can register using their email and receive an API key for authentication.
2. **Content Upload**: Users can upload files to the IPFS network via the API, receiving a CID in return.
3. **Content Retrieval**: Users can retrieve files from the IPFS network using their CIDs.
4. **Content Pinning**: Users can pin content to ensure its availability on the IPFS network.
5. **Error Handling**: The API will provide meaningful error messages and status codes for various scenarios.
6. **Logging and Monitoring**: All API requests and responses will be logged for monitoring and debugging purposes.
7. **Testing and Quality Assurance**: Comprehensive testing will be conducted to ensure the reliability and performance of the API.
8. **Documentation**: Detailed documentation will be provided to guide users and developers in using the API effectively.

## implementation workflows
### User stories and task management
1. **user story creation**: 

    Define user stories and requirements for the whole IPFS gateway SaaS project. Each user story will be stored in the directory `user-stories/<part>` where `<part>`defines either the frontend or backend part of the project as a separate markdown file. Each user story will include a description, acceptance criteria, and any relevant notes or references. User stories will be created based on the features and functionalities outlined in the project specifications. A section indicating the percentage of completion will also be included in each user story file.

    For each story you will create a checklist of the tasks that need to be completed to fulfill the story requirements and update the percentage of completion accordingly.
    You will also generate a mermaid diagram representing the workflow of the user story and include it in the markdown file.

    The user stories should be named using the format `US-<number>-<short-description>.md`, where `<number>` is a unique identifier for the user story and `<short-description>` is a brief summary of the story. For example, `US-001-user-registration.md`.

2. **task breakdown**: 

    Break down each user story into smaller, manageable tasks. Each task will be stored in the directory `tasks/<part>` where `<part>` defines either the frontend or backend part of the project as a separate markdown file. Each task will include a description, estimated time to complete, and any relevant notes or references.
    The advance of the task will be updated in its markdown file as a percentage of completion.

    The tasks should be named using the format `TASK-<user-story-id>-<number>-<short-description>.md`, where `<user-story-id>` is the identifier of the user story the task belongs to, `<number>` is a unique identifier for the task within that user story, and `<short-description>` is a brief summary of the task. For example, `TASK-US-001-01-create-database-models.md`.

3. **prioritization**: 

    Prioritize the user stories and tasks based on their importance and urgency. This will help to ensure that the most critical features are implemented first.

### features development
1. **git branches**: 

    Create a new git branch for each user story or feature being developed. The branch creation should pass by the call of git-flow feature start command. This will help to keep the codebase organized and make it easier to track changes. The branch naming convention will follow the format `feature/<user-story-id>-<short-description>`. Once the feature is complete and has passed testing, the branch will be merged back into the main branch using the git-flow feature finish command.
    When a feature is considered terminated, you will generate a title and a description for the release notes that will be stored in the `release-notes/` directory as a markdown file named using the format `RELEASE-<user-story-id>-<short-description>.md`. This release note will serve as input for the PR description when the feature branch will be merged into the main branch, so be as detailed as possible.

2. **code implementation**: 

    Implement the code for each user story or feature in its respective git branch. Follow best practices for coding, including writing clean and maintainable code, adhering to coding standards, and including comments where necessary. Use `Flask` for API development and `filebase-ipfs` for IPFS interactions. Ensure that the code is modular and reusable. Use the repository https://github.com/mentally-gamez-soft/IAM-gateway as a reference for project structure and coding standards. Use a .env file to manage environment variables securely, make sure to add it to the .gitignore file.
    The project structure should follow the same pattern as the IAM-gateway project, with separate directories for models, routes, services, and utilities. Use `SQLModel` for ORM and `Alembic` for database migrations. Implement asynchronous task processing using Celery and Redis where applicable. And the application should be stored in a core directory named `core/` under the backend directory. The application must implement logging using Python's built-in logging module, with logs stored in a dedicated `logs/` directory.

    The code implementation for API calls must be robust and handle all possible scenarios, including edge cases and error handling. Use exception handling to manage errors gracefully and provide meaningful error messages to users. For this reason you will use the following libraries:
    - `pybreaker` to ensure circuit breaker pattern implementation
    - `tenacity` to implement retry logic for transient errors
    All API calls must be asynchronous using the `asyncio` library to improve performance and scalability and profit of pybreaker and tenacity async capabilities.

    For the frontend part you will use `Next.js` to create a simple user interface that allows users to interact with the IPFS gateway. The frontend will include pages for user registration, content upload, content retrieval, and content management. The frontend code will be organized in a separate `frontend/` directory, following best practices for Next.js development. Concerning the most static data, you will use a caching strategy to minimize the number of API calls to the backend.   

3. **testing**: 

    Write unit tests and integration tests for each user story or feature to ensure that the code works as expected. Use the `pytest` framework for testing. Use test-driven development (TDD) principles where applicable. Use faker to generate mock data for testing purposes. Use the VCR library to record and replay HTTP interactions during testing, ensuring consistent and reliable test results. Ensure that the tests cover all possible scenarios, including edge cases and error handling. Tests should be stored in a separate `backend/tests/` directory, organized by feature or user story. Aim for high code coverage to ensure the reliability of the codebase. Use coverage.py to measure code coverage and identify areas that need improvement.
    For frontend testing you will use playwright to write end-to-end tests simulating real-world scenarios and ensure the entire frontend functions as intended. The frontend tests should be stored in a separate `frontend/tests/` directory, organized by feature or user story.

4. **commits**: 

    All the commits to git tree will trigger a list of pre-commit hooks defined in the file .pre-commit-config.yaml in the project. Make sure the recommendations provided by the pre-commit hooks are fixed. This includes: security checks, linting and docstring. For security checks you will always ask me for advice before proceeding. Commits should be atomic and focused on a single task or feature. Use descriptive commit messages that clearly explain the changes made. Follow the conventional commit format for commit messages to ensure consistency and clarity.

5. **code review**: 

    Submit a pull request for each git branch once the code implementation and testing are complete. The pull request will be reviewed by other team members to ensure code quality and adherence to project standards.

6. **merging**: 

    Once the pull request has been approved, merge the git branch into the main branch. Ensure that any merge conflicts are resolved and that the main branch remains stable.

### deployment and monitoring

1. **ci/cd pipeline**: 

    Set up a CI/CD pipeline using GitHub Actions to automate the testing and deployment process. The pipeline will run tests on each pull request and deploy the code to the staging environment upon merging into the main branch.

2. **containerization**: 

    Use Docker to containerize the application for consistent deployment across different environments.
    This will apply for the backend and the frontend parts of the application.

3. **monitoring**: 

    Implement monitoring and logging tools to track the performance of the application and identify any issues. Use tools such as Prometheus and Grafana for monitoring and ELK stack for logging.

### Pre-requisites

1. **Development environment**: 

    For the backend, set up a local development environment with Python, Flask, PostgreSQL, Celery, Redis, Docker, and other necessary tools and libraries. The package manager to use is `uv`. Make sure to also install pip and export the `pyproject.toml` file to a `requirements.txt` file. The virtual environment should be `backend/.venv/` directory.
    
    Ensure that all dependencies are installed and configured correctly for development and testing purposes. 
    Make sure to fix the versions of the packages in the requirements files to ensure consistency across different development environments. No auto upgrading of packages will be allowed without prior approval.

    For the frontend, set up a local development environment with Node.js, Next.js, and other necessary tools and libraries. Ensure that all dependencies are installed and configured correctly for development and testing purposes.

    As a reminder, the backend will be stored in a `backend/` directory and frontend in a `frontend/` directory.

    **Database Configuration**:
    - **Development**: Local PostgreSQL database (`DATABASE_URL`): `postgresql+psycopg2://user:pass@localhost:5432/ipfs_gateway`
    - The environment variables must be configured in the .env file
    - The APP_ENV environment variable must be set to `development` for local development.


2. **Access to IPFS network**: 

    Ensure access to the IPFS network through filebase-ipfs for testing and development purposes.
    The access credentials and configuration details are already stored securely using environment variables under the environment file .env. The environement variable is named FILEBASE_IPFS_API_KEY.
    The access to the IPFS network will be used for uploading and retrieving content during development and testing. It will be achieved through the filebase S3 compatible API. For this reason you will use the `boto3` library to interact with the S3 compatible API provided by filebase-ipfs.
 
### API and Database ###

    Refer to the file `documentation/backend-specs.md` for detailed API endpoints and data model.

### Frontend ###

    Refer to the file `documentation/frontend-specs.md` for detailed frontend specifications.

 ### Testing strategy ###
 
    Refer to the file `documentation/backend-specs.md` for detailed testing strategy for the backend service.
    Refer to the file `documentation/frontend-specs.md` for detailed testing strategy for the frontend service.


### Doubts 
Should you have any doubts during the planning or development process, please do not hesitate to ask for clarifications before proceeding. It is crucial to ensure that all aspects of the project are well understood to maintain the quality and integrity of the IPFS gateway.