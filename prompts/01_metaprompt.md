================ METAPROMPT  ================

# METAPROMPT: Technical Architecture Section for ShopMefy WhatsApp E-commerce Platform

You are an expert product manager and full-stack developer tasked with drafting the Project Vision & Technical Architecture section of the PRD.md for the ShopMefy WhatsApp E-commerce Platform. This section should only include information provided in the prompt below, strictly avoiding any assumptions or invented details.

Your task is to produce a clear and detailed description of the project's vision and technical architecture, covering all key elements described in the original prompt. Specifically, focus on the system design, data flows, architecture components, and technologies used.

The platform is a multilingual SaaS solution that enables businesses to deploy AI-powered chatbots on WhatsApp for sales and customer service. The system processes customer messages, executes function calls, and generates responses called ShopMefy

Describe the technical stack including Node.js with TypeScript, React, Prisma ORM, PostgreSQL, OpenRouter, LangChain, and Docker, and explain how each element fits into the overall architecture. Mention the customizable agent configuration for businesses, and the use of an admin panel for setup and management of products, services, FAQs, business hours, and special offers.

- The MVP is strickly dedicated to an Ecommerce of italian product so let's considering this enitites: Prodcuts, Services, Faqs, Docuemnts the chatbnot should be able to talk aand retrive
inforamtion in natural language

- The Sass solution is called Shopify
- The demo customer is "Gusto italiano" that will have ad admin page for load products, services,faqs,documenit
- The chabot assistance name is SofIA 
- we will convert data in embedding except for the products
- we will use LanguChian
- we will use OpenRouter
- the user can config his prompts directlyu on the admin page

**CORE CRUD OPERATIONS:**
For now, I'll implement CRUD operations for:
- Products
- Categories
- Suppliers
- Offers
- Services
- Clients
- Documents with the possibility to upload a pdf file


**BUSINESS IMPACT RO UNDERLINE:**
- 24/7 automated customer service
- Increased sales through instant product information
- Reduced operational costs
- Enhanced customer engagement
- Automated marketing capabilities



**Backend Architecture Requirements:**
- Implement Domain-Driven Design (DDD) best practices for backend development
- Follow clean architecture principles with proper separation of concerns
- Use TypeScript for type safety and better code maintainability
- Structure the backend using DDD patterns: Entities, Value Objects, Repositories, Services, and Domain Events
- Implement proper layering: Domain Layer, Application Layer, Infrastructure Layer, and Presentation Layer

**Security & Compliance:**
- Implement OWASP security best practices throughout the application
- Follow OWASP Top 10 security guidelines for web application security
- Ensure secure authentication, authorization, and data protection mechanisms
- Implement proper input validation, output encoding, and SQL injection prevention
- Apply security headers, HTTPS enforcement, and secure session management

**Technology Stack Integration:**
- Node.js with TypeScript as the backend runtime and language
- Prisma ORM for database operations and schema management
- React for the frontend admin panel and user interfaces
- OpenRouter for LLM provider connectivity and management
- LangChain for AI agent orchestration and function calling
- PostgreSQL as the primary database
- Docker for containerization and deployment

**Database Seeding Requirements:**
- Implement Prisma seeding system to populate the database with initial data
- Create comprehensive seed scripts for products, categories, services, FAQs, and documents
- Ensure seed data reflects realistic business scenarios for demonstration and testing
- Include Italian food business examples (Formaggi, Salumi, Pasta, Vini, Olio, Conserve, Dolci, Bevande)
- Seed data should support AI function calling and RAG system testing
- Provide both development and production seeding strategies


**Data security**
We will not treat sensitive data we will return links for pay the order, resister or for download a pdf creating a temporaly token


**Multichannel**
User can create into this Sass platform his whatsapp challenges. 


**UI:**
we will download a layout from Lovable you can see the screesnhot in  `/AI4Devs-finalproject/prompts/docs/img`

**Incude also**
- COMPETITIVE ANALYSIS
- DATA MODEL
- Dialog Example
- Folder Structure
- Development Roadmap
- OWASP security
- Anti spam security with API LIMITs
- API CALL CRUD for agents settings with temperatyre topq e token
- API CALL CRUD for products, services, faqs
- API CALL CRUD for Document upload



**OUTPUT**
Let's have an interacative chats and let's resolve all the doubts that you have and write the final document in this folder `/prompts/02_PR.md` the document has to indluce an index
