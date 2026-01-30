# IPFS Gateway Project Backend Specifications

This documentation explains the different endpoints and functionalities of the IPFS gateway backend service built using Python and Flask.

## Definition of the API 
The API will follow RESTful principles and will include the following endpoints:
1. **User Registration and Authentication**:
   - `POST /register`: Register a new user (identified by its email) and receive an API key.
   - `POST /status`: Retrieve the status of an API key (active, inactive, revoked).
   - `POST /revoke`: Revoke an API key. Only the administrator API key can perform this action.
   - `POST /reactivate`: Reactivate a revoked API key. Only the administrator API key can perform this action.
   - `POST /renew`: Resend a new API key to the user. the user must input its email to receive a new API key.
2. **Content Upload and Retrieval**:
   - `POST /upload`: Upload a file to the IPFS network and receive a CID.
   - `GET /retrieve/<cid>`: Retrieve a file from the IPFS network using its CID.
3. **Content Pinning and Management**:
   - `POST /pin/<cid>`: Pin content on the IPFS network using its CID.
   - `POST /unpin/<cid>`: Unpin content from the IPFS network using its CID.
4. **Error Handling**:
   - Standardized error responses with meaningful messages and status codes for various scenarios (e.g., invalid API key, file not found, etc.).    
5. **Logging and Monitoring**:
   - All API requests and responses will be logged for monitoring and debugging purposes.
### API Security
2. **API Key Management**: Users will authenticate using their API keys, which will be required for all API requests. For this requirements make extensive use of decorators applied to the Flask route handlers.
3. **Rate Limiting**: Implement rate limiting to prevent abuse and ensure fair usage of the API.
4. **Input Validation**: Validate all input data to prevent injection attacks and ensure data integrity.
5. **Error Handling**: Provide meaningful error messages and status codes for various scenarios.
### Documentation
1. **API Documentation**: Comprehensive documentation for all API endpoints, including request and response formats, authentication methods, and error handling. Ideally using Swagger or Postman for interactive API documentation, maybe flasgger.
2. **Getting Started Guide**: A guide to help users and developers get started with the IPFS gateway.
3. **Code Examples**: Sample code snippets for common use cases and integration scenarios.
5. **Changelog**: A log of all changes and updates to the API and documentation.

## Definition of the Data Models
The backend service will use SQLModel as the ORM to define the following data models:
1. **User**:
   - `id`: Integer, primary key
   - `email`: String, unique, not null
   - password_hash: String, not null
   - `api_key`: String, unique, not null
   - `is_active`: Boolean, default True
   - `created_at`: DateTime, default current timestamp
   - `updated_at`: DateTime, default current timestamp, on update current timestamp
   - `is_admin`: Boolean, default False
   - `last_renewed_at`: DateTime, timestamp of the last API key renewal
   - `usage_count`: Integer, count of API requests made by the user
   - `is_deleted`: Boolean, default False for soft deletion
2. **File**:
   - `id`: Integer, primary key
   - `cid`: String, unique, not null
   - `user_id`: Integer, foreign key to User.id
   - `original_filename`: String, not null
   - `safe_filename`: String, not null
   - `size`: Integer, size of the file in bytes
   - `pinned`: Boolean, default True
   - `uploaded_at`: DateTime, default current timestamp
3. **AuditLog**: This model should be accessible only by the administrator API key.
   - `id`: Integer, primary key
   - `user_id`: Integer, foreign key to User.id
   - `action`: String, description of the action performed
   - `timestamp`: DateTime, default current timestamp
   - `details`: Text, additional details about the action

## Asynchronous Task Management
The backend service will use Celery for managing asynchronous tasks, such as:
1. **File Uploads**: Handle file uploads to the IPFS network asynchronously to improve performance and user experience.
2. **Content Pinning**: Manage content pinning and unpinning tasks asynchronously.

## Database Migrations
The backend service will use Alembic for managing database migrations, allowing for version control of the database schema and easy updates.
The migration command will be added in a section of the README.md file located in the `backend/` directory.


### Database Infrastructure
1. **Development Database**: Local PostgreSQL instance running on localhost:5432 for development and testing.
2. **Environment Variables**:
   - `DATABASE_URL`: Used for development environment (local PostgreSQL)
   - `DATABASE_USER`: Username for the production database
   - `DATABASE_PASSWORD`: Password for the production database
   - `DATABASE_HOST`: Hostname for the production database
   - `DATABASE_PORT`: Port for the production database
   - `DATABASE_NAME`: Database name for the production database
4. **Connection Management**: SQLAlchemy connection pooling configured for optimal performance in production.
5. **Migrations**: Alembic migrations must be tested in development before applying to production.

## Testing
The backend service will use pytest for writing and executing unit tests and integration tests. Tests will cover all API endpoints, data models, and asynchronous tasks to ensure the reliability and correctness of the service.
Tests will be located in the `backend/tests/` directory.


### Testing Strategy
1. **Unit Tests**: Write unit tests for individual functions and methods to ensure they work as expected.
2. **Integration Tests**: Write integration tests to verify that different components of the API work together correctly.
3. **End-to-End Tests**: Write end-to-end tests to simulate real-world scenarios and ensure the entire API functions as intended.
4. **Test Coverage**: Aim for high test coverage to ensure the reliability of the codebase. Use coverage.py to measure code coverage and identify areas that need improvement.


## Documentation
Comprehensive documentation will be provided for the backend service, including:
1. **API Documentation**: Detailed documentation for all API endpoints, including request and response formats, authentication methods, and error handling.
2. **Getting Started Guide**: Instructions for setting up the development environment, running the service, and using the API.
3. **Code Examples**: Sample code snippets for common use cases and integration scenarios.
4. **Developer Guide**: Guidelines for contributing to the backend service, including coding standards, testing procedures, and deployment instructions.
5. **Changelog**: A log of all changes and updates to the backend service and documentation.
All documentation files will be located in the `backend/docs/` directory.
## Logging and Monitoring
The backend service will implement logging using Python's built-in logging module. Logs will be stored in a dedicated `logs/` directory for easy access and analysis.
Monitoring tools such as Prometheus and Grafana will be set up to track the performance and health of the backend service.  






