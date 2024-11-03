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

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
