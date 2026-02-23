# PlaybackApi

All URIs are relative to *http://localhost:8080/api/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getPlaybackInfo**](PlaybackApi.md#getplaybackinfo) | **GET** /playback/meditations/{meditationId} | Get playback information for a meditation |
| [**listUserMeditations**](PlaybackApi.md#listusermeditations) | **GET** /playback/meditations | List user meditations with processing states |



## getPlaybackInfo

> PlaybackInfoResponse getPlaybackInfo(meditationId)

Get playback information for a meditation

Retrieve detailed playback information for a specific meditation.  Returns: - Meditation details (id, title, state, creation date) - Media URLs for playback (audio, video, subtitles)  Validation: - Meditation must exist and belong to the authenticated user (404 if not) - Meditation must be in COMPLETED state (409 if not playable)  Use Cases: - User clicks \&quot;Play\&quot; button on a completed meditation - Frontend needs media URLs to initialize player  Maps to BDD Scenario 2: \&quot;Reproducir una meditación completada\&quot; 

### Example

```ts
import {
  Configuration,
  PlaybackApi,
} from '@meditation-builder/playback-client';
import type { GetPlaybackInfoRequest } from '@meditation-builder/playback-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/playback-client SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PlaybackApi(config);

  const body = {
    // string | UUID of the meditation to play
    meditationId: 550e8400-e29b-41d4-a716-446655440000,
  } satisfies GetPlaybackInfoRequest;

  try {
    const data = await api.getPlaybackInfo(body);
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
| **meditationId** | `string` | UUID of the meditation to play | [Defaults to `undefined`] |

### Return type

[**PlaybackInfoResponse**](PlaybackInfoResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Playback information retrieved successfully |  -  |
| **401** | User not authenticated |  -  |
| **404** | Meditation not found or does not belong to the authenticated user |  -  |
| **409** | Meditation is not in COMPLETED state and cannot be played |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listUserMeditations

> MeditationListResponse listUserMeditations()

List user meditations with processing states

Retrieve all meditations created by the authenticated user.  Returns: - All meditations regardless of state (PENDING, PROCESSING, COMPLETED, FAILED) - Ordered by creation date (most recent first) - Includes current processing state for each meditation - Includes media URLs (for COMPLETED meditations)  State Labels: - PENDING → \&quot;En cola\&quot; - PROCESSING → \&quot;Generando\&quot; - COMPLETED → \&quot;Completada\&quot; - FAILED → \&quot;Fallida\&quot;  Business Rules: - Only meditations belonging to the authenticated user are returned - No pagination in v1 (all meditations returned) - Empty list if user has no meditations  Maps to BDD Scenario 1: \&quot;Listar las meditaciones del usuario con su estado\&quot; 

### Example

```ts
import {
  Configuration,
  PlaybackApi,
} from '@meditation-builder/playback-client';
import type { ListUserMeditationsRequest } from '@meditation-builder/playback-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/playback-client SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PlaybackApi(config);

  try {
    const data = await api.listUserMeditations();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**MeditationListResponse**](MeditationListResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of meditations retrieved successfully |  -  |
| **401** | User not authenticated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

