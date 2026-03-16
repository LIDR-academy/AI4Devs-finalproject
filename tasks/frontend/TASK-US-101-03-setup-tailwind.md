# TASK-US-101-03: Setup Tailwind

[Trello Card](https://trello.com/c/R9KXSH56)



## Parent User Story
[US-101: Frontend Project Setup](../../user-stories/frontend/US-101-frontend-project-setup.md)

## Description
Set up Tailwind CSS with project-wide design tokens, global styles, and content scanning paths for the Next.js App Router structure.

## Priority
🔴 Critical

## Estimated Time
1 hour

## Detailed Steps

### 1. Configure Tailwind content paths
Update `frontend/tailwind.config.ts` to scan:
- `./src/app/**/*.{js,ts,jsx,tsx,mdx}`
- `./src/components/**/*.{js,ts,jsx,tsx,mdx}`
- `./src/lib/**/*.{js,ts,jsx,tsx,mdx}`

### 2. Define theme tokens
Add base tokens in `theme.extend`:
- Brand colors
- Neutral scale
- Border radius
- Spacing and shadows used by shared components

### 3. Set global styles
Update `frontend/src/app/globals.css`:
- Include Tailwind base/components/utilities directives
- Define CSS variables for core color tokens
- Add sensible defaults for body background, text color, and typography smoothing

### 4. Verify utility classes and responsiveness
Create/update a sample page/component using:
- Responsive utilities (`sm`, `md`, `lg`)
- State utilities (`hover`, `focus-visible`)
- Layout helpers (`container`, `grid`, `flex`)

### 5. Validate build
Run:
```bash
npm run dev
```
Confirm styles compile and hot-reload correctly.

## Acceptance Criteria
- [ ] Tailwind is configured and scanning the correct source paths
- [ ] Project theme tokens are available and documented in config
- [ ] Global stylesheet includes Tailwind directives and base variables
- [ ] Responsive and interactive utility classes work as expected
- [ ] No Tailwind build/runtime errors occur during local run

## Notes
- Keep design tokens centralized to reduce future refactors
- Avoid hardcoded one-off colors in components when token exists
- Ensure class naming remains readable when composing long utility chains

## Pull Request
- [PR #14: US-101 frontend project setup foundation](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/14)

## Completion Status
- [x] 100% - Completed
