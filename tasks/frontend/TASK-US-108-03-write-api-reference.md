# TASK-US-108-03: Write API Reference

Document all backend API endpoints with request/response formats, authentication requirements, status codes, and error codes.

[Trello Card](https://trello.com/c/Aom5AE2Z)

## Parent User Story
[US-108: Documentation Pages](../../user-stories/frontend/US-108-documentation-pages.md)

## Description
Create MDX pages under `src/app/docs/api-reference/` that document every public backend endpoint grouped by resource: **User** (registration, login, logout, profile), **Files** (upload, retrieve, list, delete, bulk-delete, pin), and **Auth** (API key). Each endpoint entry must include the HTTP method, path, required headers, request body schema, example responses, and all possible error codes.

## Priority
High

## Estimated Time
 2 hours

## Detailed Steps
1. Create `src/app/docs/api-reference/page.mdx` as the index listing all resource groups.
2. Create `src/app/docs/api-reference/users/page.mdx` — document registration (`POST /register`), login (`POST /login`), logout (`POST /logout`), and profile (`GET /me`).
3. Create `src/app/docs/api-reference/files/page.mdx` — document upload (`POST /upload`), retrieve (`GET /retrieve/<cid>`), list (`GET /files`), delete (`DELETE /files/<cid>`), bulk-delete (`POST /files/delete/bulk`), and pin management.
4. Create `src/app/docs/api-reference/auth/page.mdx` — document API key header (`X-API-Key`) usage and best practices.
5. Build a reusable `<EndpointBlock>` MDX component:  method badge, path, description, parameter table, request/response JSON blocks.
6. Add a dedicated **Error Codes** sub-section listing standard HTTP codes returned by the API (400, 401, 403, 404, 409, 422, 429, 500).
7. Register all new pages in the sidebar navigation.

## Acceptance Criteria
- [ ] All resource groups render at their respective `/docs/api-reference/*` routes.
- [ ] Every endpoint entry shows method, path, headers, body schema, and example response.
- [ ] Error codes section is present and accurate.
- [ ] `<EndpointBlock>` component works for both GET and POST endpoints.
- [ ] All links in the sidebar correctly navigate to the API reference pages.

## Notes
- Verify endpoint paths and payload shapes against `backend/core/` routes before writing.
- Authentication guide (API key header) should cross-link to the Getting Started section.
- Keep response examples as minimal realistic JSON, not full application objects.

## Completion Status
- [x] 100% - Completed

[PR #24](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/24)

### Implementation Notes
- Created `src/app/docs/api-reference/page.tsx`
- All endpoints documented: 4 Users, 7 Files, 1 Tasks
- Reusable `<Endpoint>` server component with method badge, path, auth indicator, params table, request/response CodeBlocks
- Error codes table: 400, 401, 403, 404, 409, 422, 429, 500
