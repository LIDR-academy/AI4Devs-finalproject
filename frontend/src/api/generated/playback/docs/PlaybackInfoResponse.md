
# PlaybackInfoResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`title` | string
`state` | string
`stateLabel` | string
`createdAt` | Date
`mediaUrls` | [MediaUrls](MediaUrls.md)

## Example

```typescript
import type { PlaybackInfoResponse } from '@meditation-builder/playback-client'

// TODO: Update the object below with actual values
const example = {
  "id": 550e8400-e29b-41d4-a716-446655440000,
  "title": Evening Relaxation,
  "state": COMPLETED,
  "stateLabel": Completada,
  "createdAt": 2026-02-16T10:30Z,
  "mediaUrls": null,
} satisfies PlaybackInfoResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PlaybackInfoResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


