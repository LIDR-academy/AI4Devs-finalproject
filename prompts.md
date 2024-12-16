> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**
```markdown
Assist as an expert and mentor in creating advanced AI technology with a focus on AI-powered projects related to health records management, personal health coaching, and digital twins.
You should leverage your expertise as a software architect, researcher, and web app designer, as well as your skills as a redactor and product manager to guide the process effectively.

# Steps

- Understand the user’s needs for AI projects involving an AI-powered Health Records Manager, AI-powered Personal Health Coach, and AI Digital Twin.
- Break down each element of the projects into steps, asking the user relevant questions for specifications and clarification.
- Ensure a comprehensive understanding before moving on to the next step, verifying progress with the user as needed.

# Output Format

Provide clear, step-by-step guidance in response to queries. Responses should be structured in short paragraphs, with clarity and focus on the user’s goals. Include questions for further specifications as necessary.

# Notes

- Emphasize iterative progress by confirming understanding and completion of each step before advancing to the next.
- Ensure that potential gaps in project design or understanding are addressed through thoughtful questions and suggestions.
- Remain open to adjusting guidance based on the user’s feedback and additional requirements.
```

[Prompt Result](prompt_details/prompt1_results.md)

**Prompt 2:**
```markdown
Create a comprehensive system for an AI-powered health management application that includes a Health Records Manager, Personal Health Coach, and Digital Twin, addressing the details as specified.

### Health Records Manager
- **User Data Input**: Allow users to input personal health data such as age, weight, and fitness level. Users can upload medical records or lab results in PDF or image format or fill out a form.
- **Document Handling**: Ensure that uploaded documents are stored securely with end-to-end encryption.
- **Data Parsing**: Implement AI to parse and summarize uploaded documents, explain medical terms, and provide insights into test results.        
- **Risk Assessment**: Based on the data, offer personalized risk assessments for conditions like heart disease or diabetes using risk scoring models or LLMs trained on medical data.
- **Priority**: Focus on handling PDFs, images, and structured data.

### Personal Health Coach
- **Feedback Schedule**: Provide daily health plans or alerts for chronic disease management.
- **Health Focus**: Focus on personalized health improvement goals.
- **Interactivity**: Enable the system to respond to freeform user questions. Provide layman-friendly explanations of medical records, complex terms, and health risk queries like “What is my risk for diabetes?” based on available data.

### Digital Twin
- **Simulation Depth**: Create simulations that cater to lifestyle changes beneficial for managing chronic diseases.
- **Focus**: Concentrate on basic chronic diseases such as heart disease, diabetes, glucose issues, and blood pressure.
- **Update Frequency**: Decide on an innovative approach for updating or refining the model frequently.

# Steps

1. **Data Import and Security**: Develop interfaces for file upload or form submission, ensuring robust security measures.
2. **AI Parsing and Explanation**: Implement AI models to process and explain medical documents.
3. **Health Insights and Alerts**: Design algorithms for generating risk assessments and daily health suggestions.
4. **Interactive Q&A**: Build a chatbot capable of understanding and responding to user queries accurately.
5. **Simulation Development**: Focus on lifestyle simulations for chronic disease management.
6. **Innovative Design**: Employ innovative design principles to enhance user engagement and experience.

# Output Format

Responses should be structured in paragraphs or bullet points as necessary, providing a detailed explanation and breakdown of processes and responses.

# Examples

**Example 1**: User uploads a PDF of their lab results.
- **Process**: The system securely stores the PDF, parses the data, provides a summary, explains complex terms, and offers personalized insights and risks.
- **Output**: "Your lab results show elevated glucose levels, which may indicate an increased risk for diabetes. It is recommended to consult with a medical professional for further advice."

**Example 2**: User asks, "What is my risk for diabetes?"
- **Process**: The AI analyzes the user’s data and provides a risk percentage based on the analysis of medical records and personal data.
- **Output**: "Based on your recent lab results and provided lifestyle data, your risk for diabetes is currently at 15%."

# Notes

- Always ensure data privacy and compliance with relevant health data regulations.
- Maintain a balance between providing useful information and not substituting for professional medical advice.    
```

[Prompt Result](prompt_details/prompt2_results.md)

**Prompt 3:**
```markdown
Translate the following project template from Spanish to English and provide detailed explanations for each of the sections. 

<TEMPLATE>
## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

### **0.2. Nombre del proyecto:**

### **0.3. Descripción breve del proyecto:**

### **0.4. URL del proyecto:**

### 0.5. URL o archivo comprimido del repositorio

---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

> Propósito del producto. Qué valor aporta, qué soluciona, y para quién.

### **1.2. Características y funcionalidades principales:**

> Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

<END-TEMPLATE>

# Steps

1. Translate each section header and bullet point into English.
2. Provide a detailed breakdown or explanation of each section to ensure users fully understand how to document their product.
3. Offer guidance on using media like images or video tutorials effectively in the Design and User Experience section.
4. Create a definitive document for me with all the knowledge you already have, be explicit and very clear and elaborate every section; use a professional, williness and proactive sentiment. Remember to use this template, for those section that you don't have the answer write the word ´Pending!´

# Output Format

The output should be structured as a translated template with each section explained in detail. Use bullet points for clarity and include examples where necessary.

# Examples

- **Objective Example:**
  - Describe the main purpose of the software, such as "The product is designed to streamline workflow for remote teams, providing tools to track 
time, tasks, and collaborate effectively."

- **Main Features and Functionalities Example:**
  - "The calendar scheduling feature allows users to synchronize events across various time zones and integrate with existing personal calendars."
  
- **Design and User Experience Example:**
  - "Include a video walk-through showing a user signing up, exploring the dashboard, and utilizing the main feature set. Highlight intuitive design elements and user feedback loops."

# Notes

- Emphasize the importance of clarity and conciseness when documenting technical instructions.
- Consider the target audience's level of technical expertise when describing installation instructions. Adjust complexity accordingly.

```

[Prompt Result](prompt_details/prompt3_results.md)

**Additional Prompts**
1. [Prompt Lean Canvas](prompt_details/prompt_lean.md)

1. [Prompt Design](prompt_details/prompt_design.md)
2. [Prompt Design](prompt_details/prompt_design2.md)
3. [Prompt Design](prompt_details/prompt_design3.md)
4. [Prompt Design](prompt_details/prompt_design4.md)
5. [Prompt Design](prompt_details/prompt_design5.md)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
```markdown
Create a detailed description of the system architecture for your project using the specified template. Focus on the main components, technologies, predefined patterns, use cases, and security practices.

# Steps

1. **System Architecture Overview**:
    - Explain the overall architecture of the system, stating if it follows any predefined architectural pattern (e.g., MVC, microservices).      
    - Justify the architectural choice with its benefits and potential deficits.

2. **Use Cases**:
    - Identify three main use cases.
    - For each use case, outline:
        - User roles and their interactions with the system.
        - Actions performed by each role.
        - Dependencies between different actions.

3. **Components and Technologies**:
    - Detail the most important components of the system and the technology stack used.

4. **Project Structure**:
    - Depict the structure of the project, explaining the purpose of main folders.
    - Mention any specific folder structure or pattern being followed.

5. **Infrastructure and Deployment**:
    - Describe the project infrastructure.
    - Include a diagram illustrating the infrastructure.
    - Explain the process for deploying the application.

6. **Security Practices**:
    - List and describe key security practices implemented in the project.
    - Provide examples if applicable.

7. **Testing**:
    - Briefly describe the tests performed on the project to ensure its reliability and functionality.

# Output Format

Use the following template format for structuring the response:
 
## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
- [Include an architecture diagram in an appropriate format, such as ASCII art or verbal description.]

### **2.2. Descripción de componentes principales:**
- [List and describe each main component and the technologies used.]

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**
- [Explain the purpose of main folders and any specific structure or pattern followed.]

### **2.4. Infraestructura y despliegue**
- [Detail the infrastructure and deployment process with a diagram.]

### **2.5. Seguridad**
- [List and describe key security practices with examples if applicable.]

### **2.6. Tests**
- [Briefly describe some of the tests performed.]

### **2.6. Tests**
- [Briefly describe some of the tests performed.]

# Examples

Note: The examples should be illustrative of how a complete, realistic description might be structured. Replace placeholders with actual content details from the project.

# Notes

- Ensure that each section is focused and clearly articulated.
- Consider practical scenarios to highlight interactions and dependencies in use cases.
- Place emphasis on security and testing to indicate robustness.
```

**Prompt 2:**
```markdown
Evaluate the functional areas of this project VitaMind, that is built on a microservices architecture and recommend the best AI stack and technologies, emphasizing the use of OpenAI. Additionally, assess the replacement of TensorFlow with other options like RAG, multiple LLMs, multi-agents, or LangChain technology.

Focus on the following:

- **Frontend Service**: Web and mobile interfaces for user interaction.
- **Backend Service**: A RESTful API to handle business logic, user requests, and data processing.
- **AI/ML Service**: Manages AI-driven health insights, risk assessments, and digital twin simulations.
- **Data Storage Service**: Manages secure databases for user health data, encrypted medical records, and interaction logs.
- **Authentication & Authorization Service**: Handles user login, role-based access control, and token generation.
- **Logging and Monitoring Service**: Ensures system reliability, activity monitoring, and provides real-time alerts.

# Evaluation Process

1. **Functional Analysis**: Evaluate deeper into each functional area to understand their specific requirements and challenges.
2. **Technology Recommendation**: Propose an appropriate AI stack and technologies for each functional area:
   - Core emphasis on leveraging OpenAI for AI/ML Service.
   - Consider employing RAG (Retrieval-Augmented Generation), multi-agents, LangChain, or other LLMs for tasks that could replace TensorFlow effectively.
3. **Rationale and Justification**: Detail why the recommended technologies are the best choice, considering the need for scalability, modularity, and data security.

# Output Format

Present your evaluation and recommendations in a structured report format. Each section should include:

- **Functional Area**: Name and brief description.
- **Recommended Technologies**: List suitable technologies and tools.
- **Rationale**: Explanation of why these choices are ideal.
- **Potential Drawbacks**: Outline any possible challenges with the proposed technologies.

# Example

**Functional Area**: AI/ML Service

**Recommended Technologies**:
- OpenAI for generating AI-driven insights.
- LangChain to support advanced language processing tasks.
- RAG with LLMs for robust knowledge retrieval and conversational AI.

**Rationale**: OpenAI offers state-of-the-art AI capabilities essential for health insights and simulations. LangChain provides versatility in handling complex language tasks, and RAG models enhance interaction quality by integrating comprehensive knowledge bases.

**Potential Drawbacks**: Integrating multiple LLMs and managing them may introduce complexity and require additional resources.

# Notes

- Ensure all recommended technologies align with the healthcare industry's security and compliance standards.
- Consider the scalability and future-proofing of all technology suggestions.
- Mention any required integrations and how they might impact existing systems.
```

**Prompt 3:**
```markdown
Adjust the last response with the following: Node.JS and Python 3.8+ for backend and AI services. React for frontend development.  Docker for containerized deployment. AWS as cloud provider. Postgres for database
```

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
```markdown
 I want you to create a mermaid use case diagram for this use case: 
**Health Records Upload and Parsing**
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
 ```

**Prompt 2:**
```markdown
 I want you to create a mermaid use case diagram for this use case: 
**Personal Health Coach Interactivity**
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
 ```

**Prompt 3:**
```markdown
 I want you to create a mermaid use case diagram for this use case: 
**Digital Twin Simulation**
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
```

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
```markdown
Explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica:  
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
```

**Prompt 2:**
```markdown
Are we missing any other good pattern, like testing or any other?
```

**Prompt 3:**
```markdown
please create a definitive folder structure with all the improvements
```

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
```markdown
please create a diagram given the following:
1. **AWS EC2 Instances**: Hosts the frontend, backend, and AI/ML services in Docker containers.
2. **AWS RDS**: Manages secure databases (e.g., PostgreSQL) for structured user health data and records.
3. **AWS S3**: Stores uploaded health records, with encryption at rest.
4. **AWS IAM**: Provides role-based access control to manage permissions.
5. **AWS CloudWatch**: Monitors logs and triggers alerts for unusual activity.
```

**Prompt 2:**
```markdown
please create a diagram given the following:
1. **Development**: Code is developed and tested locally.
2. **CI/CD Pipeline**: GitHub Actions automates the CI/CD pipeline, testing and building Docker images for each service.
3. **Deployment**: Upon successful testing, Docker containers are deployed to AWS EC2.
4. **Monitoring**: AWS CloudWatch monitors logs and system metrics, alerting the team of potential issues.
```

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**
```markdown
please create a diagram given the following:
1. **Data Encryption**: All health data and medical records are encrypted using AES-256 in transit and at rest.
2. **Authentication & Authorization**: Implemented via JWT for session management, with OAuth2.0 for API access and role-based access control (RBAC) for permissions.
3. **Data Anonymization**: User data is anonymized before being used for AI model training or simulations, complying with GDPR and HIPAA regulations.
4. **Input Validation**: Strict input validation ensures no harmful data is accepted, reducing security risks such as injection attacks.
5. **Monitoring & Auditing**: Continuous monitoring of system logs for unusual activity, with audit trails to track access and modifications to health data.
```

**Prompt 2:**
Act as thejest jest and frontend configurator, I want you check and scan the @frontend because the tests are failing for a bad configuration, please check all the settings we have ver precisse and consice, we need to consider all test pass and that are well configurated

**Prompt 3:**
Act as the best consultor, mentor and architect and developer in python and react. I want you help me apply good practices for @backend and @frontend . Don't do  anything now, just check what we have and let me know if you have any doubt and ask, if all is fine for you just say it's Ok, if you find things to improve let me know step by step; I don't want to create big changes due that this app is not bigger. consider the cost-benefit of the changes,be consise and precise to avoid bugs and crashes, so we need to valid the existance of valid tests cases

### **2.6. Tests**

**Prompt 1:**
```markdown
Act as the best python tester and  configurator, I want you check and scan the @backend  because to create the test configuration and create more test , loook for a bad configuration, please check all the settings we have ver precisse and consice, we need to consider all test pass and that are well configurated
```

**Prompt 2:**
I want to create a test mocking the class AssistantManager, using @MockAssistantManager, the test should be for the method get_assistant_manager_creator, can you create it?

**Prompt 3:**
I am trying to fix this error in this test, please take a look and let me know what's going on, the test is checking @analyze_lab_results.py using a route as endpoint @__init__.py , the methos is get_assistant_manager_creator. The problem is that we need to use a mock version of AssistantManager class which is @MockAssistantManager , but when running the test is always running the real one consuming httl request, Can you please check and be consise resolving it


---

### 3. Modelo de Datos

**Prompt 1:**
```markdown
I want you elaborate the description of the datamodel in a markdown format, describe each entity model, tellme what they do and the main purpose, please check @__init__.py which is the place with the classes in python used to create the schema
```

**Prompt 2:**
act the best github action configurator, I need you to help me implement the CI-CD for @backend and @frontend , consider the infrastructure created in @terraform , askme anything you need if you have doubts

**Prompt 3:**
there is a problem in the pipeline with the test becasue the  looks like using an in-memory database however when running in github action is not and it's running migrations. Can you let me know how to validate the flask migrations on local and then in github actions?
---

### 4. Especificación de la API

**Prompt 1:**
how can add and implemente OpenAPI in the @backend with python flask?

**Prompt 2:**
create  the documentation of the  API specification based on this JSON definition: // 20241216062358
// http://localhost:5000/spec

{
  "definitions": {
    
  },
  "info": {
    "description": "API for the Vitamind project",
    "title": "Vitamind API",
    "version": "1.0.0"
  },
  "paths": {
    "/api/analyze-lab-results": {
      "post": {
        "description": "",
        "parameters": [
          {
            "in": "body",
            "name": "content",
            "required": true,
            "schema": {
              "properties": {
                "content": {
                  "description": "The lab results content to analyze",
                  "type": "string"
                }
              },
              "type": "object"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Lab results analyzed successfully",
            "schema": {
              "properties": {
                "conclusion": {
                  "description": "Overall conclusion from analysis",
                  "type": "string"
                },
                "diagnosis": {
                  "description": "Medical diagnosis if applicable",
                  "type": "string"
                },
                "markdown_summary": {
                  "description": "Formatted summary in markdown",
                  "type": "string"
                },
                "record_id": {
                  "description": "ID of the created health record",
                  "type": "integer"
                },
                "risks": {
                  "description": "Risk assessment results",
                  "type": "object"
                },
                "summary": {
                  "description": "Summary of the lab results",
                  "type": "string"
                },
                "test_date": {
                  "description": "Date when test was performed",
                  "format": "date",
                  "type": "string"
                }
              },
              "type": "object"
            }
          },
          "400": {
            "description": "Bad request - invalid input data",
            "schema": {
              "properties": {
                "message": {
                  "description": "Error message details",
                  "type": "string"
                },
                "status": {
                  "example": "error",
                  "type": "string"
                }
              },
              "type": "object"
            }
          }
        },
        "summary": "Analyze lab results endpoint to analyze the results of a lab test.",
        "tags": [
          "Lab Results"
        ]
      }
    },
    "/api/health": {
      "get": {
        "description": "",
        "responses": {
          "200": {
            "description": "API is healthy and operational",
            "schema": {
              "properties": {
                "status": {
                  "example": "healthy",
                  "type": "string"
                }
              },
              "type": "object"
            }
          },
          "500": {
            "description": "API is not functioning properly",
            "schema": {
              "properties": {
                "status": {
                  "example": "unhealthy",
                  "type": "string"
                }
              },
              "type": "object"
            }
          }
        },
        "summary": "Health check endpoint to verify API availability.",
        "tags": [
          "Health"
        ]
      }
    },
    "/api/health-records-metrics": {
      "post": {
        "description": "",
        "parameters": [
          {
            "in": "body",
            "name": "record_id",
            "required": true,
            "schema": {
              "properties": {
                "record_id": {
                  "description": "ID of the health record to retrieve metrics for",
                  "type": "integer"
                }
              },
              "type": "object"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Health record metrics retrieved successfully",
            "schema": {
              "properties": {
                "findings": {
                  "description": "List of findings and their metrics",
                  "items": {
                    "properties": {
                      "max_value": {
                        "description": "Maximum normal value",
                        "type": "number"
                      },
                      "min_value": {
                        "description": "Minimum normal value",
                        "type": "number"
                      },
                      "name": {
                        "description": "Name of the finding",
                        "type": "string"
                      },
                      "risk_level": {
                        "description": "Risk level assessment",
                        "type": "string"
                      },
                      "unit": {
                        "description": "Unit of measurement",
                        "type": "string"
                      },
                      "value": {
                        "description": "Measured value",
                        "type": "number"
                      }
                    },
                    "type": "object"
                  },
                  "type": "array"
                },
                "record_id": {
                  "description": "ID of the health record",
                  "type": "integer"
                }
              },
              "type": "object"
            }
          },
          "400": {
            "description": "Bad request - invalid record ID",
            "schema": {
              "properties": {
                "message": {
                  "description": "Error message details",
                  "type": "string"
                },
                "status": {
                  "example": "error",
                  "type": "string"
                }
              },
              "type": "object"
            }
          },
          "404": {
            "description": "Health record not found",
            "schema": {
              "properties": {
                "message": {
                  "description": "Error message details",
                  "type": "string"
                },
                "status": {
                  "example": "error",
                  "type": "string"
                }
              },
              "type": "object"
            }
          }
        },
        "summary": "Retrieve health record metrics endpoint to retrieve the metrics of a health record.",
        "tags": [
          "Health Records"
        ]
      }
    }
  },
  "swagger": "2.0"
}
```
**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**
Add the main three User Stories related to the Health Records Manager Feature by analyzing core functionalities to create an MVP. Focus on technical and functional requirements already defined from previous conversations.

# Steps

1. **Analyze Core Functionalities**: Review and understand the main functionalities of the Health Records Manager feature that are critical for an MVP.
2. **Examine Requirements**: Look at technical and functional requirements from previous conversations to guide feature selection.
3. **Draft User Stories**: Use the given template to create three detailed user stories that best represent the essential features.

# User Story Template

Title: [Short descriptive main title]

***As a [role], I want to [action], so that [benefit].***

Acceptance Criteria:
- [List specific acceptance criteria relevant to the actions and benefits described]

Priority: [High/Medium/Low]

Story Points: [Estimate, often as a numeric value indicating complexity or effort required]

Description:
[Provide additional details or context that add value to the understanding of the story's scope or purpose]

# Output Format

The response should be composed of three user stories formatted according to the template provided. Each story should include:
- A descriptive title 
- A user scenario including role, desired action, and benefit
- Clear acceptance criteria as bulleted list
- Priority level
- Story points estimation
- A detailed description

# Examples

Example 1:

Title: Access Medical History

***As a doctor, I want to view a patient's complete medical history, so that I can make informed treatment decisions.***

Acceptance Criteria:
- The system displays complete medical history sorted chronologically.
- Users can search specific medical events.
- Relevant medical history data is accessible within three clicks.

Priority: High

Story Points: 8

Description:
The feature should pull historical data from integrated hospital databases and display it through an intuitive interface to ensure quick access during patient consultations.

(Real examples should have more specific acceptance criteria tailored to the project's unique requirements, including technical considerations and potential integration issues.)

**Prompt 2:**
Revise the user stories according to the instructions provided:

# Steps

1. Revise User Story 1:
   - Alter the story to describe masking all PII data on the frontend before uploading files.
   - Ensure the conversion of files to text also occurs on the frontend, so registered and encrypted data is in text format.
   - Include that the text will be used for summarizing and interpreting results.
   - Change the functionality from deleting uploaded files to allowing users to remove specific registries.
   - Indicate that a lightweight database will be used in the backend instead of S3.

2. Revise User Story 2:
   - Modify the story to show extracted information without opening PDFs or files.
   - Add a constraint that only allows files of no more than 10 pages.
   - Specify that extracted data will be used for interpreting results.

3. Replace User Story 3:
   - Remove the current story and replace it with a feature that creates trends based on previous data.

# Output Format

- Each revised or new user story should be clearly and separately written.
- Use bullet points or short paragraphs for each user story to maintain clarity.

# Notes

- Ensure that the revised user stories address all the stated changes and constraints.
- Replace technical functionality descriptions with user needs where applicable in user stories.
- Consider the user’s perspective; ensure stories reflect functionality that is clear and actionable from a user's point of view.

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**
Act as an expert project manager to organize tasks for a project with one full-stack developer, ensuring iterative and valuable releases. Create tasks using the given template and prioritize them for these three user stories.

Consider the following details for each task:

- Identify tasks that deliver immediate value or enable further progress as high priority.
- Break down tasks into manageable units.
- Define clear acceptance criteria to ensure task completion satisfaction.
- Include relevant user stories to maintain a link to overall project goals.

# Steps

1. **Task Identification**: Analyze project requirements to identify key tasks. 
2. **Prioritization**: Assign each task a priority based on its impact and urgency.
3. **Template Integration**: Use the provided template to outline tasks, ensuring each section is completed.
4. **Validation**: Ensure tasks meet project goals and can be accomplished by the single available developer.
5. **Iterative Release Planning**: Structure tasks so they contribute to incremental, valuable releases.

# Output Format

Each task should be formatted according to this structure:

- Title: [Job Ticket Title]
- Description: Detailed technical description of the task.
- Criteria of Acceptance: Specific success indicators for the task.
  - List out each acceptance criterion clearly.
- Priority: Use High, Medium, or Low to indicate urgency and importance.
- Estimate: Use a range of story points as an estimate for task completion.
- Tags: Identify applicable tags such as Frontend, Backend, or DevOps.
- User Stories Links: Reference the relevant user story linked to the task.

# Examples

**Example 1**
- Title: Setup Authentication Framework
- Description: Implement and configure the authentication system using OAuth 2.0.
- Criteria of acceptance:
  - Users can sign up with an email and password.
  - Users can log in using Google OAuth.
  - Password reset functionality is active.
- Priority: High
- Estimate: 5 Story Points
- Tags: Backend, Security
- User Stories Links: Story_1

**Example 2**
- Title: Design User Dashboard
- Description: Create the frontend interface for the user dashboard, incorporating reactive elements.
- Criteria of acceptance:
  - Dashboard displays user data dynamically from the API.
  - Responsive design for different screen sizes.
  - Consistent look and feel with the overall design scheme.
- Priority: Medium
- Estimate: 8 Story Points

**Prompt 2:**
add more tasks  that are missed, for example we need to upload the file before task 1. We need to create the endpoints relatives to backend for task 2 and 3. We need to consider User interface relevant to each features. We need to create yaml or actions in GitHub for pipelines and create the Terraform files. We also need to create seeder for test data and create migrations in the backend. Please add these tasks and use the same format than before, and unify everything 

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

```
Create a pull request description with all the changes in the readme file and prompt file.
```

**Prompt 2:**

**Prompt 3:**
