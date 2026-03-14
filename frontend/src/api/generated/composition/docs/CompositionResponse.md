
# CompositionResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`textContent` | string
`musicReference` | string
`imageReference` | string
`outputType` | [OutputType](OutputType.md)
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { CompositionResponse } from '@meditation-builder/composition-client'

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "textContent": null,
  "musicReference": null,
  "imageReference": null,
  "outputType": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies CompositionResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CompositionResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


