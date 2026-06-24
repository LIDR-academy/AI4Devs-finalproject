## Context

The frontend directory does not exist. The architecture docs define an Angular 22 SPA with standalone components, signals, strict mode, and the new control flow syntax. The style guide (`conventions/style-guide.md`) defines a complete design system with CSS custom properties, Playfair Display + Inter fonts, and a warm/earth-tone color palette.

## Goals / Non-Goals

**Goals:**
- Create an Angular 22 workspace that builds without errors
- Configure Tailwind CSS with Aura design tokens as CSS custom properties
- Minimal app shell component that renders without errors
- Empty route configuration ready for PSRP-005 (auth UI)
- Environment files with API base URL configuration
- nginx.conf for SPA routing in production Docker image

**Non-Goals:**
- No auth components, services, or guards (PSRP-005)
- No shared UI components (button, input, card — PSRP-005)
- No feature modules or pages (PSRP-006+)
- No CSRF interceptor (PSRP-005)

## Decisions

### 1. Manual workspace setup (not `ng new`)
`ng new` creates a lot of boilerplate we don't need. We'll create the workspace manually with the minimal set of files: angular.json, package.json, tsconfig.json, tailwind.config.js, and src/ structure. This gives us precise control over what's included.

### 2. Tailwind with CSS custom properties for design tokens
The style guide defines CSS custom properties (`--color-primary`, `--spacing-4`, etc.). Tailwind will be configured to reference these via `theme.extend.colors` and `theme.extend.spacing`, so both utility classes and raw CSS variables work.

### 3. Standalone components from day one
No NgModules. All components use `standalone: true` with explicit `imports` arrays. This is the Angular 22 default and matches conventions.

### 4. Signals for reactive state
Angular Signals (`signal()`, `computed()`, `effect()`) will be used for all reactive state. No BehaviorSubject or RxJS-based state management in the core app layer.

### 5. nginx.conf for SPA routing
Production Docker image uses nginx with a catch-all location block (`try_files $uri $uri/ /index.html`) to support Angular's client-side routing.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Angular 22 may have breaking changes from v19 | Confirmed released (v22.0.2). Use exact version in package.json |
| Tailwind + CSS custom properties can be tricky | Use `theme()` function in Tailwind config to reference CSS vars |
| Node.js 22 required for Angular 22 | Confirmed in GitHub Actions setup |
