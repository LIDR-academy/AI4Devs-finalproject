// Groq model IDs, tunable in one place behind the @ai-sdk/groq seam (spec.md Open decision #2)
// so a swap needs no rework elsewhere. Confirm both against Groq's current structured-outputs
// list (https://console.groq.com/docs/structured-outputs) — `generateObject` requires
// `json_schema` support (llama-3.1-8b-instant / llama-3.3-70b-versatile no longer do).
//
// TEXT_MODEL_ID -- slide-text generation, composition enforcement, and metadata/position-driven
// image attachment. VISION_MODEL_ID -- raw-image placement fallback for images metadata can't
// place (task-12); both live behind this seam.
export const TEXT_MODEL_ID = 'openai/gpt-oss-20b';
export const VISION_MODEL_ID = 'meta-llama/llama-4-scout-17b-16e-instruct';
