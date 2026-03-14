
# ErrorResponse


## Properties

Name | Type
------------ | -------------
`code` | string
`message` | string

## Example

```typescript
import type { ErrorResponse } from '@meditation-builder/identity-client'

// TODO: Update the object below with actual values
const example = {
  "code": INVALID_GOOGLE_TOKEN,
  "message": No ha sido posible iniciar sesion. Por favor, intentalo de nuevo.,
} satisfies ErrorResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ErrorResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


