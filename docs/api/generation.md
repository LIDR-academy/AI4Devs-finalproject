# Meditation Generation API

API for generating meditation content including professional narration (TTS), rendering (FFmpeg), and storage.

**Bounded Context**: `meditation.generation` (US3)

## Endpoints

### 1. Trigger Media Generation
Transform composed text + music (+ optional image) into narrated video or audio with synchronized subtitles.

*   **URL**: `/api/v1/generation/meditations`
*   **Method**: `POST`
*   **Auth Required**: Yes (Bearer Token)
*   **Request Body**:
    ```json
    {
      "text": "The meditation script",
      "musicReference": "Background music ID/name",
      "imageReference": "Background image ID/name (Optional for video output)"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "meditationId": "uuid",
      "type": "VIDEO or AUDIO",
      "mediaUrl": "S3 URL (Presigned) of the generated content",
      "subtitleUrl": "S3 URL (Presigned) of the subtitles (SRT)"
    }
    ```
*   **Common Errors**:
    *   **401 Unauthorized**: No session.
    *   **408 Request Timeout**: Generated content duration exceeds the 187s limit.
    *   **500 Internal Server Error**: Downstream service failure (Google TTS, FFmpeg).

---

## Technical Details

### Storage
*   **Media format**: MP4 (1280x720) for video, MP3 for audio.
*   **Subtitles**: SRT format synchronized with the narration.
*   **S3 Keys**: `generation/{userId}/{meditationId}/(video.mp4|audio.mp3|subs.srt)`
