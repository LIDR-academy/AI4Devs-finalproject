# Git Workflow & Version Control

## Governance
*   **Model:** Git Flow
*   **Branches:**
    *   `main`: Production-ready code.
    *   `develop`: Integration branch for features.
    *   `feature/*`: Individual feature development (e.g., `feature/us-001-auth`).
    *   `hotfix/*`: Quick fixes for production.
*   **Language:** English
*   **Format:** Descriptive naming.

## Commit Messages
*   **Language:** English
*   **Structure:** Descriptive and concise.
*   **Convention:** `<type>: <description>` (e.g., `feat: implement user login`, `fix: resolve s3 upload error`).

## Pull Requests
*   Description must include "User Story" reference if applicable.
*   Squash and merge strategy preferred for feature branches into develop.
