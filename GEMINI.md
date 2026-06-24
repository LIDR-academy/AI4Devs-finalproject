# AI Configuration and Conventions

This project leverages AI tools (OpenCode and Gemini CLI) to assist with development. 
To maintain a single source of truth, all AI agents, skills, and conventions are defined centrally in the `AI/` and `conventions/` folders, respectively.

## 📜 Conventions (MANDATORY)
When operating in this workspace, you MUST adhere to the following project conventions. Read them before starting to code or committing changes:
- [Git Conventions](./conventions/git-conventions.md): Rules for committing, branching, and pull requests.
- [Technical Conventions](./conventions/technical-conventions.md): Architecture guidelines, coding standards, and styles.

## 📐 Technical Documentation (MANDATORY)
Before implementing any feature or making architectural decisions, consult the technical documentation:
- [Architecture Diagrams](./technical-documentation/architecture/01-architecture-diagram.md): C4 model, container diagrams, and flow sequences
- [Component Descriptions](./technical-documentation/architecture/02-components.md): Frontend, API, workers, and data tier details
- [Project Structure](./technical-documentation/architecture/03-project-structure.md): Clean Architecture, file structure, naming conventions
- [Infrastructure & Deployment](./technical-documentation/architecture/04-infrastructure-deployment.md): K8s, Kustomize, CI/CD, observability
- [Security](./technical-documentation/architecture/05-security.md): Auth, authorization, GDPR, rate limiting, K8s security
- [Testing Strategy](./technical-documentation/architecture/06-testing.md): Unit, integration, E2E tests with Testcontainers

## 🤖 AI Agents
Custom subagents are available for specialized tasks. They are located in the `AI/agents/` folder and linked natively to both tools.
- [doc-reviewer](./AI/agents/doc-reviewer.md)
- [doc-writer](./AI/agents/doc-writer.md)
- [feature-dev](./AI/agents/feature-dev.md)
- [po-assistant](./AI/agents/po-assistant.md)
- [project-scaffolder](./AI/agents/project-scaffolder.md)
- [tech-design](./AI/agents/tech-design.md)

## 🛠️ AI Skills
Specialized skills are available to guide your workflows. They are located in the `AI/skills/` folder and linked natively to both tools.
- [generate-aura-docs](./AI/skills/generate-aura-docs.md)
- [plan-mvp](./AI/skills/plan-mvp/SKILL.md)
