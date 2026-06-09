## PSRP-023: chore(polish): final-polish-and-documentation

**Type:** chore
**Priority:** P1 (Should)
**Estimated Effort:** M (2-3d)
**Sprint Week:** W8
**Dependencies:** PSRP-022

## Feature Summary
Pasada final de pulido en toda la aplicación: optimización de rendimiento, mejoras de accesibilidad, refinamiento del manejo de errores, actualizaciones de documentación, y checklist pre-lanzamiento. Incluye optimización de tiempo de respuesta de API, reducción de tamaño del bundle frontend, auditoría Lighthouse para micrositios de invitados, actualizaciones del README, documentación de API (Swagger), y runbook de despliegue.

## Requirements
- [ ] Performance optimization: review and optimize slow database queries (add missing indexes, N+1 query fixes, eager loading)
- [ ] Frontend bundle optimization: lazy-load feature modules, tree-shake unused code, optimize images, enable gzip/brotli compression in nginx
- [ ] Guest microsite performance: run Lighthouse audit, optimize for <2s load on 3G, target performance score >90
- [ ] Accessibility audit: ensure WCAG 2.1 AA compliance for critical flows (auth, dashboard, RSVP form). Check color contrast, focus states, keyboard navigation, ARIA labels
- [ ] Error handling refinement: review all API error responses for consistency, ensure frontend displays user-friendly error messages for all failure scenarios
- [ ] API documentation: finalize Swagger/OpenAPI spec with descriptions, examples, and response schemas for all endpoints
- [ ] Update README.md with: project overview, tech stack, setup instructions (local dev with Rancher Desktop), environment variables, API endpoints summary, deployment guide
- [ ] Create deployment runbook: step-by-step guide for first production deploy (domain setup, DNS, SSL, Stripe live keys, WhatsApp production access, Cloudflare config)
- [ ] Create environment variable documentation: list all required env vars for API, workers, frontend, with descriptions and example values
- [ ] Pre-launch checklist: verify all external dependencies are configured (Gmail SMTP, Google Maps API, Stripe, WhatsApp, Cloudflare), test end-to-end flow in staging, verify GDPR compliance (data deletion, consent tracking)
- [ ] Security review: verify rate limiting is active, CORS is restricted, security headers are present, PII encryption is working, JWT cookies are httpOnly+Secure
- [ ] Monitor setup: configure basic Prometheus metrics endpoint, verify health checks are working, set up error tracking (Sentry or similar)

## Technical Notes
- **Backend:**
  - Query optimization: use EF Core profiling (logging SQL queries), add `.Include()` for navigation properties, create composite indexes for common WHERE clauses
  - API response compression: `app.UseResponseCompression()` in Program.cs
  - Swagger: add XML comments to controllers and DTOs, configure `SwaggerGenOptions` with document info
- **Frontend:**
  - Lazy loading: `loadComponent: () => import('./features/...')` in routes
  - Bundle analysis: `ng build --stats-json` + webpack-bundle-analyzer
  - nginx config: enable gzip, set cache headers for static assets
- **Database:** Review query execution plans with `EXPLAIN ANALYZE`, add partial indexes for soft-deleted tables
- **Integrations:** Verify all external service credentials are in K8s Secrets, test webhook endpoints in staging
- **Key files:**
  - `readme.md` (update)
  - `DEPLOYMENT.md` (new)
  - `ENVIRONMENT.md` (new)
  - `backend/src/Aura.Api/Program.cs` (compression, swagger)
  - `frontend/nginx.conf` (gzip, cache)
  - `frontend/angular.json` (budget, optimization)

## Acceptance Criteria
- [ ] AC1: Given the API is under load, when response times are measured, then 95th percentile is <500ms for all endpoints
- [ ] AC2: Given the frontend is built for production, when bundle size is analyzed, then the initial load bundle is <200KB gzipped
- [ ] AC3: Given a guest microsite is audited with Lighthouse, when the audit runs on mobile 3G simulation, then performance score is >90 and load time <2s
- [ ] AC4: Given the README is reviewed, when a new developer follows the setup instructions, then they can run the project locally within 30 minutes
- [ ] AC5: Given the deployment runbook is followed, when the steps are executed in order, then the application is deployed to production with all external services configured
- [ ] AC6: Given the pre-launch checklist is completed, when all items are verified, then the application is ready for launch with no critical blockers

## Related Items
- **PRD section:** 08-success-metrics.md (quality metrics), 09-risks-assumptions.md (external dependencies)
- **Architecture:** 04-infrastructure-deployment.md (deployment), 05-security.md (security review)
- **Data model:** N/A

## Blockers
Blocked by: PSRP-022

## Branch Name
`feature/PSRP-023-final-polish-and-documentation`

(End of file - total 62 lines)