# TASK-US-101-02: Configure TypeScript

[Trello Card](https://trello.com/c/1tx8lQnx)



## Parent User Story
[US-101: Frontend Project Setup](../../user-stories/frontend/US-101-frontend-project-setup.md)

## Description
Configure TypeScript for strict type safety in the frontend project, including path aliases, compiler options, and type-check scripts.

## Priority
🔴 Critical

## Estimated Time
1 hour

## Detailed Steps

### 1. Enable strict TypeScript settings
Update `frontend/tsconfig.json`:
- Enable `strict`, `noUncheckedIndexedAccess`, and `forceConsistentCasingInFileNames`
- Keep `moduleResolution` compatible with Next.js
- Ensure `skipLibCheck` remains enabled to avoid third-party type noise

### 2. Configure path aliases
Add and validate aliases:
- `@/*`
- `@/components/*`
- `@/lib/*`
- `@/hooks/*`
- `@/types/*`

### 3. Create core shared types
Add initial type modules under `frontend/src/types/`:
- `api.ts`
- `user.ts`
- `file.ts`

Include base response and pagination interfaces used by the API layer.

### 4. Add scripts and checks
In `frontend/package.json`, ensure scripts exist:
- `type-check`: `tsc --noEmit`
- `lint`: Next.js lint command

### 5. Validate setup
Run:
```bash
npm run type-check
npm run lint
```

## Acceptance Criteria
- [ ] TypeScript strict mode is enabled
- [ ] Path aliases resolve correctly in imports
- [ ] Shared types folder contains initial domain interfaces
- [ ] `npm run type-check` passes without errors
- [ ] Lint and type-check scripts are available in `package.json`

## Notes
- Keep types close to domain concepts and avoid `any` where possible
- Prefer `unknown` + explicit narrowing for untrusted API payloads
- Re-run type-check before each frontend PR merge

## Completion Status
- [x] 100% - Completed
