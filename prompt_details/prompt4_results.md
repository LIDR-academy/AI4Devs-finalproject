## 2. System Architecture

### **2.1. Architecture Diagram**
Below is a description of the system architecture in a verbal format, outlining the interaction between major components:

The system follows a **microservices-based architecture**. The main services include:
1. **Frontend Service**: Web and mobile interfaces for user interaction.
2. **Backend Service**: A RESTful API that handles business logic, user requests, and data processing.
3. **AI/ML Service**: A dedicated microservice for managing AI-driven health insights, risk assessments, and digital twin simulations.
4. **Data Storage Service**: Secure databases for user health data, encrypted medical records, and interaction logs.
5. **Authentication & Authorization Service**: Manages user login, role-based access control, and token generation.
6. **Logging and Monitoring Service**: Ensures system reliability, monitors activity, and provides real-time alerts.

**Choice Rationale**:  
The microservices pattern enables **scalability, modularity,** and **fault isolation**. Each service is isolated, making it easy to scale or update components independently without affecting other services. This architecture is well-suited for healthcare applications, where data security, reliability, and performance are critical. 

**Potential Drawbacks**:
- Increased complexity in managing distributed services.
- Higher resource requirements, especially for API management and inter-service communication.

### **2.2. Main Use Cases**

1. **Health Records Upload and Parsing**
   - **User Roles**: 
     - **User**: Uploads health records and views parsed insights.
     - **AI Service**: Processes and extracts key data points from the uploaded records.
   - **Actions**:
     - User uploads a PDF/image of medical records.
     - Backend Service verifies file format and security, forwards it to the AI/ML Service.
     - AI Service extracts relevant health insights, anonymizes sensitive data, and stores it securely.
     - User views a summary of insights in the UI.
   - **Dependencies**: 
     - Backend relies on AI/ML service for data parsing.
     - All data passes through the security layer for compliance with privacy policies.

2. **Personal Health Coach Interactivity**
   - **User Roles**:
     - **User**: Interacts with the AI Health Coach to receive health recommendations.
     - **AI Service**: Provides personalized responses and health recommendations.
   - **Actions**:
     - User asks health-related questions.
     - Backend Service relays the query to the AI/ML Service.
     - AI Service generates a response based on stored health data and medical knowledge sources.
     - Response is displayed to the user with action recommendations or health guidance.
   - **Dependencies**: 
     - Backend depends on AI Service for generating accurate recommendations.
     - Real-time data encryption ensures sensitive health information is secure.

3. **Digital Twin Simulation**
   - **User Roles**:
     - **User**: Simulates lifestyle changes and views potential health outcomes.
     - **AI Service**: Runs simulation algorithms based on user-inputted lifestyle changes.
   - **Actions**:
     - User adjusts factors (diet, exercise) and triggers simulation.
     - Backend requests AI Service to model health outcomes based on input.
     - AI Service returns predicted health outcomes.
     - User views visual simulation results.
   - **Dependencies**:
     - Backend interacts with AI Service to generate simulations and validate data.
     - Data anonymization practices ensure simulated results are privacy-compliant.

### **2.3. High-Level Project Description and Folder Structure**

The project is structured as follows:

- **/frontend**: Contains UI code for web and mobile versions, built using React (web) and React Native (mobile).
  - `/assets`: Stores images, fonts, and static files.
  - `/components`: Houses reusable UI components, such as forms and widgets.
  - `/pages`: Organizes pages for different views (e.g., Health Records, Health Coach, Digital Twin).
  
- **/backend**: Manages business logic and API services.
  - `/controllers`: Handles API request processing and routing.
  - `/models`: Defines data structures and interactions with the database.
  - `/services`: Contains helper functions and modules for inter-service communication.
  - `/middleware`: Implements security checks, including authentication and encryption.
  
- **/AI_service**: Dedicated to AI processing, including health record parsing, risk assessment, and digital twin algorithms.
  - `/models`: Includes pre-trained AI models and algorithms.
  - `/data`: Stores model-specific data like weights, configurations, and embeddings.
  
- **/db**: Manages secure data storage.
  - `/migrations`: Scripts to set up, modify, or drop database tables.
  - `/seeds`: Predefined data for testing and initialization.
  
- **/security**: Contains scripts and configurations for encryption, role-based access, and token management.
  
### **2.4. Infrastructure and Deployment**

#### Infrastructure Diagram
The infrastructure uses AWS as the primary hosting environment, with Docker containers to streamline deployments and ensure scalability.

1. **AWS EC2 Instances**: Hosts the frontend, backend, and AI/ML services in Docker containers.
2. **AWS RDS**: Manages secure databases (e.g., PostgreSQL) for structured user health data and records.
3. **AWS S3**: Stores uploaded health records, with encryption at rest.
4. **AWS IAM**: Provides role-based access control to manage permissions.
5. **AWS CloudWatch**: Monitors logs and triggers alerts for unusual activity.

#### Deployment Process
1. **Development**: Code is developed and tested locally.
2. **CI/CD Pipeline**: GitHub Actions automates the CI/CD pipeline, testing and building Docker images for each service.
3. **Deployment**: Upon successful testing, Docker containers are deployed to AWS EC2.
4. **Monitoring**: AWS CloudWatch monitors logs and system metrics, alerting the team of potential issues.

### **2.5. Security**

1. **Data Encryption**: All health data and medical records are encrypted using AES-256 in transit and at rest.
2. **Authentication & Authorization**: Implemented via JWT for session management, with OAuth2.0 for API access and role-based access control (RBAC) for permissions.
3. **Data Anonymization**: User data is anonymized before being used for AI model training or simulations, complying with GDPR and HIPAA regulations.
4. **Input Validation**: Strict input validation ensures no harmful data is accepted, reducing security risks such as injection attacks.
5. **Monitoring & Auditing**: Continuous monitoring of system logs for unusual activity, with audit trails to track access and modifications to health data.

### **2.6. Tests**

1. **Unit Testing**: Each microservice, especially the AI Service and backend endpoints, undergoes extensive unit testing to validate functionality.
2. **Integration Testing**: Tests interactions between frontend, backend, and AI Service to ensure they communicate as expected.
3. **End-to-End Testing**: Simulated user flows (e.g., health record upload, AI health recommendations) are tested to validate the entire system.
4. **Security Testing**: Vulnerability scanning and penetration testing ensure that sensitive data remains secure and protected.

---

This detailed architecture description provides a comprehensive view of the system’s main components, structure, security, and deployment processes. Let me know if you'd like more specific visual diagrams or further elaboration on any particular aspect.