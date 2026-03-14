# IdentityApi

All URIs are relative to *http://localhost:8080/api/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**authenticateWithGoogle**](IdentityApi.md#authenticatewithgoogle) | **POST** /identity/auth/google | Authenticate with Google credential and obtain session token |
| [**logout**](IdentityApi.md#logout) | **POST** /identity/auth/logout | Invalidate the active session |



## authenticateWithGoogle

> AuthResponse authenticateWithGoogle(googleAuthRequest)

Authenticate with Google credential and obtain session token

Validates the Google &#x60;id_token&#x60; received from the frontend and: - **First access** (C1): creates a &#x60;PerfilDeUsuario&#x60; with a new UUID and returns the session token + profile data. - **Subsequent access** (C2): recovers the existing &#x60;PerfilDeUsuario&#x60; and returns a fresh session token + profile data.  The returned &#x60;sessionToken&#x60; is a signed JWT issued by this backend (not a Google token). It must be sent as &#x60;Authorization: Bearer &lt;sessionToken&gt;&#x60; in all subsequent requests.  Maps to BDD scenarios: - \&quot;Primer acceso de un usuario nuevo con su cuenta de Gmail\&quot; - \&quot;Acceso recurrente de un usuario ya registrado\&quot; 

### Example

```ts
import {
  Configuration,
  IdentityApi,
} from '@meditation-builder/identity-client';
import type { AuthenticateWithGoogleRequest } from '@meditation-builder/identity-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/identity-client SDK...");
  const api = new IdentityApi();

  const body = {
    // GoogleAuthRequest
    googleAuthRequest: {"idToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."},
  } satisfies AuthenticateWithGoogleRequest;

  try {
    const data = await api.authenticateWithGoogle(body);
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
| **googleAuthRequest** | [GoogleAuthRequest](GoogleAuthRequest.md) |  | |

### Return type

[**AuthResponse**](AuthResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Authentication successful. Returns own session token and user profile. |  -  |
| **400** | Missing or malformed request body. |  -  |
| **401** | Google id_token is invalid or expired. |  -  |
| **500** | Internal server error during authentication. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## logout

> logout()

Invalidate the active session

Invalidates the current session. After this call, the &#x60;sessionToken&#x60; sent in the Authorization header is no longer accepted by the security filter.  Maps to BDD scenario: - \&quot;Cierre de sesion\&quot; 

### Example

```ts
import {
  Configuration,
  IdentityApi,
} from '@meditation-builder/identity-client';
import type { LogoutRequest } from '@meditation-builder/identity-client';

async function example() {
  console.log("🚀 Testing @meditation-builder/identity-client SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new IdentityApi(config);

  try {
    const data = await api.logout();
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Session invalidated successfully. No content returned. |  -  |
| **401** | No valid session token provided. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

