
# GenerationStatus

Generation status: - PROCESSING: Generation in progress - COMPLETED: Successfully generated and stored - FAILED: Generation failed (TTS/rendering/storage error) - TIMEOUT: Processing time exceeded (>187s) 

## Properties

Name | Type
------------ | -------------

## Example

```typescript
import type { GenerationStatus } from '@meditation-builder/generation-client'

// TODO: Update the object below with actual values
const example = {
} satisfies GenerationStatus

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GenerationStatus
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


