## PSRP-015: feat(ssg): static-site-generator

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W5
**Dependencies:** PSRP-010, PSRP-013

## Feature Summary
Implementar el worker del Generador de Sitios Estáticos (SSG) que genera micrositios de invitación HTML/CSS/JS optimizados para móvil y ultra-rápidos para eventos publicados. Cuando un evento es publicado (o actualizado), el SSG desencola desde `ssg:queue`, renderiza plantillas Razor con datos del evento (nombres de la pareja, fecha, venue, imagen hero, colores/fuentes personalizados), sube a MinIO bucket `static-sites`, e invalida la caché del CDN. El micrositio incluye embed de Google Maps, enlace RSVP, botones de añadir al calendario, y deep links a direcciones.

## Requirements
- [ ] Create `Aura.Workers.SSG` project with `Program.cs` (HostBuilder for background worker)
- [ ] Implement `StaticSiteGeneratorWorker` (BackgroundService) that: BRPOP from `ssg:queue`, deserializes payload (eventId, eventSlug, eventType), fetches event data from DB, renders templates, uploads to MinIO, invalidates CDN cache
- [ ] Implement Razor template rendering for static site: `index.html` (main invitation page), `styles.css` (generated from event colors/fonts), `app.js` (RSVP form handling, add-to-calendar, maps)
- [ ] Create 3 Razor template sets matching the 3 preset templates (Classic Elegance, Modern Minimal, Rustic Charm) with sections: hero, details, venue, rsvp-link
- [ ] Implement CSS generation: inject event PrimaryColor, SecondaryColor, FontFamily into CSS template
- [ ] Implement MinIO upload: upload `index.html`, `styles.css`, `app.js`, and assets (hero image, template backgrounds) to `static-sites/{event-slug}/` bucket path
- [ ] Implement CDN cache invalidation: call Cloudflare API to purge cache for path `/e/{event-slug}/*`
- [ ] Implement Google Maps embed: generate iframe embed URL from venue lat/lng or address
- [ ] Implement add-to-calendar buttons: generate .ics file download link and Google Calendar URL with event details pre-filled
- [ ] Implement directions deep links: Google Maps (`https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`) and Waze (`https://waze.com/ul?ll={lat},{lng}&navigate=yes`)
- [ ] Ensure mobile-first responsive design: Lighthouse performance score > 90, load time < 2s on 3G
- [ ] Create Dockerfile for Aura.Workers.SSG
- [ ] Create Kubernetes Deployment manifest for SSG worker (1 replica)
- [ ] Write unit tests for template rendering, CSS generation, and MinIO upload logic

## Technical Notes
- **Backend:**
  - Razor Light SDK for template rendering: `RazorLight.RazorLightEngine`. Templates stored as embedded resources or files
  - MinIO upload: use Minio.NET SDK. Upload path: `static-sites/{slug}/index.html`, etc.
  - CDN invalidation: Cloudflare API `POST /client/v4/zones/{zone_id}/purge_cache` with `files` array
  - SSG payload: `{ eventType: "published"|"updated", eventId, eventSlug }`
  - On "updated": regenerate and re-upload all files, then purge CDN cache
- **Frontend (Static Site):**
  - `index.html`: semantic HTML5, mobile-first, sections: hero (couple names + image), details (date, time), venue (map embed + address), RSVP (link to `/rsvp/{token}`), calendar + directions buttons
  - `styles.css`: generated from template + event colors/fonts. Critical CSS inlined for performance
  - `app.js`: minimal JS for RSVP token handling (read from URL param or cookie), add-to-calendar (.ics generation), smooth scroll
  - Performance: minify HTML/CSS/JS, lazy-load map iframe, preload hero image
- **Database:** Events table (read event data), Templates table (read template layout)
- **Integrations:** MinIO (upload), Cloudflare CDN (cache purge), Google Maps (embed)
- **Key files:**
  - `backend/workers/Aura.Workers.SSG/Program.cs`
  - `backend/workers/Aura.Workers.SSG/StaticSiteGeneratorWorker.cs`
  - `backend/workers/Aura.Workers.SSG/TemplateRenderer.cs`
  - `backend/workers/Aura.Workers.SSG/MinioUploader.cs`
  - `backend/workers/Aura.Workers.SSG/CdnInvalidator.cs`
  - `backend/workers/Aura.Workers.SSG/templates/classic/index.cshtml`
  - `backend/workers/Aura.Workers.SSG/templates/modern/index.cshtml`
  - `backend/workers/Aura.Workers.SSG/templates/rustic/index.cshtml`
  - `backend/workers/Aura.Workers.SSG/templates/shared/styles.cshtml`
  - `backend/workers/Aura.Workers.SSG/templates/shared/app.js`
  - `backend/workers/Aura.Workers.SSG/Dockerfile`
  - `k8s/base/workers/ssg-deployment.yaml`

## Acceptance Criteria
- [ ] AC1: Given an event is published, when the SSG worker processes the `ssg:queue` message, then `index.html`, `styles.css`, and `app.js` are generated and uploaded to MinIO at `static-sites/{slug}/`
- [ ] AC2: Given the static site is uploaded, when a guest navigates to `aura.planning/e/{slug}`, then the microsite loads with event details, venue map, RSVP link, calendar buttons, and directions links
- [ ] AC3: Given the static site is viewed on mobile 3G, when Lighthouse audit is run, then performance score is > 90 and load time is < 2 seconds
- [ ] AC4: Given the host updates event details after publishing, when the SSG regenerates the site, then the CDN cache is invalidated and the new content is visible within 1 hour
- [ ] AC5: Given a guest clicks "Get Directions", when the button is tapped, then Google Maps or Waze opens with the venue as destination
- [ ] AC6: Given a guest clicks "Add to Calendar", when the button is clicked, then a .ics file downloads or Google Calendar opens with event details pre-filled

## Related Items
- **PRD section:** 06-mvp-features.md (6.2.1 Static JAMstack Site, US-MS-01 through US-MS-05, AC-MS-01 through AC-MS-07)
- **Architecture:** 02-components.md (Static Site Generator, Guest Microsite), 01-architecture-diagram.md (CDN flow)
- **Data model:** entities.md (Events, Templates)

## Blockers
Blocked by: PSRP-010, PSRP-013

## Branch Name
`feature/PSRP-015-static-site-generator`

(End of file - total 73 lines)