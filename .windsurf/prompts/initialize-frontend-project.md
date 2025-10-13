# ROLE
You are a senior frontend software engineer with extensive experience in building scalable, maintainable, and high-performance web applications using React and TypeScript.

# TASK
A new React project needs to be initialized using Vite. Your task is to generate all the necessary commands, configuration files, and a recommended folder structure to set up a professional, production-ready project.

# CONSTRAINTS- Build Tool: Vite.
- Framework/Language: React with TypeScript.
- Styling: Tailwind CSS for utility-first styling.
- Routing: React Router (react-router-dom) for client-side routing.
- State Management: Zustand for simple and scalable state management.
- Testing:
- Unit/Component Testing: Vitest with React Testing Library.
- End-to-End (E2E) Testing: Playwright.
- Linting & Formatting:
    - ESLint with recommended plugins for React, TypeScript, and accessibility (jsx-a11y).
    - Prettier for consistent code formatting.
    - ESLint and Prettier must be configured to work together without conflicts.
- Git Hooks: Husky and lint-staged to run linting and formatting checks before each commit.
- Path Aliases: Configure absolute imports (e.g., @/components/* instead of ../../components/*) for cleaner code.
- Environment Variables: The setup should support .env files for managing environment-specific variables.

# OUTPUT
the fronten project must be initialized in the folder frontend
Provide a complete guide for setting up the project, including:
- Initialization Commands: The initial command to create the Vite project.
- Dependency Installation: All npm or yarn commands to install the required production and development dependencies.
- Configuration Files: The complete code for all necessary configuration files, including:
    - vite.config.ts (with path alias setup)
    - tailwind.config.js
    - postcss.config.js
    - tsconfig.json (updated for path aliases)
    - .eslintrc.cjs
    - .prettierrc
    - vitest.setup.ts (for React Testing Library setup)
    - Playwright configuration.
    - lint-staged configuration in package.json.
- Git Hooks Setup: The commands to initialize Husky and configure the pre-commit hook.
- Folder Structure: A clear, scalable folder structure that separates concerns effectively. Organize the src directory by features or domains.
- .gitignore: A comprehensive .gitignore file suitable for a Vite + React project.

# EXAMPLE FOLDER STRUCTURE
Provide a final folder structure that looks like this:

frontend/
├── .husky/
├── .vscode/
│   └── settings.json
├── public/
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   └── Modal.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── features/
│   │   └── auth/
│   │       ├── components/
│   │       │   └── LoginForm.tsx
│   │       ├── hooks/
│   │       │   └── useAuth.ts
│   │       ├── stores/
│   │       │   └── authStore.ts
│   │       └── types/
│   │           └── index.ts
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── LoginPage.tsx
│   ├── providers/
│   ├── routes/
│   │   └── index.tsx
│   ├── services/
│   │   └── api.ts
│   ├── stores/
│   ├── styles/
│   │   └── globals.css
│   ├── types/
│   │   └── global.d.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   └── example.spec.ts
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc
├── index.html
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.setup.ts