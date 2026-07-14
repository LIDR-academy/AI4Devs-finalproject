// Groq model IDs, tunable in one place behind the @ai-sdk/groq seam (spec.md Open decision #2)
// so a swap needs no rework elsewhere. Confirm both against Groq's current model list at build
// time -- these are the IDs known at spec time, not hardcoded from an unverifiable memory.
//
// TEXT_MODEL_ID -- slide-text generation, composition enforcement, and metadata/position-driven
// image attachment (task-4, this Slice). VISION_MODEL_ID -- the raw-image placement fallback,
// invoked only for images metadata can't place (task-12, Slice 2); defined here now so both
// model IDs live behind the same single seam from the start.
export const TEXT_MODEL_ID = 'llama-3.1-8b-instant'; // 'llama-3.3-70b-versatile';
export const VISION_MODEL_ID = 'meta-llama/llama-4-scout-17b-16e-instruct';
