
# GoogleAuthRequest


## Properties

Name | Type
------------ | -------------
`idToken` | string

## Example

```typescript
import type { GoogleAuthRequest } from '@meditation-builder/identity-client'

// TODO: Update the object below with actual values
const example = {
  "idToken": eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ...,
} satisfies GoogleAuthRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GoogleAuthRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


