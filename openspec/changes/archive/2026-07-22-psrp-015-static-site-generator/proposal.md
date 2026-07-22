## Why

We need to generate ultra-fast, mobile-optimized static microsites for events. This provides guests with a performant, visually appealing invitation that includes venue details, RSVP links, and calendar integration without hitting the dynamic API for every page load. It solves the performance and scalability issues for high-traffic events.

## What Changes

- Create a new background worker `Aura.Workers.SSG` that listens to the `ssg:queue`.
- Implement Razor template rendering (`RazorLight`) for event static sites (HTML, CSS, JS).
- Upload generated files to the MinIO `static-sites` bucket.
- Purge CDN (Cloudflare) cache upon publishing/updating an event.
- Provide responsive templates (Classic Elegance, Modern Minimal, Rustic Charm) with dynamic colors/fonts.
- Include Google Maps embed, "Add to Calendar", and directions links.

## Capabilities

### New Capabilities
- `static-site-generator`: Generates and publishes static HTML/CSS/JS sites to MinIO based on event data and templates when triggered by `ssg:queue` messages.

### Modified Capabilities
- (None)

## Impact

- **New Component**: `Aura.Workers.SSG` background worker application.
- **Queue/Redis**: Listens to `ssg:queue` for background jobs.
- **MinIO**: Stores generated static sites in the `static-sites/{event-slug}/` path.
- **External Integration**: Uses Cloudflare API to invalidate cache for `/e/{event-slug}/*`.
