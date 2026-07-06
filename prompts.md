> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras

> Note: prompts are reproduced verbatim (exactly as written). The product had many feature-addition prompts, so a few sections list more than the suggested 3 to preserve every substantive prompt. Iteration/review prompts that don't map to a single deliverable section are collected at the end.

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:** _(initial idea — invoked via the `/write-spec` skill)_

> I want to build an app that will parse a pdf and will create slides to teach the content of the pdf to the user. Each slide could be instructional or an activity

**Prompt 2:** _(broaden the problem to students who want to self-assess)_

> Lets modify the problem statement so it also includes students that wants to assess if they have learned what they are studying, so they could receive a pdf from their school, university, etc.; they will study it, and they want to assess themselves. Modify both the PRD and the readme

**Prompt 3:** _(rewrite the objective so it isn't framed around self-learners)_

> I don´t like this statement: "Self-learners constantly accumulate PDFs they want to actually learn", the objective still looks like being for self-learners, and that's not what I want, this should be for anyone needing to learn or assess themselves. please  completely re-write the objective

**Prompt 4:** _(add a paid tier — Future Considerations / P2)_

> On P2, add a paid-tier that will not require bring-your-own-key AI key, it will use an AI service as part of the paid features

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:** _(stack and high-level architecture, submitted via the intake form — the constraints were written verbatim)_

> PDF-to-slides app details — Audience: Self-learners / general public · Context: Bootcamp / course final project (portfolio) · Activity types: "Multiple choice questions, Fill in the blank, Flashcards / recall, Open-ended / short answer, Matching / drag-drop" · Success signals: Learning gains (quiz scores) · Constraints:
>
> I'll use react-native with expo for android, ios and web using react-native-web. The authentication and backend should use supabase, github actions for the pipeline (but at start it will only build and deploy web) and the user should add their own api key for the ai usage

### **2.2. Descripción de componentes principales:**

**Prompt 1:** _(AI key handling, server-side extraction, and scope of matching)_

> * Where the AI key lives: proxied through a Supabase Edge Function
> * PDF extraction: this is the highest technical risk, it should be done on the BE and it should be one of the first tasks to achieve.
> * Open-ended + matching/drag-drop: leave drag-drop out of the current scope

**Prompt 2:** _(extract and use images from the PDF)_

> the pdf can also contain images, not only text, modify the PRD so it reflects that images should also be extracted from the pdf and used in the slides

**Prompt 3:** _(answers to the open questions — AI provider, extraction library, image placement, image/PDF caps, learning-gain measurement, scanned-PDF detection)_

> Here are responses to the Open Questions:
>
> [Eng] Which AI provider/model is assumed for the bring-your-own key (OpenAI, Anthropic, multiple)? Determines the generation prompt/response contract. Blocking for R2.
> use vercel https://ai-sdk.dev/ so different providers can be used easily
> [Eng] Which server-side PDF extraction library runs in the Edge Function runtime (Deno), and can it extract both text and embedded images (with page/position info)? What's the fallback if it can't handle a given PDF? Blocking for R1.
> this point needs research to be made, a possible solution is https://github.com/run-llama/liteparse or some other pdf-parser library
> [Eng/product] How does generation decide which extracted image belongs on which slide — does the AI receive image descriptions/positions, the images themselves (vision model), or a simple page-proximity heuristic? Affects the R2 contract and provider choice. Blocking for R2 image placement.
> if the image has description or position, it can be used to decide which slide to put it on, but if it is just a vision model, it will need to be decided by the AI.
> [Product] Cap on number/size of images stored per PDF, given storage cost and slide clutter? Non-blocking; set a sensible cap.
> images should be reduced in size and quality to reduce storage cost and clutter.
> [Data] Without a pre-quiz in v1, is "retake improvement" a credible proxy for learning gain, or should the P1 pre/post quiz be pulled into v1? Non-blocking, revisit after first tests.
> remove any reference to pre-quiz as it is not in the scope of the project.
> [Product] Max PDF size / page count for v1, given generation cost and latency? Non-blocking; set a sensible cap.
> this will need to be tested and decided by the team.
> [Eng] How are scanned/image PDFs detected so R1's error path triggers reliably? Non-blocking.
> test what https://github.com/run-llama/liteparse can do and if it can detect scanned/image PDFs.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

_No specific prompt in this session — generated as part of the README fill (see prompt under section 4)._

### **2.4. Infraestructura y despliegue**

**Prompt 1:** _(CI/CD and deployment defined in the constraints prompt under 2.1)_

> ...github actions for the pipeline (but at start it will only build and deploy web)...

### **2.5. Seguridad**

**Prompt 1:** _(server-side AI key handling — part of the prompt under 2.2)_

> * Where the AI key lives: proxied through a Supabase Edge Function

### **2.6. Tests**

_No specific prompt in this session._

---

### 3. Modelo de Datos

**Prompt 1:** _(store slides as JSON instead of tables; images as URLs)_

> The slides should be a json containing all the needed data instead of tables (the images should be a url)

**Prompt 2:** _(promote resume mid-lesson into v1 — drove `current_slide_index` in `lesson_attempts`)_

> Make the following part of v1, not nice-to-have
>
> * Resume mid-lesson at the exact slide left off.

---

### 4. Especificación de la API

**Prompt 1:** _(lesson composition choice — added the `composition` parameter to generation)_

> change the prd so the user can select if he wants only instructional slides, only activity slides, or both

**Prompt 2:** _(generate the README, which produced the API spec along with sections 3, 5, 6 and 7)_

> please fill in the readmd.md, do it in english

---

### 5. Historias de Usuario

**Prompt 1:** _(add an authentication user story)_

> add a user story for authentication

**Prompt 2:** _(prioritize it as the first story)_

> make it the first story to be done

---

### 6. Tickets de Trabajo

**Prompt 1:** _(make authentication the first ticket)_

> also make authentication as the first ticket

---

### 7. Pull Requests

_No specific prompt in this session — the planned Pull Requests were generated as part of the README fill (see prompt under section 4)._

---

## Prompts adicionales de iteración y revisión

These prompts drove refinement, reconciliation and review across the documents rather than a single deliverable section:

**Refine R1 to cover the whole PDF (not just text-based):**

> R1 still talks about a text-based pdf, check on the entire pdf

**After manual edits to the file:**

> I've edited the .md file, re-read it

**Reconcile the matching/drag-drop inconsistency across sections:**

> yes, reconcile it

**Final cross-document review:**

> Do a final review of both PRD.md and readme.md, check that both files are correct by themselves, and also that their are consistent between them

**Generate this prompts log:**

> ok, now fill the file prompts.md using the current session, be extremely precise saving the exact promps I've wrote
