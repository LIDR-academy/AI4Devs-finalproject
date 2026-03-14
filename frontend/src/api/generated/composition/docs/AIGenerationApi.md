# AIGenerationApi

All URIs are relative to *http://localhost:8080/api/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**generateImageGlobal**](AIGenerationApi.md#generateimageglobal) | **POST** /compositions/image/generate | Generate AI image for meditation (global, no composition required) |
| [**generateTextGlobal**](AIGenerationApi.md#generatetextglobal) | **POST** /compositions/text/generate | Generate or enhance meditation text with AI (global, no composition required) |



## generateImageGlobal

> ImageReferenceResponse generateImageGlobal(body)

Generate AI image for meditation (global, no composition required)

Capability 4: AI Image Generation. Generates an AI image from the provided text prompt. Unified global endpoint (no composition required). Maps to Scenario 4: \&quot;Generate AI image\&quot; 

### Example

```ts
import {
  Configuration,
  AIGenerationApi,
} from '@meditation-builder/composition-client';
import type { GenerateImageGlobalRequest } from '@meditation-builder/composition-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/composition-client SDK...");
  const api = new AIGenerationApi();

  const body = {
    // string
    body: body_example,
  } satisfies GenerateImageGlobalRequest;

  try {
    const data = await api.generateImageGlobal(body);
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
| **body** | `string` |  | |

### Return type

[**ImageReferenceResponse**](ImageReferenceResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `text/plain`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Image generated successfully |  -  |
| **400** | Invalid request parameters or validation error |  -  |
| **429** | AI service rate limit exceeded |  -  |
| **503** | AI service temporarily unavailable |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## generateTextGlobal

> TextContentResponse generateTextGlobal(generateTextRequest)

Generate or enhance meditation text with AI (global, no composition required)

Capability 3: AI Text Generation/Enhancement. Works with empty field, keywords, or existing content. Unified endpoint for both \&quot;from scratch\&quot; and \&quot;enhancement\&quot;. No composition required. Maps to Scenario 3: \&quot;AI text generation and enhancement\&quot; 

### Example

```ts
import {
  Configuration,
  AIGenerationApi,
} from '@meditation-builder/composition-client';
import type { GenerateTextGlobalRequest } from '@meditation-builder/composition-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/composition-client SDK...");
  const api = new AIGenerationApi();

  const body = {
    // GenerateTextRequest (optional)
    generateTextRequest: ...,
  } satisfies GenerateTextGlobalRequest;

  try {
    const data = await api.generateTextGlobal(body);
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
| **generateTextRequest** | [GenerateTextRequest](GenerateTextRequest.md) |  | [Optional] |

### Return type

[**TextContentResponse**](TextContentResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Text generated/enhanced successfully |  -  |
| **400** | Invalid request parameters or validation error |  -  |
| **429** | AI service rate limit exceeded |  -  |
| **503** | AI service temporarily unavailable |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

