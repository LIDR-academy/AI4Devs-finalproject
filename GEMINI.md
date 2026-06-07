# AI Configuration and Conventions

This project leverages AI tools (OpenCode and Gemini CLI) to assist with development. 
To maintain a single source of truth, all AI agents, skills, and conventions are defined centrally in the `AI/` and `conventions/` folders, respectively.

## 📜 Conventions (MANDATORY)
When operating in this workspace, you MUST adhere to the following project conventions. Read them before starting to code or committing changes:
- [Git Conventions](./conventions/git-conventions.md): Rules for committing, branching, and pull requests.
- [Technical Conventions](./conventions/technical-conventions.md): Architecture guidelines, coding standards, and styles.

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
