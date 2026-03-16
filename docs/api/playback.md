# Playback API Documentation

This Bounded Context handles the listing and playback of generated meditations for authenticated users.

## Base URL
`/api/v1/playback`

## Authentication
All endpoints require a valid JWT token. The `userId` is extracted from the security context.

## Endpoints

### 1. List User Meditations
Retrieves a list of all meditations belonging to the authenticated user, ordered by creation date (most recent first).

*   **URL:** `/meditations`
*   **Method:** `GET`
*   **Response (200 OK):**
    ```json
    {
      "meditations": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "title": "Morning Mindfulness",
          "state": "COMPLETED",
          "stateLabel": "Completada",
          "createdAt": "2026-02-16T10:30:00Z"
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "title": "Relaxation",
          "state": "PROCESSING",
          "stateLabel": "Generando",
          "createdAt": "2026-02-16T11:00:00Z"
        }
      ]
    }
    ```

### 2. Get Playback Info
Retrieves specific media URLs (audio, video, subtitles) for a completed meditation.

*   **URL:** `/meditations/{id}/playback`
*   **Method:** `GET`
*   **URL Parameters:** `id` (UUID of the meditation)
*   **Response (200 OK):**
    ```json
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Morning Mindfulness",
      "state": "COMPLETED",
      "stateLabel": "Completada",
      "createdAt": "2026-02-16T10:30:00Z",
      "mediaUrls": {
        "audioUrl": "https://s3.amazonaws.com/bucket/audio.mp3",
        "videoUrl": null,
        "subtitlesUrl": "https://s3.amazonaws.com/bucket/subs.srt"
      }
    }
    ```
*   **Error Responses:**
    *   **404 Not Found:** If the meditation ID does not exist or does not belong to the user.
    *   **409 Conflict:** If the meditation is not in the `COMPLETED` state.
        ```json
        {
          "message": "La meditación no está lista para reproducir. Estado actual: PROCESSING"
        }
        ```

## State Labels
The API provides localized labels in Spanish for each state:
- `PENDING` -> "En cola"
- `PROCESSING` -> "Generando"
- `COMPLETED` -> "Completada"
- `FAILED` -> "Fallida"
