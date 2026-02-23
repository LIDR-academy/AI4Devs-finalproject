# PreviewApi

All URIs are relative to *http://localhost:8080/api/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**previewImage**](PreviewApi.md#previewimage) | **GET** /compositions/{compositionId}/preview/image | Preview selected image |
| [**previewMusic**](PreviewApi.md#previewmusic) | **GET** /compositions/{compositionId}/preview/music | Preview selected music |



## previewImage

> ImagePreviewResponse previewImage(compositionId)

Preview selected image

Capability 8: Preview Image. Returns image preview URL for display. Maps to Scenario 8: \&quot;Preview image\&quot; 

### Example

```ts
import {
  Configuration,
  PreviewApi,
} from '@meditation-builder/composition-client';
import type { PreviewImageRequest } from '@meditation-builder/composition-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/composition-client SDK...");
  const api = new PreviewApi();

  const body = {
    // string | Unique identifier for the meditation composition
    compositionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies PreviewImageRequest;

  try {
    const data = await api.previewImage(body);
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
| **compositionId** | `string` | Unique identifier for the meditation composition | [Defaults to `undefined`] |

### Return type

[**ImagePreviewResponse**](ImagePreviewResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Image preview URL returned |  -  |
| **400** | No image selected |  -  |
| **404** | Composition not found |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## previewMusic

> MusicPreviewResponse previewMusic(compositionId)

Preview selected music

Capability 7: Preview Selected Music. Returns music preview URL for audio playback. Maps to Scenario 7: \&quot;Preview music\&quot; 

### Example

```ts
import {
  Configuration,
  PreviewApi,
} from '@meditation-builder/composition-client';
import type { PreviewMusicRequest } from '@meditation-builder/composition-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/composition-client SDK...");
  const api = new PreviewApi();

  const body = {
    // string | Unique identifier for the meditation composition
    compositionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies PreviewMusicRequest;

  try {
    const data = await api.previewMusic(body);
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
| **compositionId** | `string` | Unique identifier for the meditation composition | [Defaults to `undefined`] |

### Return type

[**MusicPreviewResponse**](MusicPreviewResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Music preview URL returned |  -  |
| **400** | No music selected |  -  |
| **404** | Composition not found |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

