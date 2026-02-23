
# MediaUrls

URLs to access generated multimedia content

## Properties

Name | Type
------------ | -------------
`audioUrl` | string
`videoUrl` | string
`subtitlesUrl` | string

## Example

```typescript
import type { MediaUrls } from '@meditation-builder/playback-client'

// TODO: Update the object below with actual values
const example = {
  "audioUrl": https://meditation-outputs.s3.amazonaws.com/generation/user-123/audio.mp3?X-Amz-Algorithm=...,
  "videoUrl": https://meditation-outputs.s3.amazonaws.com/generation/user-123/video.mp4?X-Amz-Algorithm=...,
  "subtitlesUrl": https://meditation-outputs.s3.amazonaws.com/generation/user-123/subs.srt?X-Amz-Algorithm=...,
} satisfies MediaUrls

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MediaUrls
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


