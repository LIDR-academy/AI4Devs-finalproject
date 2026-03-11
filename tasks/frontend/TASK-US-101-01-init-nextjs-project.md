# TASK-US-101-01: Initialize Next.js Project

[Trello Card](https://trello.com/c/47bLsCOA)



## Parent User Story
[US-101: Frontend Project Setup](../../user-stories/frontend/US-101-frontend-project-setup.md)

## Description
Create a new Next.js 14+ project with TypeScript, Tailwind CSS, and the App Router. Set up the initial project structure and configuration.

## Priority
🔴 Critical

## Estimated Time
2 hours

## Detailed Steps

### 1. Create Next.js Project
```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Options:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- src/ directory: Yes
- App Router: Yes
- Import alias: @/*

### 2. Install Additional Dependencies
```bash
npm install \
  axios \
  @tanstack/react-query \
  zustand \
  react-hook-form \
  @hookform/resolvers \
  zod \
  react-dropzone \
  react-hot-toast \
  lucide-react \
  clsx \
  tailwind-merge
```

### 3. Install Dev Dependencies
```bash
npm install -D \
  @types/node \
  @playwright/test \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @types/jest \
  prettier \
  prettier-plugin-tailwindcss \
  msw
```

### 4. Update Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   ├── retrieve/
│   │   │   └── page.tsx
│   │   ├── files/
│   │   │   └── page.tsx
│   │   └── docs/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── toast.tsx
│   │   ├── forms/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── upload-form.tsx
│   │   └── layout/
│   │       ├── header.tsx
│   │       ├── footer.tsx
│   │       └── sidebar.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── validations.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-files.ts
│   │   └── use-toast.ts
│   ├── stores/
│   │   └── auth-store.ts
│   └── types/
│       ├── api.ts
│       ├── user.ts
│       └── file.ts
├── public/
├── tests/
│   ├── unit/
│   ├── components/
│   └── e2e/
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── jest.config.js
├── playwright.config.ts
└── package.json
```

### 5. Create Base Configuration Files

**tailwind.config.ts**
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

**next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
```

### 6. Create Environment Files

**.env.example**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=IPFS Gateway
```

## Acceptance Criteria
- [ ] Next.js project is created with App Router
- [ ] TypeScript is properly configured
- [ ] Tailwind CSS is working
- [ ] All dependencies are installed
- [ ] Directory structure is set up
- [ ] Configuration files are created
- [ ] Project builds without errors

## Notes
- Use App Router (not Pages Router) for latest Next.js features
- Configure path aliases for cleaner imports
- Set up proper TypeScript strict mode

## Completion Status
- [x] 100% - Completed
