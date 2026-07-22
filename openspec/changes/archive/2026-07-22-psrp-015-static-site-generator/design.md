## Context

Currently, the Aura platform provides dynamic RSVP links for guests to confirm attendance. However, relying on a dynamic frontend for serving public event microsites leads to performance bottlenecks and scaling issues, especially for high-profile events with many attendees accessing the page simultaneously. Generating a Static Site (HTML/CSS/JS) ensures near-instant load times, resilience to traffic spikes (via CDN), and better SEO/sharing capabilities.

## Goals / Non-Goals

**Goals:**
- Implement a .NET Background Worker (`Aura.Workers.SSG`) that consumes messages from `ssg:queue` in Redis.
- Render Razor templates to generate `index.html`, `styles.css`, and `app.js` using `RazorLight`.
- Upload the generated files and assets to a MinIO bucket (`static-sites`).
- Trigger Cloudflare CDN cache invalidation for the event slug.
- Achieve a Lighthouse score of > 90 and sub-2s load time on 3G.

**Non-Goals:**
- Creating an integrated CMS for site customization beyond the 3 preset templates (Classic, Modern, Rustic) and basic color/font choices.
- Replacing the dynamic React/Angular frontend used for the host dashboard.

## Decisions

- **RazorLight for Template Rendering:** Provides native, strongly-typed rendering of Razor views (.cshtml) in a console/background worker context without ASP.NET Core MVC dependencies.
- **MinIO Object Storage:** Allows scalable hosting of static files. We will use the `Minio.NET` SDK to upload generated assets to `static-sites/{slug}`.
- **Queue-Driven Generation:** Using Redis (`ssg:queue`) decouples the API publishing action from the heavy template rendering process, ensuring API responsiveness.
- **Cloudflare Cache Purge:** We will call the Cloudflare API `POST /client/v4/zones/{zone_id}/purge_cache` to immediately invalidate the cache when an event is updated and the site is regenerated.

## Risks / Trade-offs

- **Risk: Template rendering failures causing queue blockage.**
  - *Mitigation:* Implement robust error handling, dead-letter queues (DLQ), and retries in the background worker.
- **Risk: MinIO upload or Cloudflare purge rate limits.**
  - *Mitigation:* Add jitter to retries, and ensure the SSG worker logs failures gracefully for manual or automated recovery.
- **Trade-off:** Static sites mean guests see slightly stale data if they load the page immediately after an update, until the CDN cache propagates the purge. This is an acceptable trade-off for the massive performance gains.
