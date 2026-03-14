
# AuthResponse


## Properties

Name | Type
------------ | -------------
`sessionToken` | string
`userId` | string
`nombre` | string
`correo` | string
`urlFoto` | string

## Example

```typescript
import type { AuthResponse } from '@meditation-builder/identity-client'

// TODO: Update the object below with actual values
const example = {
  "sessionToken": eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1NTBlO...,
  "userId": 550e8400-e29b-41d4-a716-446655440001,
  "nombre": Ana García,
  "correo": ana@gmail.com,
  "urlFoto": https://lh3.googleusercontent.com/a/AAcHTtdA...,
} satisfies AuthResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AuthResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


