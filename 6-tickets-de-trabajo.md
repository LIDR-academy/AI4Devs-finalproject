# 6. Tickets de Trabajo — Lexio

Los tres tickets documentados corresponden al **flujo E2E prioritario** del MVP y cubren las tres capas del stack: base de datos, backend y frontend. Cada uno está redactado con el nivel de detalle necesario para que un desarrollador pueda ejecutarlo de inicio a fin sin ambigüedad.

---

## Ticket 1 — Base de datos

### `DB-01` · Diseño e implementación de colecciones Firestore, índices y Security Rules

| Campo | Valor |
|-------|-------|
| **Tipo** | Base de datos |
| **Historia relacionada** | US-03 (LEX-7), US-08 (LEX-12), US-11 (LEX-15) |
| **Epic** | Epic 2 — Vocabulary Capture / Epic 3 — Daily Practice |
| **Prioridad** | P0 — Bloqueante para backend y frontend |
| **Estimación** | M |
| **Estado inicial** | To Do |
| **Asignado a** | Full-stack developer |

---

### Descripción

Crear y configurar la estructura de datos en **Cloud Firestore** necesaria para soportar el flujo E2E del MVP: colecciones de tarjetas de vocabulario (`wordCards`), sesiones diarias (`dailySessions`) y rachas (`streaks`). Incluye índices compuestos para las consultas críticas y Security Rules para garantizar privacidad por usuario.

Este ticket es **bloqueante** para los tickets de backend y frontend; debe completarse o ejecutarse en paralelo definiendo el contrato de datos antes de implementar los servicios.

---

### Tareas

#### 1. Definir y crear las colecciones

```
users/{userId}
wordCards/{wordCardId}
dailySessions/{sessionId}
streaks/{userId}
```

#### 2. Esquema de documentos

**`users/{userId}`**
```json
{
  "id": "string (= Firebase Auth uid)",
  "email": "string",
  "uiLanguage": "es | en",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**`wordCards/{wordCardId}`**
```json
{
  "id": "string",
  "userId": "string (ref users/{userId})",
  "term": "string (NOT NULL, max 500 chars)",
  "normalizedTerm": "string (trim + toLowerCase)",
  "definition": "string (NOT NULL)",
  "definitionLanguage": "es | en",
  "imageUrl": "string (URL Unsplash)",
  "unsplashPhotoId": "string | null",
  "status": "active | learned",
  "learnedAt": "timestamp | null",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**`dailySessions/{sessionId}`**
```json
{
  "id": "string",
  "userId": "string (ref users/{userId})",
  "sessionDate": "string (YYYY-MM-DD)",
  "totalExercises": 10,
  "correctAnswers": "number (0-10)",
  "completed": "boolean",
  "startedAt": "timestamp",
  "completedAt": "timestamp | null",
  "exercises": [
    {
      "id": "string",
      "wordCardId": "string",
      "type": "image_match | mcq",
      "question": "string | null",
      "imageUrl": "string | null",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "userAnswer": "string | null",
      "isCorrect": "boolean | null",
      "orderIndex": "number (0-9)"
    }
  ]
}
```

**`streaks/{userId}`** (document id = userId, relación 1:1)
```json
{
  "userId": "string",
  "currentStreak": "number (>= 0)",
  "lastCompletedDate": "string (YYYY-MM-DD) | null",
  "longestStreak": "number (>= 0)",
  "updatedAt": "timestamp"
}
```

#### 3. Índices compuestos en Firestore

Crear en `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "wordCards",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "normalizedTerm", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "wordCards",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "dailySessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "sessionDate", "order": "DESCENDING" }
      ]
    }
  ]
}
```

#### 4. Security Rules

Crear en `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: only the owner can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }

    // WordCards: only the owner can access their cards
    match /wordCards/{cardId} {
      allow read, update, delete: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // DailySessions: only the owner can access their sessions
    match /dailySessions/{sessionId} {
      allow read, update: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // Streaks: only the owner can access their streak (doc id = userId)
    match /streaks/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

#### 5. Desplegar a Firebase

```bash
# Desplegar solo reglas e índices (no funciones)
firebase deploy --only firestore:rules,firestore:indexes
```

#### 6. Seed de datos para desarrollo/testing

Crear script `backend/scripts/seedFirestore.ts` que inserte:
- 1 usuario de prueba
- 6 WordCards con datos completos (diferentes términos, status activo)
- 1 DailySession completada con 10 ejercicios
- 1 Streak con `currentStreak = 3`

---

### Criterios de aceptación del ticket

- [ ] Las 4 colecciones están creadas y accesibles en Firebase Console.
- [ ] Los índices compuestos están desplegados (estado `READY` en Firestore).
- [ ] Un usuario autenticado puede leer/escribir solo sus propios documentos.
- [ ] Un usuario autenticado **no puede** leer documentos de otro usuario (verificado manualmente o con test).
- [ ] El script de seed ejecuta sin errores y los datos son visibles en Firestore Console.
- [ ] `firestore.rules` y `firestore.indexes.json` están commiteados en el repositorio.

---

### Notas

- Los `exercises` se almacenan como **array embebido** en el documento `dailySessions` para evitar subcolecciones y permitir lectura atómica de la sesión completa.
- La unicidad `(userId, normalizedTerm)` se garantiza en la capa de aplicación (backend Express), no con una regla de Firestore.
- La unicidad `(userId, sessionDate)` también se valida en backend antes de escribir.

---

## Ticket 2 — Backend

### `BE-01` · Implementar endpoint POST /words — captura de vocabulario con IA e imágenes

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Historia relacionada** | US-03 (LEX-7) — Añadir nueva palabra con IA |
| **Epic** | Epic 2 — Vocabulary Capture (`LEX-2`) |
| **Prioridad** | P0 |
| **Estimación** | L |
| **Dependencias** | `DB-01` (colecciones Firestore creadas) |
| **Estado inicial** | To Do |
| **Asignado a** | Full-stack developer |

---

### Descripción

Implementar el endpoint `POST /words` en el backend Express (BFF). Este endpoint recibe el término introducido por el usuario, valida su unicidad, llama a **Claude** para generar la definición, llama a **Unsplash** para obtener imágenes sugeridas y persiste la tarjeta en Firestore. Es el endpoint más complejo del MVP por orquestar 3 servicios externos en una sola transacción lógica.

---

### Contexto técnico

- **Ruta:** `POST /words`
- **Auth:** Requiere `Authorization: Bearer <Firebase ID Token>` (middleware existente)
- **Capa:** `routes/words.ts` → `controllers/WordController.ts` → `services/WordService.ts` → `repositories/WordRepository.ts` + `integrations/claudeClient.ts` + `integrations/unsplashClient.ts`

---

### Contrato de la API

**Request body:**
```json
{
  "term": "serendipity",
  "definitionLanguage": "es"
}
```

**Response 201:**
```json
{
  "wordCard": {
    "id": "wc_001",
    "userId": "uid_123",
    "term": "serendipity",
    "normalizedTerm": "serendipity",
    "definition": "Hallazgo afortunado e inesperado de algo valioso.",
    "definitionLanguage": "es",
    "imageUrl": "",
    "status": "active",
    "createdAt": "2026-06-07T20:00:00.000Z",
    "updatedAt": "2026-06-07T20:00:00.000Z"
  },
  "suggestedImages": [
    {
      "photoId": "abc123",
      "url": "https://images.unsplash.com/photo-abc123",
      "thumbnailUrl": "https://images.unsplash.com/photo-abc123?w=200",
      "photographer": "Jane Doe"
    }
  ]
}
```

**Errores:**
```
400 VALIDATION_ERROR   — term vacío o definitionLanguage inválido
401 UNAUTHORIZED       — token ausente o inválido
409 DUPLICATE_TERM     — (userId, normalizedTerm) ya existe
500 INTERNAL_ERROR     — fallo en Claude, Unsplash o Firestore
```

---

### Tareas

#### 1. Crear la ruta y el controller

`backend/src/routes/words.ts`
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { WordController } from '../controllers/WordController';

const router = Router();
router.post('/', authMiddleware, WordController.create);
export default router;
```

`backend/src/controllers/WordController.ts`
```typescript
export class WordController {
  static async create(req: Request, res: Response) {
    const { term, definitionLanguage } = req.body;
    const userId = req.user.uid; // inyectado por authMiddleware

    // 1. Validar entrada
    if (!term || term.trim().length === 0) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'term is required' });
    }
    if (!['es', 'en'].includes(definitionLanguage)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'definitionLanguage must be es or en' });
    }

    // 2. Delegar a servicio
    const result = await WordService.createWord({ userId, term, definitionLanguage });
    return res.status(201).json(result);
  }
}
```

#### 2. Implementar WordService

`backend/src/services/WordService.ts`

Lógica paso a paso:

1. **Normalizar término:** `normalizedTerm = term.trim().toLowerCase()`
2. **Verificar unicidad:** consultar Firestore `wordCards` donde `userId == X AND normalizedTerm == Y` → si existe, lanzar `ConflictError('DUPLICATE_TERM')`
3. **Generar definición con Claude:**
   ```typescript
   const definition = await AIService.generateDefinition(term, definitionLanguage);
   ```
4. **Buscar imágenes en Unsplash:**
   ```typescript
   const images = await ImageService.searchImages(term, 5);
   ```
5. **Crear documento en Firestore:**
   ```typescript
   const wordCard = await WordRepository.create({
     userId, term, normalizedTerm, definition,
     definitionLanguage, imageUrl: '', status: 'active'
   });
   ```
6. **Retornar:** `{ wordCard, suggestedImages: images }`

#### 3. Implementar AIService (integración Claude)

`backend/src/integrations/claudeClient.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateDefinition(term: string, language: 'es' | 'en'): Promise<string> {
  const langInstruction = language === 'es'
    ? 'Responde SOLO con la definición en español.'
    : 'Respond ONLY with the definition in English.';

  const message = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Define the English word or phrase "${term}" in a clear, concise way (1-2 sentences). ${langInstruction} Do not include the word itself in the definition.`
    }]
  });

  return (message.content[0] as { text: string }).text.trim();
}
```

#### 4. Implementar ImageService (integración Unsplash)

`backend/src/integrations/unsplashClient.ts`

```typescript
export async function searchImages(term: string, count = 5) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=${count}`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }
  });
  const data = await res.json();
  return data.results.map((photo: UnsplashPhoto) => ({
    photoId: photo.id,
    url: photo.urls.regular,
    thumbnailUrl: photo.urls.thumb,
    photographer: photo.user.name
  }));
}
```

#### 5. Implementar WordRepository

`backend/src/repositories/WordRepository.ts`

```typescript
export class WordRepository {
  static async findByNormalizedTerm(userId: string, normalizedTerm: string) {
    const snapshot = await db.collection('wordCards')
      .where('userId', '==', userId)
      .where('normalizedTerm', '==', normalizedTerm)
      .limit(1)
      .get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  }

  static async create(data: CreateWordCardDto): Promise<WordCard> {
    const ref = db.collection('wordCards').doc();
    const now = new Date();
    const wordCard = { id: ref.id, ...data, createdAt: now, updatedAt: now };
    await ref.set(wordCard);
    return wordCard;
  }
}
```

#### 6. Tests unitarios e integración

- **Unit:** `WordService.createWord` con mocks de `AIService`, `ImageService`, `WordRepository`
  - Caso: normalización correcta del término
  - Caso: lanza `ConflictError` si duplicado
  - Caso: propaga error si Claude falla
- **Integration (Supertest + Firestore emulator):**
  - `POST /words` con token válido → 201
  - `POST /words` con term vacío → 400
  - `POST /words` duplicado → 409
  - `POST /words` sin token → 401

---

### Criterios de aceptación del ticket

- [ ] `POST /words` con `{ term: "serendipity", definitionLanguage: "es" }` devuelve 201 con `wordCard` y `suggestedImages`.
- [ ] `POST /words` sin token devuelve 401.
- [ ] `POST /words` con term vacío devuelve 400.
- [ ] `POST /words` con term ya existente (mismo userId) devuelve 409.
- [ ] La normalización `trim + toLowerCase` funciona (caso: "  Serendipity  " → "serendipity").
- [ ] La definición se genera en español cuando `definitionLanguage = "es"` y en inglés cuando `= "en"`.
- [ ] Tests unitarios e integración pasan con `npm test`.
- [ ] El endpoint queda documentado en OpenAPI (`4-especificaciones-de-la-api.md`).

---

### Notas

- La imagen final (seleccionada por el usuario) se guarda después mediante `PUT /words/:id`. Este endpoint solo genera el borrador y las sugerencias.
- Los errores de Claude y Unsplash deben capturarse y envolverse en `500 INTERNAL_ERROR` — nunca exponer detalles de APIs externas al cliente.
- Usar `claude-3-5-haiku-20241022` para minimizar latencia y coste en el MVP.

---

## Ticket 3 — Frontend

### `FE-01` · Implementar pantalla "Add Word" — flujo completo de captura de vocabulario

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Historia relacionada** | US-03 (LEX-7), US-04 (LEX-8), US-05 (LEX-9), US-06 (LEX-10) |
| **Epic** | Epic 2 — Vocabulary Capture (`LEX-2`) |
| **Prioridad** | P0 |
| **Estimación** | L |
| **Dependencias** | `BE-01` (endpoint POST /words operativo) |
| **Estado inicial** | To Do |
| **Asignado a** | Full-stack developer |

---

### Descripción

Implementar la pantalla completa de captura de vocabulario en **React Native + Expo**. El usuario introduce una palabra o frase, elige el idioma de la definición, pulsa "Generate", ve la definición sugerida por IA (editable), selecciona una imagen de Unsplash y guarda la tarjeta. Es la pantalla más crítica del MVP desde el punto de vista de UX: es el primer valor percibido por el usuario.

---

### Diseño de la pantalla

```
┌────────────────────────────────────┐
│  ← Add New Word                    │
│                                    │
│  Word or phrase *                  │
│  ┌──────────────────────────────┐  │
│  │ e.g. "serendipity"           │  │
│  └──────────────────────────────┘  │
│                                    │
│  Definition language               │
│  ● Spanish   ○ English             │
│                                    │
│  ┌──────────────────────────────┐  │
│  │     Generate Definition      │  │  ← disabled if term empty
│  └──────────────────────────────┘  │
│                                    │
│  ── After "Generate" ────────────  │
│                                    │
│  Definition (editable)             │
│  ┌──────────────────────────────┐  │
│  │ Hallazgo afortunado e        │  │
│  │ inesperado de algo valioso.  │  │
│  └──────────────────────────────┘  │
│                                    │
│  Choose an image                   │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ img1 │ │ img2 │ │ img3 │  ...  │
│  └──────┘ └──────┘ └──────┘       │
│                                    │
│  ┌──────────────────────────────┐  │
│  │         Save Card            │  │  ← disabled until image selected
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

---

### Tareas

#### 1. Crear el archivo de pantalla

`mobile/app/(tabs)/add-word.tsx`

```typescript
export default function AddWordScreen() {
  const [term, setTerm] = useState('');
  const [definitionLanguage, setDefinitionLanguage] = useState<'es' | 'en'>('es');
  const [definition, setDefinition] = useState('');
  const [suggestedImages, setSuggestedImages] = useState<UnsplashImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const [wordCardId, setWordCardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ... renderizado de la pantalla
}
```

#### 2. Implementar la función `handleGenerate`

```typescript
const handleGenerate = async () => {
  if (!term.trim()) {
    setError('Please enter a word or phrase');
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    const { wordCard, suggestedImages } = await apiClient.post('/words', {
      term: term.trim(),
      definitionLanguage
    });
    setWordCardId(wordCard.id);
    setDefinition(wordCard.definition);
    setSuggestedImages(suggestedImages);
  } catch (err: any) {
    if (err.status === 409) {
      setError(`You already have a card for "${term.trim().toLowerCase()}"`);
    } else {
      setError('Something went wrong. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};
```

#### 3. Implementar la función `handleSave`

```typescript
const handleSave = async () => {
  if (!selectedImage || !wordCardId) return;

  setIsLoading(true);
  try {
    await apiClient.put(`/words/${wordCardId}`, {
      definition,                        // definición editada por el usuario
      imageUrl: selectedImage.url,
      unsplashPhotoId: selectedImage.photoId
    });
    router.replace('/(tabs)/dictionary'); // navegar al diccionario tras guardar
  } catch (err) {
    setError('Could not save the card. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

#### 4. Componente `ImagePicker`

`mobile/components/ImagePicker.tsx`

- Recibe `images: UnsplashImage[]` y `onSelect: (img: UnsplashImage) => void`
- Renderiza `FlatList` horizontal con `numColumns={3}` (o scroll horizontal)
- Imagen seleccionada: borde azul + ícono de check overlay
- Muestra el nombre del fotógrafo debajo de cada imagen (atribución Unsplash)
- Tamaño de thumbnails: 100×100 px

```typescript
export function ImagePickerGrid({ images, selectedId, onSelect }: ImagePickerProps) {
  return (
    <FlatList
      data={images}
      numColumns={3}
      keyExtractor={(item) => item.photoId}
      renderItem={({ item }) => (
        <Pressable onPress={() => onSelect(item)}>
          <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
          {selectedId === item.photoId && <CheckOverlay />}
        </Pressable>
      )}
    />
  );
}
```

#### 5. Manejo de estados visuales

| Estado | UI |
|--------|----|
| Sin término | Botón "Generate" desactivado (opacity 0.4) |
| Cargando | `ActivityIndicator` sobre el botón + campo desactivado |
| Error de API | Mensaje en rojo bajo el campo de término |
| Duplicado (409) | Banner amarillo con enlace "Edit existing card" |
| Generado | Mostrar sección de definición + imágenes |
| Sin imagen seleccionada | Botón "Save Card" desactivado |
| Guardando | `ActivityIndicator` sobre "Save Card" |

#### 6. Validaciones en cliente (sin llamar al API)

```typescript
// Antes de llamar a handleGenerate:
- term.trim().length === 0 → error "Please enter a word or phrase"
- term.trim().length > 500 → error "Term must be 500 characters or fewer"
```

#### 7. Internacionalización

Añadir claves en `mobile/i18n/es.json` y `mobile/i18n/en.json`:

```json
{
  "addWord": {
    "title": "Add New Word",
    "termPlaceholder": "e.g. \"serendipity\"",
    "termLabel": "Word or phrase",
    "langLabel": "Definition language",
    "langEs": "Spanish",
    "langEn": "English",
    "generateButton": "Generate Definition",
    "definitionLabel": "Definition (editable)",
    "chooseImageLabel": "Choose an image",
    "saveButton": "Save Card",
    "errorEmpty": "Please enter a word or phrase",
    "errorDuplicate": "You already have a card for \"{{term}}\"",
    "errorGeneric": "Something went wrong. Please try again.",
    "errorNoImage": "Please select an image for your card"
  }
}
```

#### 8. Tests de componente

`mobile/__tests__/AddWordScreen.test.tsx`

```typescript
// Casos a testear con React Native Testing Library:
- render inicial: botón "Generate" desactivado cuando term está vacío
- escribir término: botón "Generate" se activa
- pulsar "Generate": muestra ActivityIndicator, luego sección de definición + imágenes
- error 409: muestra banner de duplicado con enlace
- error genérico: muestra mensaje de error
- seleccionar imagen: botón "Save Card" se activa
- pulsar "Save Card": llama a PUT /words/:id y navega al diccionario
```

---

### Criterios de aceptación del ticket

- [ ] El usuario puede escribir un término y seleccionar idioma de definición.
- [ ] "Generate" desactivado si el término está vacío; muestra error inline si se intenta.
- [ ] Al pulsar "Generate", se muestra loading, luego la definición y las imágenes.
- [ ] El campo de definición es editable y los cambios se guardan.
- [ ] El usuario puede seleccionar una imagen; la imagen seleccionada muestra indicador visual.
- [ ] "Save Card" desactivado hasta que haya imagen seleccionada.
- [ ] Al guardar, se navega al diccionario y la tarjeta aparece en la lista.
- [ ] Errores de red y duplicados se muestran con mensajes claros.
- [ ] Textos de UI se muestran correctamente en español e inglés.
- [ ] Tests de componente pasan con `npm test`.

---

### Notas

- La pantalla guarda el `wordCardId` del borrador creado en `handleGenerate` para usarlo en `handleSave` con `PUT /words/:id`. Si el usuario abandona la pantalla sin guardar, el borrador queda en Firestore — aceptable en MVP; clean-up en v1.1.
- El componente `ImagePickerGrid` se puede reutilizar en la pantalla de detalle de tarjeta para cambiar imagen.
- Respetar la atribución de Unsplash mostrando el nombre del fotógrafo.

---

## Resumen de tickets

| ID | Tipo | Descripción | Prioridad | Dep. |
|----|------|-------------|-----------|------|
| `DB-01` | Base de datos | Colecciones Firestore, índices y Security Rules | P0 | — |
| `BE-01` | Backend | `POST /words` — captura con Claude e Unsplash | P0 | DB-01 |
| `FE-01` | Frontend | Pantalla "Add Word" — flujo completo de captura | P0 | BE-01 |

**Orden de ejecución recomendado:** `DB-01` → `BE-01` (en paralelo con base del FE) → `FE-01` completo
