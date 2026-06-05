# API Specification & Best Practices
- **RESTful Endpoints:** Use plural nouns for resource paths (e.g., `/api/users`).
- **HTTP Methods:** Use `GET` for retrieval, `POST` for creation, `PUT` for full updates, `PATCH` for partial updates, and `DELETE` for removal.
- **Status Codes:** Return `200 OK` for success, `201 Created` for POST creation, `400 Bad Request` for validation errors, `401 Unauthorized` for auth errors, and `500 Internal Server Error` for system crashes.
- **Validation:** Always validate request payloads before processing logic.
