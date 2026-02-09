# AGENTS.MD - Reglas Globales del Asistente

Este archivo define el comportamiento obligatorio del AI Assistant para este proyecto.

## 1. SISTEMA DE REGISTRO (LOGGING)
**Regla:** Antes de ejecutar cualquier tarea compleja, debes registrar el prompt en el archivo `prompts.md` ubicado en la raíz.

### A. Verificación de Existencia
Si `prompts.md` **NO** existe, créalo con el siguiente contenido exacto:

# REGISTRO DE PROMPTS UTILIZADOS
**Autor**: [Usuario]
**Proyecto**: [Preguntar si no se extrae por contexto]
**Descripción**: Bitácora de prompts para trazabilidad del proyecto.
---

### B. Lógica de Escritura
Si el archivo ya existe:
1. Lee la última entrada para identificar el último ID (ej. 001).
2. Calcula el siguiente ID incremental (ej. 002).
3. Añade la nueva entrada al final del archivo siguiendo **estrictamente** este formato:
   - **IMPORTANTE:** Este método es vulnerable a condiciones de carrera en entornos multi-agente.
   - **SOLUCIÓN RECOMENDADA:** Implementar bloqueo de archivos (file-locking) o usar un mecanismo de asignación centralizada de IDs.
   - **FORMATO ALTERNATIVO:** Usa un ID monotónico único basado en fecha/hora para evitar colisiones: `YYYYMMDD-HHMM-SS`.


## [ID-INCREMENTAL] - [Título Breve descriptivo]
**Fecha:** YYYY-MM-DD HH:MM
**Prompt Original:**
> [Aquí pega el contenido LITERAL y COMPLETO del prompt del usuario. NO resumir.]
> 
> **IMPORTANTE - Snippets de Espanso:**
> Si detectas un trigger como `:comando`, debes registrar el TEXTO EXPANDIDO COMPLETO que ves en el userRequest.
> Nunca registres solo el trigger (ej. `:audit-master`) sin el contenido real.
> Formato preferido cuando detectes snippet:
> ```
> **Prompt Original (Snippet expandido):**
> > :trigger-name
> >
> > [Texto completo expandido del snippet]
> ```

**Resumen de la Respuesta/Acción:**
[Aquí escribirás un resumen muy breve (1-2 líneas) de la solución que vas a plantear]
---

## 2. FLUJO DE TRABAJO (PLANNING PRIMERO)
**Regla:** Nunca escribas código final sin antes presentar un plan y obtener aprobación.

### Pasos Obligatorios:
1. **Análisis:** Lee y entiende el requerimiento.
2. **Logging:** Genera la entrada en `prompts.md` (como se define en la sección 1).
3. **Planificación:** Crea una lista de tareas (To-Do List) detallada de lo que vas a hacer.
4. **Confirmación:** Detente y pregunta: *"¿Procedo con este plan?"*.
   - **Checklist de Revisión:**
     - [ ] ¿Están identificados todos los archivos afectados?
     - [ ] ¿Son claras las dependencias/prerrequisitos?
     - [ ] ¿El alcance es adecuado para una sola sesión?

5. **Ejecución:** Solo tras recibir un "Sí", procede a generar el código o realizar los cambios.

## 3. TESTING Y VALIDACIÓN
**Regla:** Fomenta la validación constante.
- Al finalizar una implementación, pregunta proactivamente si el usuario desea probar una funcionalidad específica.
- Si es un cambio de base de datos, sugiere verificar con herramientas visuales o scripts de prueba.

## 4. PROTOCOLO DE FINALIZACIÓN (DEFINITION OF DONE)
 
NO marques una tarea como completada hasta haber ejecutado este checklist de verificación:
 
### 1. Verificación Documental (Crucial)
Antes de cerrar, verifica que los artifacts reflejan la realidad del código:
- [ ] **memory-bank/systemPatterns.md**: Actualizado si hubo cambios de arquitectura/módulos.
- [ ] **memory-bank/techContext.md**: Actualizado si hubo nuevas dependencias.
- [ ] **memory-bank/decisions.md**: Registro de decisiones técnicas importantes (ADRs).
- [ ] **memory-bank/projectbrief.md**: Actualizado si cambió el alcance/scope.
- [ ] **prompts.md**: Todos los prompts complejos registrados.
 
### 2. Proceso de Aprobación
- **Reviewer Requerido**: Usuario (BIM Manager / Tech Lead).
- **Flujo**:
    1. Presentar resumen de cambios (changelog).
    2. Demostrar cumplimiento de requisitos (screenshots, logs, tests).
    3. Solicitar confirmación explícita: "¿Das por cerrada esta tarea?".
 
### 3. Consecuencias
- **Skipping Steps**: Si saltas estos pasos, el PR será rechazado automáticamente por el sistema de CI/CD 
 o por la revisión humana, requiriendo un rework costoso.
- **Inconsistencias**: La deuda de documentación se acumula exponencialmente. Limpia antes de salir.
 
> **Regla de Oro:** El código es volátil, el Memory Bank acumulativo y permanente. Actualiza primero la memoria, luego el código.

## 5. SEGURIDAD: SANITIZACIÓN DE CREDENCIALES EN DOCUMENTACIÓN
**Regla CRÍTICA:** NUNCA incluir credenciales, passwords, tokens o secretos reales en archivos que serán commiteados a Git.

### A. Tipos de Información Sensible a PROTEGER

**🔴 PROHIBIDO incluir en archivos de código/documentación:**
- Passwords de bases de datos (ej: `Farolina-14-Supabase`)
- API Keys reales (ej: `sk_live_abc123...`)
- JWT Tokens completos (especialmente service_role keys)
- Database Connection Strings con passwords
- Project References específicos de Supabase/Firebase
- URLs completas que expongan project IDs internos
- SSH Private Keys
- OAuth Client Secrets
- Encryption Keys

### B. Plantillas de Sanitización OBLIGATORIAS

Cuando crees documentación con ejemplos, usa SIEMPRE placeholders genéricos:

#### ❌ INCORRECTO (Expone credenciales reales):
```yaml
SUPABASE_URL=https://ebqapsoyjmdkhdxnkikz.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVicWFwc295am1ka2hkeG5raWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMyOTAwMiwiZXhwIjoyMDg1OTA1MDAyfQ.JEKDxZGbHhq3fp_AUCXvCW6mj3XCXjpJbYWuLhNgGZQ
SUPABASE_DB_PASSWORD=Farolina-14-Supabase
SUPABASE_DATABASE_URL=postgresql://postgres.ebqapsoyjmdkhdxnkikz:Farolina-14-Supabase@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

#### ✅ CORRECTO (Usa placeholders):
```yaml
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IllPVVJfUFJPSkVDVF9SRUYiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE5MDA...[REDACTED]
SUPABASE_DB_PASSWORD=your-secure-database-password
SUPABASE_DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_DB_PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
```

### C. Reglas de Redacción de Documentación

1. **Antes de escribir CUALQUIER ejemplo**:
   - Pregúntate: "¿Este valor es genérico o específico de MI proyecto?"
   - Si es específico → Reemplázalo con placeholder

2. **Patrones de Placeholders Estándar**:
   - Project IDs: `YOUR_PROJECT_ID`, `YOUR_PROJECT_REF`
   - Passwords: `your-password-here`, `YOUR_SECURE_PASSWORD`
   - Tokens: Mostrar solo inicio + `...[REDACTED]`
   - URLs: `https://example.com` o `https://your-project.service.com`
   - UUIDs: `00000000-0000-0000-0000-000000000000`

3. **En prompts.md**:
   - Al registrar comandos que incluyen credenciales, sanitiza ANTES de escribir
   - Si el prompt del usuario contenía credenciales, NO las copies literalmente
   - Añade nota: `[CREDENTIALS REDACTED FOR SECURITY]`

4. **Verificación antes de commit**:
   ```bash
   # Comando de auto-verificación antes de commit
   git diff --cached | grep -iE "(password|secret|token|key.*=)" 
   # Si devuelve algo → REVISAR
   ```

### D. Respuesta a Detección de Credenciales Expuestas

Si GitGuardian, Snyk u otra herramienta detecta exposición:

1. **INMEDIATO** (hacer antes de cualquier cosa):
   - ❌ NO hacer más commits/pushes
   - ✅ Sanitizar archivos localmente
   - ✅ Crear documento de respuesta a incidente

2. **URGENTE** (primeras 24 horas):
   - Rotar credenciales comprometidas
   - Limpiar historial de Git (BFG Repo-Cleaner)
   - Actualizar GitHub Secrets con credenciales nuevas

3. **PREVENTIVO** (siguientes 48 horas):
   - Instalar pre-commit hooks (git-secrets, detect-secrets)
   - Revisar TODA la documentación existente
   - Actualizar este AGENTS.md si identificas nuevos patterns

### E. Herramientas de Prevención (RECOMENDADAS)

```bash
# 1. Instalar git-secrets (previene commits con secretos)
brew install git-secrets  # macOS
git secrets --install
git secrets --register-aws  # Detecta AWS keys
git secrets --add 'password\s*=\s*.+'  # Custom patterns

# 2. Instalar detect-secrets (Yelp)
pip install detect-secrets
detect-secrets scan > .secrets.baseline
# Agregar a .pre-commit-config.yaml

# 3. Usar .gitignore SIEMPRE para .env
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
git add .gitignore
```

### F. Checklist de Seguridad Pre-Commit

Antes de hacer `git commit`, verifica:

- [ ] ¿Algún archivo nuevo contiene ejemplos con credenciales?
- [ ] ¿Los `.env` están en .gitignore y NO trackeados?
- [ ] ¿Los archivos .md usan placeholders genéricos?
- [ ] ¿Los archivos YAML/JSON de configuración están sanitizados?
- [ ] ¿Ejecuté `git diff --cached` y revisé cambios manualmente?

**Si UNA SOLA respuesta es "No estoy seguro" → DETENTE y revisa.**

### G. Referencias Rápidas

**Incidentes de Seguridad Registrados**:
- `SECURITY-INCIDENT-2026-02-09.md`: PostgreSQL URI expuesto en `.github/SECRETS-SETUP.md`
- Prompt #055 en `prompts.md`: Credenciales Supabase comprometidas

**Plantillas Aprobadas**:
- `.env.example`: Usa SIEMPRE valores dummy/placeholder
- `.github/SECRETS-SETUP.md`: Ejemplos sanitizados ✅
- `README.md`: URLs genéricas tipo `https://example.com`

---

> **⚠️ ADVERTENCIA FINAL**: Un solo commit con credenciales puede comprometer TODO el proyecto, incluso después de rotarlas. La limpieza de historial es costosa y arriesgada. **PREVENIR es 100x más barato que remediar.**

---