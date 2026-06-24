## 1. Angular Workspace Setup

- [ ] 1.1 Create `frontend/package.json` with Angular 22, Tailwind, and build dependencies
- [ ] 1.2 Create `frontend/angular.json` with build, serve, and test configurations
- [ ] 1.3 Create `frontend/tsconfig.json` with strict mode enabled
- [ ] 1.4 Create `frontend/tailwind.config.js` with Aura design tokens
- [ ] 1.5 Create `frontend/postcss.config.js` for Tailwind processing
- [ ] 1.6 Create directory structure: src/app/core/, src/app/features/, src/app/shared/, src/environments/, src/assets/

## 2. Design Tokens

- [ ] 2.1 Create `frontend/src/styles.scss` with `:root` CSS custom properties from Aura style guide (colors, typography, spacing, border-radius, shadows)
- [ ] 2.2 Configure `tailwind.config.js` to reference CSS custom properties for colors, spacing, fonts
- [ ] 2.3 Verify token values match `conventions/style-guide.md` exactly

## 3. App Shell

- [ ] 3.1 Create `frontend/src/index.html` with root app element
- [ ] 3.2 Create `frontend/src/main.ts` with bootstrapApplication call
- [ ] 3.3 Create `frontend/src/app/app.component.ts` (standalone, minimal shell with "Aura Planning" text)
- [ ] 3.4 Create `frontend/src/app/app.routes.ts` with empty route array
- [ ] 3.5 Create `frontend/src/app/app.config.ts` with providers and environment import
- [ ] 3.6 Create `frontend/src/environments/environment.ts` with `apiBaseUrl: 'http://localhost:5000/api'`
- [ ] 3.7 Create `frontend/src/environments/environment.prod.ts` with production API URL
- [ ] 3.8 Verify `cd frontend && npm install` succeeds
- [ ] 3.9 Verify `cd frontend && npm run build -- --configuration production` succeeds

## 4. Production Server Config

- [ ] 4.1 Create `frontend/nginx.conf` with SPA routing (try_files $uri $uri/ /index.html)

## 5. CI Pipeline Update

- [ ] 5.1 Add `angular-build` job to `.github/workflows/ci.yml`: setup Node 22, npm ci, ng build
- [ ] 5.2 Verify CI passes with dotnet + angular build steps
