
# MediaType

Output media type determined by image presence: - VIDEO: Image provided (narration + music + image + subtitles) - AUDIO: No image (narration + music, subtitles for future use) 

## Properties

Name | Type
------------ | -------------

## Example

```typescript
import type { MediaType } from '@meditation-builder/generation-client'

// TODO: Update the object below with actual values
const example = {
} satisfies MediaType

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MediaType
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


