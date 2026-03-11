# Spec: PDF Template Analysis API Endpoint PROMPT

## METAPROMPT LLM GEMINI

Crear un endpoint en mi FastAPI: un POST /api/v1/templates/analyze, este post recibe un documento PDF con un acroform incrustado, el servicio debe analizarlo y devolver un documento json con la estructura del formulario: texto más proximo al formulario, id del campo, tipo de campo (texto, radiobutton, etc.), opciones de valores en el caso que los haya.
Es un endpoint no autenticado
Te adjunto el documento HorasComplementarias.pdf de ejemplo, donde los dos primeros campos del formulario son:

- campo:
  - idCampo: A0101
  - tipo: text
  - textoProximo: "hasta un máximo de"
- campo
  - idCampo: A0102
  - tipo: text
  - textoProximo: "que suponen un"

Restricción: Este servicio no guarda ningún dato en base de datos. Es solo para tener una información rápida del documento.
Restricción: Los campos deben aparecer en el mismo orden que el documento.
Primero quiero construir la especificación para usar la metodología agent-os (https://buildermethods.com/agent-os). Recomiendame el mejor prompt para el comando /create-spec según los datos descritos para el endpoint

## RESPUESTA

Crea la especificación completa para un nuevo endpoint de FastAPI.
/create-spec

### 1. Detalles del Endpoint

- **Método:** POST
- **Ruta:** /api/v1/templates/analyze
- **Autenticación:** No autenticado (abierto).
- **Controlador/Router:** Debe ubicarse en el router de 'templates'.
- **Función de Lógica:** Debe usar un servicio interno que ejecute el análisis y procese el PDF.

### 2. Formato de Input/Output

**INPUT (FastAPI):**

- Recibe un archivo PDF subido a través de un formulario (Usar `UploadFile` de FastAPI).

**OUTPUT (JSON Structure):**

- Devuelve una lista JSON con la estructura de campos del formulario AcroForm.
- Los campos deben mantener el ORDEN en que aparecen en el documento.
- Usar un Pydantic Model llamado 'TemplateField' para el output, que contenga:
  - **id_campo** (str): Identificador único del campo del formulario (ej: 'A0101').
  - **tipo** (str): Tipo de control de formulario (ej: 'text', 'radiobutton', 'checkbox', 'listbox').
  - **texto_proximo** (str): El texto más cercano en el PDF al campo del formulario (ej: 'hasta un máximo de').
  - **opciones_valores** (List[str] | None): Lista de valores predefinidos, solo si el campo es de tipo selección (ej: radio, listbox).

### 3. Lógica y Restricciones Funcionales

- **Herramientas de Análisis:** La lógica debe utilizar las librerías `PyPDF2` y/o `pdfplumber` para la extracción de campos AcroForm y la identificación del texto más próximo.
- **Restricción 1 (Persistencia):** El servicio NO debe guardar ningún dato en la base de datos (PostgreSQL o Redis). La operación debe ser puramente transaccional.
- **Restricción 2 (Orden):** Los campos devueltos deben reflejar el orden de aparición en el documento.

### 4. Ejemplo de Output Esperado

- Para los primeros campos del documento 'HorasComplementarias.pdf', el output debe empezar con:
  [
  {
  "id_campo": "A0101",
  "tipo": "text",
  "texto_proximo": "hasta un máximo de",
  "opciones_valores": null
  },
  {
  "id_campo": "A0102",
  "tipo": "text",
  "texto_proximo": "que suponen un",
  "opciones_valores": null
  }
  ]

Crea el _router_ de FastAPI y los _Pydantic models_ necesarios en el archivo de especificación.
