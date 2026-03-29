# Architecture & API

## Architecture Pattern
**Monorepo with Role Deployment.**
*   **API Service:** Handles HTTP requests, Authentication, and File Uploads (Temporary).
*   **Worker Service:** Handles CPU-intensive tasks (PDF conversion, Image resizing) asynchronously via Redis Queues.

## Communication
*   **Sync:** REST API (Frontend <-> Backend).
*   **Async:** Redis Pub/Sub & BullMQ (Backend -> Worker).
*   **Real-time:** WebSockets/Socket.io (Backend -> Frontend) for status updates.

## API Definition
*   **Standard:** OpenAPI (Swagger).
*   **Definition:** Define interfaces and DTOs clearly.
*   **Implementation:** Ensure endpoints align with the OpenAPI spec.
