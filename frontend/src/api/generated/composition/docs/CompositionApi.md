# CompositionApi

All URIs are relative to *http://localhost:8080/api/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createComposition**](CompositionApi.md#createcompositionoperation) | **POST** /compositions | Create new meditation composition |
| [**getComposition**](CompositionApi.md#getcomposition) | **GET** /compositions/{compositionId} | Get composition details |
| [**getOutputType**](CompositionApi.md#getoutputtype) | **GET** /compositions/{compositionId}/output-type | Get output type determination |
| [**removeImage**](CompositionApi.md#removeimage) | **DELETE** /compositions/{compositionId}/image | Remove image from composition |
| [**selectMusic**](CompositionApi.md#selectmusicoperation) | **PUT** /compositions/{compositionId}/music | Select music for composition |
| [**setImage**](CompositionApi.md#setimageoperation) | **PUT** /compositions/{compositionId}/image | Set image for composition |



## createComposition

> CompositionResponse createComposition(createCompositionRequest)

Create new meditation composition

Capability 1: Access Meditation Builder and initialize composition. Creates an empty composition with mandatory text field. Maps to Scenario 1: \&quot;Access Meditation Builder and see text field\&quot; 

### Example

```ts
import {
  Configuration,
  CompositionApi,
} from '@meditation-builder/composition-client';
import type { CreateCompositionOperationRequest } from '@meditation-builder/composition-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/composition-client SDK...");
  const api = new CompositionApi();

  const body = {
    // CreateCompositionRequest
    createCompositionRequest: ...,
  } satisfies CreateCompositionOperationRequest;

  try {
    const data = await api.createComposition(body);
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
| **createCompositionRequest** | [CreateCompositionRequest](CreateCompositionRequest.md) |  | |

### Return type

[**CompositionResponse**](CompositionResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Composition created successfully |  -  |
| **400** | Invalid request parameters or validation error |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getComposition

> CompositionResponse getComposition(compositionId)

Get composition details

Retrieve full composition state

### Example

```ts
import {
  Configuration,
  CompositionApi,
} from '@meditation-builder/composition-client';
import type { GetCompositionRequest } from '@meditation-builder/composition-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/composition-client SDK...");
  const api = new CompositionApi();

  const body = {
    // string | Unique identifier for the meditation composition
    compositionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetCompositionRequest;

  try {
    const data = await api.getComposition(body);
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

[**CompositionResponse**](CompositionResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Composition retrieved successfully |  -  |
| **404** | Composition not found |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getOutputType

> OutputTypeResponse getOutputType(compositionId)

Get output type determination

Capabilities 5 &amp; 6: Determine Output Type. Returns PODCAST when no image selected. Returns VIDEO when image selected (manual or AI). Maps to: - Scenario 5: \&quot;Output type podcast without image\&quot; - Scenario 6: \&quot;Output type video with image\&quot; 

### Example

```ts
import {
  Configuration,
  CompositionApi,
} from '@meditation-builder/composition-client';
import type { GetOutputTypeRequest } from '@meditation-builder/composition-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/composition-client SDK...");
  const api = new CompositionApi();

  const body = {
    // string | Unique identifier for the meditation composition
    compositionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetOutputTypeRequest;

  try {
    const data = await api.getOutputType(body);
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

[**OutputTypeResponse**](OutputTypeResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Output type determined successfully |  -  |
| **404** | Composition not found |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeImage

> CompositionResponse removeImage(compositionId)

Remove image from composition

Remove selected image. Triggers output type change to PODCAST. 

### Example

```ts
import {
  Configuration,
  CompositionApi,
} from '@meditation-builder/composition-client';
import type { RemoveImageRequest } from '@meditation-builder/composition-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/composition-client SDK...");
  const api = new CompositionApi();

  const body = {
    // string | Unique identifier for the meditation composition
    compositionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies RemoveImageRequest;

  try {
    const data = await api.removeImage(body);
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

[**CompositionResponse**](CompositionResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Image removed successfully |  -  |
| **404** | Composition not found |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## selectMusic

> CompositionResponse selectMusic(compositionId, selectMusicRequest)

Select music for composition

Select background music from media catalog. Used in output type determination. 

### Example

```ts
import {
  Configuration,
  CompositionApi,
} from '@meditation-builder/composition-client';
import type { SelectMusicOperationRequest } from '@meditation-builder/composition-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/composition-client SDK...");
  const api = new CompositionApi();

  const body = {
    // string | Unique identifier for the meditation composition
    compositionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // SelectMusicRequest
    selectMusicRequest: ...,
  } satisfies SelectMusicOperationRequest;

  try {
    const data = await api.selectMusic(body);
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
| **selectMusicRequest** | [SelectMusicRequest](SelectMusicRequest.md) |  | |

### Return type

[**CompositionResponse**](CompositionResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Music selected successfully |  -  |
| **400** | Invalid request parameters or validation error |  -  |
| **404** | Composition not found |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setImage

> CompositionResponse setImage(compositionId, setImageRequest)

Set image for composition

Set manual or AI-generated image. Triggers output type change to VIDEO. 

### Example

```ts
import {
  Configuration,
  CompositionApi,
} from '@meditation-builder/composition-client';
import type { SetImageOperationRequest } from '@meditation-builder/composition-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/composition-client SDK...");
  const api = new CompositionApi();

  const body = {
    // string | Unique identifier for the meditation composition
    compositionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // SetImageRequest
    setImageRequest: ...,
  } satisfies SetImageOperationRequest;

  try {
    const data = await api.setImage(body);
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
| **setImageRequest** | [SetImageRequest](SetImageRequest.md) |  | |

### Return type

[**CompositionResponse**](CompositionResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Image set successfully |  -  |
| **400** | Invalid request parameters or validation error |  -  |
| **404** | Composition not found |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

