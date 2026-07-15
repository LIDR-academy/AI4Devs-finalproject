# Sequence Diagram: Generate a Lesson (API Key + PDF Upload)

Audience: engineers, reviewers. End-to-end call flow for the PRD's "upload → generate"
path, including setup the C4 dynamic diagram omits (auth + BYO key). Complements
[c4-dynamic-core-loop.md](./c4-dynamic-core-loop.md) (same loop, C4Dynamic shape) and
[c4-containers.md](./c4-containers.md) (participants).

```mermaid
sequenceDiagram
  actor Learner
  participant App as Study Buddy App
  participant Auth as Supabase Auth
  participant ApiKeyFn as manage-api-key
  participant Vault as Vault
  participant DB as Postgres
  participant Storage as Supabase Storage
  participant ExtractFn as extract-pdf
  participant GenFn as generate-lesson
  participant Groq as Groq<br/>(Vercel AI SDK)

  %% --- Setup ---
  Learner->>App: Sign up / Log in
  App->>Auth: Authenticate
  Auth-->>App: Session (JWT)

  Learner->>App: Add AI API key
  App->>ApiKeyFn: Save key
  ApiKeyFn->>Vault: Store encrypted key
  ApiKeyFn->>DB: Insert user_ai_keys<br/>(secret_id ref)
  ApiKeyFn-->>App: Key saved
  App-->>Learner: Setup complete

  %% --- Upload & extract ---
  Learner->>App: Upload PDF
  App->>Storage: Upload to pdf-uploads/{user_id}/{document_id}
  App->>DB: Insert documents row<br/>(status: processing)
  App->>ExtractFn: extract-pdf(documentId)

  ExtractFn->>Storage: Read raw PDF
  ExtractFn->>ExtractFn: Extract text + images
  ExtractFn->>Storage: Write downscaled images<br/>(pdf-images)
  ExtractFn->>DB: Write pages + document_images;<br/>status: extracted (or failed)

  alt Extraction failed
    ExtractFn-->>App: Typed error
    App-->>Learner: Clear error message
  else Extraction OK
    ExtractFn-->>App: Success
    App-->>Learner: PDF ready
  end

  %% --- Generate lesson ---
  Learner->>App: Pick composition<br/>(instructional / activity / both)
  Learner->>App: Start generate lesson
  App->>GenFn: generate-lesson(documentId, composition)

  GenFn->>DB: Load pages/images;<br/>resolve key via secret_id
  GenFn->>Vault: Resolve encrypted key

  alt No API key
    GenFn-->>App: Error — add API key
    App-->>Learner: Guidance to add key
  else Key present
    GenFn->>Groq: generateObject (structured deck)
    Groq-->>GenFn: Slide deck
    GenFn->>DB: Insert lessons row<br/>(user_id = auth.uid())
    GenFn-->>App: { lessonId }
    App-->>Learner: Open lesson player
  end
```

## Notes

- **`manage-api-key` is a separate Edge Function** from generation — the key never returns to
  the client after save; `generate-lesson` resolves it server-side via Vault + `secret_id`.
- **Upload and extraction are two steps the app owns** — Storage write + `documents` insert,
  then `extract-pdf` invocation (same split as steps 1–8 in the dynamic diagram).
- **Composition choice happens after extraction**, before `generate-lesson` (R2.1).
- Provider is **Groq** via the Vercel AI SDK, matching [c4-context.md](./c4-context.md).
