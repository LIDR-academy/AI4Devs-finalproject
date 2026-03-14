# GenerationApi

All URIs are relative to *http://localhost:8080/api/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**generateMeditationContent**](GenerationApi.md#generatemeditationcontent) | **POST** /generation/meditations | Generate meditation content with narration |
| [**getMeditationStatus**](GenerationApi.md#getmeditationstatus) | **GET** /generation/meditations/{meditationId} | Get meditation generation status |



## generateMeditationContent

> GenerationResponse generateMeditationContent(generateMeditationRequest)

Generate meditation content with narration

Generate professional meditation content with: - High-quality narration from text (Google Cloud TTS) - Synchronized subtitles (SRT format) - Video output (if image provided): narration + music + image + burned subtitles - Audio output (if no image): narration + music, subtitles for future use  Processing time validation: - Estimates processing time before generation - Rejects requests exceeding 187s timeout with 408 error  Idempotency: - Same (userId, text, musicRef, imageRef) → same meditationId - Uses SHA-256 hash for deduplication  Storage: - S3 keys: &#x60;generation/{userId}/{meditationId}/(video.mp4|audio.mp3|subs.srt)&#x60; - Response includes presigned URLs (TTL configurable)  Maps to BDD scenarios: - Scenario 1: \&quot;Generate narrated video with synchronized subtitles\&quot; - Scenario 2: \&quot;Generate narrated podcast\&quot; - Scenario 3: \&quot;Processing time exceeded\&quot; 

### Example

```ts
import {
  Configuration,
  GenerationApi,
} from '@meditation-builder/generation-client';
import type { GenerateMeditationContentRequest } from '@meditation-builder/generation-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/generation-client SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GenerationApi(config);

  const body = {
    // GenerateMeditationRequest
    generateMeditationRequest: {"text":"Close your eyes and breathe deeply. Feel the air filling your lungs...","musicReference":"calm-ocean-waves","imageReference":"peaceful-landscape-001"},
  } satisfies GenerateMeditationContentRequest;

  try {
    const data = await api.generateMeditationContent(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **generateMeditationRequest** | [GenerateMeditationRequest](GenerateMeditationRequest.md) |  | |

### Return type

[**GenerationResponse**](GenerationResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Meditation content generated successfully |  -  |
| **400** | Invalid request parameters or validation error |  -  |
| **408** | Processing time exceeded (text too long) |  -  |
| **503** | External service temporarily unavailable (TTS, rendering, storage) |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getMeditationStatus

> GenerationResponse getMeditationStatus(meditationId)

Get meditation generation status

Poll generation status and retrieve download URLs when complete. Used for async generation workflow. 

### Example

```ts
import {
  Configuration,
  GenerationApi,
} from '@meditation-builder/generation-client';
import type { GetMeditationStatusRequest } from '@meditation-builder/generation-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/generation-client SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GenerationApi(config);

  const body = {
    // string | Meditation ID returned from POST request
    meditationId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetMeditationStatusRequest;

  try {
    const data = await api.getMeditationStatus(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **meditationId** | `string` | Meditation ID returned from POST request | [Defaults to `undefined`] |

### Return type

[**GenerationResponse**](GenerationResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Generation status retrieved |  -  |
| **404** | Meditation not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

