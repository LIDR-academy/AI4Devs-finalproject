## 1. Angular Workspace Setup

- [x] 1.1 Create `frontend/package.json` with Angular 22, Tailwind, and build dependencies
- [x] 1.2 Create `frontend/angular.json` with build, serve, and test configurations
- [x] 1.3 Create `frontend/tsconfig.json` with strict mode enabled
- [x] 1.4 Create `frontend/tailwind.config.js` with Aura design tokens
- [x] 1.5 Create `frontend/postcss.config.js` for Tailwind processing
- [x] 1.6 Create directory structure: src/app/core/, src/app/features/, src/app/shared/, src/environments/, src/assets/

## 2. Design Tokens

- [x] 2.1 Create `frontend/src/styles.scss` with `:root` CSS custom properties from Aura style guide (colors, typography, spacing, border-radius, shadows)
- [x] 2.2 Configure `tailwind.config.js` to reference CSS custom properties for colors, spacing, fonts
- [x] 2.3 Verify token values match `conventions/style-guide.md` exactly

## 3. App Shell

- [x] 3.1 Create `frontend/src/index.html` with root app element
- [x] 3.2 Create `frontend/src/main.ts` with bootstrapApplication call
- [x] 3.3 Create `frontend/src/app/app.component.ts` (standalone, minimal shell with "Aura Planning" text)
- [x] 3.4 Create `frontend/src/app/app.routes.ts` with empty route array
- [x] 3.5 Create `frontend/src/app/app.config.ts` with providers and environment import
- [x] 3.6 Create `frontend/src/environments/environment.ts` with `apiBaseUrl: 'http://localhost:5000/api'`
- [x] 3.7 Create `frontend/src/environments/environment.prod.ts` with production API URL
- [x] 3.8 Verify `cd frontend && npm install` succeeds
- [x] 3.9 Verify `cd frontend && npm run build -- --configuration production` succeeds

## 4. Production Server Config

- [x] 4.1 Create `frontend/nginx.conf` with SPA routing (try_files $uri $uri/ /index.html)

## 5. CI Pipeline Update

- [x] 5.1 Add `angular-build` job to `.github/workflows/ci.yml`: setup Node 22, npm ci, ng build
- [x] 5.2 Verify CI passes with dotnet + angular build steps
