
# GenerationResponse


## Properties

Name | Type
------------ | -------------
`meditationId` | string
`type` | [MediaType](MediaType.md)
`mediaUrl` | string
`subtitleUrl` | string
`durationSeconds` | number
`status` | [GenerationStatus](GenerationStatus.md)
`message` | string

## Example

```typescript
import type { GenerationResponse } from '@meditation-builder/generation-client'

// TODO: Update the object below with actual values
const example = {
  "meditationId": 550e8400-e29b-41d4-a716-446655440123,
  "type": null,
  "mediaUrl": https://meditation-outputs.s3.amazonaws.com/generation/user-123/550e8400-e29b-41d4-a716-446655440123/video.mp4?X-Amz-Algo...,
  "subtitleUrl": https://meditation-outputs.s3.amazonaws.com/generation/user-123/550e8400-e29b-41d4-a716-446655440123/subs.srt?X-Amz-Algo...,
  "durationSeconds": 180,
  "status": null,
  "message": Generation completed successfully,
} satisfies GenerationResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GenerationResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


