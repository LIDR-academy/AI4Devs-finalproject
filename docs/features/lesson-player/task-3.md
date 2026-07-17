---
id: task-3
title: Slide image — signed-URL data stack + SlideImage molecule
slice: 1
scenarios: [s7, s8]
status: done
paths:
  - libs/supabase-services/src/dao/lesson-image.dao.ts
  - libs/supabase-services/src/services/lesson-image.service.ts
  - libs/hooks/src/hooks/use-slide-image-url.ts
  - libs/hooks/src/hooks/use-slide-image-url.types.ts
  - libs/hooks/src/hooks/index.ts
  - libs/activities/src/organisms/slide-image/slide-image.tsx
  - libs/activities/src/organisms/slide-image/slide-image.types.ts
  - libs/activities/src/organisms/slide-image/slide-image.stories.tsx
  - libs/activities/src/organisms/slide-image/slide-image.test.tsx
---

## Goal
Resolve a short-lived Supabase signed URL from `SlideImageRef.storagePath` (bucket `pdf-images`) and render the image scaled to fit the viewport. `LessonImageDao.createSignedUrl` → `LessonImageService.getSignedImageUrl` (normalizes failure to `null`, never throws) → `useSlideImageUrl(imageRef?)` (returns `{ url, isLoading }`, `url` `null` when absent/failed). `SlideImage` renders the image with its `alt`; renders nothing when there is no `url`.

## Done criteria
- [ ] Scenarios {s7, s8} covered — present image renders scaled; absent image renders text-only (nothing)
- [ ] Signed-URL failure resolves to `null` (degrade), never a thrown error surfaced to the UI (full degrade behavior asserted in task-10 / s9)
- [ ] Layering respected; hook returns url|null and never throws
- [ ] `*.dao.test.ts`, `*.service.test.ts`, `use-slide-image-url.test.ts`, `slide-image.test.tsx`; story covers with-image + no-image
- [ ] Image scales to fit (no hardcoded pixel dimensions beyond ref aspect); `pnpm lint` + `check-types` + `test` green

## Notes
- `SlideImageRef` carries `width`/`height` for aspect ratio; scale to viewport width, keep ratio.
- Signed-URL expiry is an implementation detail — pick a short TTL (e.g. minutes); no caching layer required for R4.
