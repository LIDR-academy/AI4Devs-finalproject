# ADR 010: DynamoDB en AWS con Entornos Separados e IAM de Mínimo Privilegio

**Estado**: ✅ Aceptada  
**Fecha**: 2026-03-15  
**Decidido en**: Sesión de infraestructura — migración DynamoDB Local → AWS  
**Implementado en**: Sesión 2026-03-15 (tablas y usuarios IAM creados vía AWS CLI)  
**Reemplaza a**: N/A (complementa ADR-002)

---

## Contexto

El MVP de Adresles usaba DynamoDB Local (contenedor Docker `amazon/dynamodb-local`) con credenciales ficticias (`"local"/"local"`). Para avanzar hacia un despliegue real era necesario:

1. **Migrar a AWS DynamoDB real** para tener persistencia real de mensajes de conversación
2. **Separar Dev de Prod** para poder probar cambios sin afectar datos de producción
3. **Controlar costes** de forma aislada por entorno
4. **Aplicar mínimo privilegio** — la app no debe tener más permisos de los estrictamente necesarios

El código ya tenía el mecanismo de distinción implementado: si `DYNAMODB_ENDPOINT` estaba definido → DynamoDB Local; si no → AWS real. Solo faltaba la infraestructura real y la configuración segura.

---

## Decisión

**Dos tablas DynamoDB en AWS real, una por entorno, con un IAM User dedicado por entorno con permisos mínimos.**

- `adresles-messages-dev` en `eu-west-1` (Irlanda) → IAM User `adresles-app-dev`
- `adresles-messages-prod` en `eu-central-1` (Frankfurt) → IAM User `adresles-app-prod`
- El nombre de tabla se configura con la variable de entorno `DYNAMODB_TABLE_NAME`
- Tres archivos `.env` en la raíz: `.env` (local Docker), `.env.dev` (AWS Dev), `.env.prod` (AWS Prod)

---

## Justificación

### Análisis de Alternativas

| Opción | Pros | Contras | Veredicto |
|--------|------|---------|-----------|
| **Tablas separadas por entorno + IAM por entorno** (elegida) | • Aislamiento total entre datos de dev y prod<br>• Si hay fuga de credenciales dev, prod queda intacto<br>• Costes separados y trazables<br>• Rollback sencillo (apuntar variable a tabla anterior) | • Dos tablas a mantener<br>• Dos IAM Users a gestionar | ✅ Seleccionada |
| **Una sola tabla con prefijo en PK** | • Un solo recurso AWS<br>• Menos IAM | • Dev puede contaminar prod<br>• Mínimo privilegio más difícil de aplicar<br>• Costes mezclados | ❌ Descartada |
| **Una cuenta AWS por entorno** | • Aislamiento máximo | • Coste y complejidad de gestión muy alto para MVP<br>• Overhead de AWS Organizations | ❌ Overkill para MVP |
| **Seguir con DynamoDB Local** | • Coste $0<br>• Sin gestión IAM | • Sin persistencia real<br>• No valida el comportamiento en producción<br>• No desbloquea el despliegue real | ❌ No válido para producción |

### Razones Principales

1. **Seguridad por defecto**: Las credenciales de Dev nunca pueden afectar a la tabla de Prod porque la política IAM lo impide a nivel de ARN. Aunque se filtren las credenciales de Dev, el atacante solo puede operar sobre `adresles-messages-dev`.

2. **Coste cero adicional en el MVP**: Ambas tablas usan `PAY_PER_REQUEST` (on-demand). Con el volumen de mensajes del MVP (desarrollo + pruebas), el coste es prácticamente $0. El free tier de DynamoDB cubre 25 WCU/RCU y 25 GB.

3. **Cambio de código mínimo**: Solo fue necesario cambiar `const TABLE_NAME = 'adresles-messages'` por `const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? 'adresles-messages'` en dos ficheros. El mecanismo local/AWS ya existía.

4. **Retrocompatibilidad total**: El entorno local con DynamoDB Local sigue funcionando sin cambios. El fallback `?? 'adresles-messages'` garantiza que el setup local no se rompe.

5. **Regiones geográficamente próximas al usuario**: eu-west-1 (Irlanda) para Dev y eu-central-1 (Frankfurt) para Prod. Ambas en Europa, cumpliendo con requisitos GDPR potenciales.

### Criterios de Evaluación

- ✅ **Aislamiento Dev/Prod**: Tablas y credenciales completamente separadas
- ✅ **Mínimo privilegio**: Cada IAM User solo puede hacer `PutItem`, `GetItem`, `Query`, `UpdateItem` sobre su tabla
- ✅ **Coste trazable**: Tags `Project=adresles` + `Environment=dev/prod` en tablas y usuarios IAM
- ✅ **Retrocompatibilidad**: DynamoDB Local sigue funcionando con `.env` sin cambios
- ✅ **Validación automatizada**: Script `validate-dynamodb-aws.ts` para verificar conectividad
- ⚠️ **Gestión de dos entornos**: Trade-off aceptado (complejidad mínima a cambio de seguridad)

---

## Consecuencias

### ✅ Positivas

- **Seguridad IAM real**: Las credenciales de la app tienen exactamente los permisos que necesita (ni uno más)
- **Persistencia real de conversaciones**: Los mensajes sobreviven reinicios del servidor
- **Desbloquea el despliegue**: La app puede desplegarse en producción con AWS DynamoDB
- **TTL funciona en producción**: Los mensajes se borran automáticamente a los 90 días en AWS real
- **Trazabilidad de costes**: Tags permiten filtrar en AWS Cost Explorer por `Project` y `Environment`

### ❌ Negativas (Trade-offs)

- **Credenciales sensibles en `.env.dev` y `.env.prod`**: No deben comitearse al repositorio
  - *Mitigación*: `.gitignore` ya excluye `.env.*` salvo `.env.example`
- **Dos tablas a mantener**: Si se hace un cambio de schema en local hay que aplicarlo en AWS manualmente
  - *Mitigación*: El schema de DynamoDB es esquema-libre; cambios en atributos no requieren migración de tabla
- **Rotación de credenciales manual**: Las Access Keys de IAM no rotan automáticamente
  - *Mitigación*: Pendiente implementar rotación periódica o migrar a IAM Roles cuando se use EC2/ECS

### 🔧 Deuda Técnica Introducida

- **Rotación de Access Keys**: En producción real se debería rotar periódicamente o usar IAM Roles (para instancias EC2/ECS) en lugar de IAM Users con Access Keys estáticas
- **Eliminación de ítems de validación**: El script `validate-dynamodb-aws.ts` deja ítems de prueba en la tabla (se borran solos por TTL a los 90 días, pero podría añadirse limpieza explícita)

---

## Implementación

### Recursos AWS creados

| Recurso | Tipo | Región | ARN |
|---------|------|--------|-----|
| `adresles-messages-dev` | DynamoDB Table | eu-west-1 | `arn:aws:dynamodb:eu-west-1:788980370883:table/adresles-messages-dev` |
| `adresles-messages-prod` | DynamoDB Table | eu-central-1 | `arn:aws:dynamodb:eu-central-1:788980370883:table/adresles-messages-prod` |
| `adresles-app-dev` | IAM User | Global | `arn:aws:iam::788980370883:user/adresles-app-dev` |
| `adresles-app-prod` | IAM User | Global | `arn:aws:iam::788980370883:user/adresles-app-prod` |
| `AdreslesAppDevDynamoDB` | IAM Policy | Global | `arn:aws:iam::788980370883:policy/AdreslesAppDevDynamoDB` |
| `AdreslesAppProdDynamoDB` | IAM Policy | Global | `arn:aws:iam::788980370883:policy/AdreslesAppProdDynamoDB` |

### Política IAM (idéntica para dev y prod, cambia el ARN de tabla)

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:Query",
      "dynamodb:UpdateItem"
    ],
    "Resource": "arn:aws:dynamodb:<region>:<account>:table/adresles-messages-<env>"
  }]
}
```

Las políticas están versionadas en `infrastructure/iam/`.

### Cambios en el código

**Dos ficheros modificados** (mismo cambio en ambos):

```typescript
// apps/worker/src/dynamodb/dynamodb.service.ts
// apps/api/src/mock/mock-conversations.service.ts

// Antes
const TABLE_NAME = 'adresles-messages';

// Después — compatible con los tres entornos
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? 'adresles-messages';
```

### Estructura de ficheros `.env`

```
.env          → DynamoDB Local (DYNAMODB_ENDPOINT=http://localhost:8000)
.env.dev      → AWS Dev (DYNAMODB_TABLE_NAME=adresles-messages-dev, region eu-west-1)
.env.prod     → AWS Prod (DYNAMODB_TABLE_NAME=adresles-messages-prod, region eu-central-1)
.env.example  → Plantilla documentada (sin credenciales reales)
```

### Cómo cambiar de entorno

```bash
# Activar Dev AWS
cp .env.dev .env

# Activar Prod AWS
cp .env.prod .env

# Volver a local (Docker)
cp .env.local .env  # o restaurar manualmente DYNAMODB_ENDPOINT
```

### Validación

```bash
pnpm dynamo:validate:dev    # Escribe y lee en adresles-messages-dev
pnpm dynamo:validate:prod   # Escribe y lee en adresles-messages-prod
```

---

## Métricas de Éxito

- 📊 **Coste DynamoDB Dev**: < $1/mes (prácticamente $0 con PAY_PER_REQUEST)
- 📊 **Coste DynamoDB Prod**: < $5/mes para el MVP inicial
- 📊 **Latencia escritura mensajes**: < 50ms p95 desde EU
- 📊 **Aislamiento de seguridad**: Las credenciales Dev no pueden operar sobre la tabla Prod (verificado por ARN en política IAM)
- 📊 **TTL funcionando**: Los ítems con `expiresAt` en el pasado son eliminados automáticamente por AWS

---

## Referencias

- **ADR relacionado**: [ADR-002 — Arquitectura DB Híbrida](./002-supabase-dynamodb.md) (decisión original de usar DynamoDB)
- **Políticas IAM**: [`infrastructure/iam/policy-adresles-app-dev.json`](../../infrastructure/iam/policy-adresles-app-dev.json)
- **Políticas IAM**: [`infrastructure/iam/policy-adresles-app-prod.json`](../../infrastructure/iam/policy-adresles-app-prod.json)
- **Script de validación**: [`infrastructure/scripts/validate-dynamodb-aws.ts`](../../infrastructure/scripts/validate-dynamodb-aws.ts)
- **Script de setup local**: [`infrastructure/scripts/setup-dynamodb.ts`](../../infrastructure/scripts/setup-dynamodb.ts) — lee `DYNAMODB_TABLE_NAME` del `.env` (por defecto `adresles-messages`)
- **AWS DynamoDB TTL**: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html
- **AWS IAM Least Privilege**: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#grant-least-privilege

---

## Notas de Revisión

### 2026-03-15: Implementación inicial

- Tablas creadas con `BillingMode: PAY_PER_REQUEST` y TTL en `expiresAt`
- IAM Users creados con Access Keys estáticas (pendiente migrar a IAM Roles cuando se use ECS)
- Validación end-to-end confirmada: escritura y lectura en ambas tablas desde la CLI del proyecto
- El usuario `Cursor-Deployer` (para operaciones de infraestructura) tiene permisos separados de los usuarios de aplicación

---

**Creado por**: Sergio  
**Última actualización**: 2026-03-15  
**Próxima revisión**: Al migrar a EC2/ECS (sustituir Access Keys por IAM Roles de instancia)
