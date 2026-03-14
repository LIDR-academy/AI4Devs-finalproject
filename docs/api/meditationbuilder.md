# Meditation Builder API

API for composing meditation content, managing manual entry, and AI-powered text/image generation.

**Bounded Context**: `meditationbuilder` (US2)

## Endpoints

### 1. Create Composition
Initialize a new meditation composition.

*   **URL**: `/api/v1/compositions`
*   **Method**: `POST`
*   **Auth Required**: Yes (Bearer Token)
*   **Request Body**:
    ```json
    {
      "text": "Meditation script content",
      "musicId": "Optional music track ID",
      "imageId": "Optional background image ID"
    }
    ```
*   **Success Response (201 Created)**:
    ```json
    {
      "compositionId": "uuid",
      "text": "Meditation script text",
      "musicId": "string",
      "imageId": "string"
    }
    ```

---

### 2. AI Text Generation/Enhancement
Unified endpoint for generating new meditation scripts or enhancing existing text using OpenAI.

*   **URL**: `/api/v1/compositions/text/generate`
*   **Method**: `POST`
*   **Auth Required**: Yes (Bearer Token)
*   **Request Body**:
    ```json
    {
      "prompt": "Theme or keywords for the meditation",
      "existingText": "Optional current script to improve",
      "tone": "Optional (calm, energetic, etc.)"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "text": "Generated meditation script"
    }
    ```

---

### 3. AI Image Generation
Generate a background image based on the meditation theme.

*   **URL**: `/api/v1/compositions/image/generate`
*   **Method**: `POST`
*   **Auth Required**: Yes (Bearer Token)
*   **Request Body**:
    ```json
    {
      "theme": "Description for the background image"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "imageUrl": "URL of the generated image"
    }
    ```
