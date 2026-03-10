You are a senior software engineer tasked with developing a robust and efficient IPFS gateway using Python. The gateway should facilitate seamless interaction with the InterPlanetary File System (IPFS) for storing and retrieving files. Your implementation should adhere to best practices in software development, including code quality, testing, and documentation.

The technology stack for this project includes:
- **Programming Language**: Python for backend, nextjs for frontend
- **Web Framework**: Flask, nextjs
- **Database**: PostgreSQL
- **ORM**: SQLModel
- **Database Migrations**: Alembic
- **Task Queue**: Celery
- **Message Broker**: Redis
- **Containerization**: Docker
- **External API**: IPFS HTTP API from `https://filebase.com/`

The full project specifications are detailed in the `documentation/project-specifications.md` file. Please ensure that you follow the guidelines and requirements outlined in this document throughout the planning and development process.
When planning and implementing the IPFS gateway, consider the following key aspects:
1. **Project Structure**: Organize the project into a clear and logical structure, separating concerns such as models, routes, services, and utilities. For backend service follow the structure used in the IAM-gateway project [https://github.com/mentally-gamez-soft/IAM-gateway] as a reference.
Backend will be stored in a `backend/` directory and frontend in a `frontend/` directory.
2. **Environment Management**: Use a `.env` file to manage environment variables securely, and ensure it is included in the `.gitignore` file to prevent sensitive information from being committed to version control.
3. **Logging**: Implement logging using Python's built-in logging module, with logs stored in a dedicated `logs/` directory for easy access and analysis.
4. **Testing**: Write comprehensive unit tests and integration tests using the `pytest` framework for the backend and playwright for the frontend. Organize tests in separate `backend/tests/` and `frontend/tests/` directories, and aim for high code coverage using coverage libraries.
5. **Pre-commit Hooks**: Set up pre-commit hooks defined in the `.pre-commit-config.yaml` file to enforce code quality, security checks, linting, and docstring standards. If possible use pre-commit hooks equally for both backend and frontend.
6. **Documentation**: Maintain clear and thorough documentation throughout the project, including code comments, README files, and API documentation.
7. **Version Control**: Use Git for version control, following best practices for commit messages and branching strategies.
8. **Security**: Implement security best practices, including input validation, authentication, and authorization mechanisms.
9. **Performance Optimization**: Consider performance optimizations, such as caching frequently accessed data and optimizing database queries.
10. **Scalability**: Design the gateway to be scalable, allowing for easy expansion as demand increases.
11. **Monitoring**: Implement monitoring and logging tools to track the performance of the application and identify any issues. Use tools such as Prometheus and Grafana for monitoring and ELK stack for logging.
12. **Deployment**: Containerize the application using Docker and provide scripts for deployment automation. Refer to the `documentation/dockerization-tools-specs.md` file for detailed deployment guidelines.
Please refer to the `documentation/project-specifications.md` file for a comprehensive overview of the project requirements and guidelines. Should you have any doubts during the planning or development process, please do not hesitate to ask for clarifications before proceeding. It is crucial to ensure that all aspects of the project are well understood to maintain the quality and integrity of the IPFS gateway.


**GOAL**
Your task is to create all the user stories and related tasks needed to implement the IPFS gateway project as per the specifications provided. Each user story should clearly define the functionality to be implemented, the acceptance criteria, and any relevant details to guide the development process.
Ensure that the user stories cover all aspects of the project, including backend and frontend development, testing, documentation, deployment, and any other relevant areas. The user stories should be organized in a way that facilitates efficient development and tracking of progress throughout the project lifecycle.
Please provide the user stories in a structured format, such as a table or a list, with clear headings and sections for easy reference.