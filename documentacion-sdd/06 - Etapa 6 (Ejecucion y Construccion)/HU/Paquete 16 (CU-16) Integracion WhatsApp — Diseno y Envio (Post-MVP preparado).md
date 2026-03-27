# Etapa 6 — Paquete 16 (CU-16) Integracion WhatsApp — Diseno y Envio (Post-MVP preparado)

## Metadata
- Etapa 6 — Ejecucion y Construccion (IA-First)
- Paquete 16
- Caso de uso CU-16 Integracion WhatsApp (EnvioRespuesta)
- Alcance Post-MVP (disenado y preparado; implementacion parcial opcional)
- Dependencias Paquetes 05 (mensajes), 08 (cierre), 09 (encuestas), 14 (idempotencia)

---

## Caso de Uso — CU-16 Integracion WhatsApp (Envio y Respuesta)

### Objetivo
Disenar y dejar preparado el sistema para operar WhatsApp desde la plataforma, de modo que
- los solicitantes escriban por WhatsApp
- los usuarios internos respondan desde la UI
- los mensajes queden trazados como mensajes del caso
- se reutilice idempotencia, auditoria y no reapertura

 Nota En MVP solo se documenta y prepara. La ejecucion puede activarse cuando exista proveedor y numero.

### Actor(es)
- Actor primario Solicitante externo (WhatsApp)
- Actor secundario Sistema (Integrador WhatsApp)
- Actor secundario Usuario interno

### Disparadores
- Mensaje entrante por WhatsApp
- Respuesta del agente desde la UI

### Precondiciones
- Existe 1 numero WhatsApp para todas las areas.
- Existe proveedor (ej WhatsApp Business API  proveedor local).
- Reglas de negocio ya definidas
  - 1 caso activo por contacto (WhatsApp)
  - caso cerrado no se reabre
  - correlacion por contactohilo

---

## Flujos (diseno)

### Flujo A — Mensaje entrante (WhatsApp → Caso)
1. Proveedor recibe mensaje y llama webhook del sistema.
2. Sistema valida firmawebhook.
3. Sistema aplica idempotencia (id_externo).
4. Determina contacto por telefono.
5. Reglas
   - Si contacto tiene 1 caso activo → agregar mensaje a ese caso.
   - Si no tiene caso activo o ultimo caso esta cerrado → crear caso nuevo.
6. Registra mensaje
   - canal = whatsapp
   - origen = solicitante
7. Actualiza `fecha_ultima_actividad`.

### Flujo B — Respuesta del agente (UI → WhatsApp)
1. Agente responde desde UI (Paquete 05).
2. Sistema detecta canal whatsapp.
3. Envia mensaje via proveedor.
4. Registra mensaje como
   - canal = whatsapp
   - origen = agente
   - id_externo del proveedor

---

## Historias de Usuario asociadas

### HU-16 — Operar WhatsApp desde la plataforma (media)
Como agente  
Quiero responder WhatsApp desde la plataforma  
Para no depender del celular y mantener trazabilidad.

#### Criterios de aceptacion (diseño)
- Mensajes WhatsApp se ven como mensajes del caso.
- Respuestas desde UI se envian por WhatsApp.
- No se reabren casos cerrados.

---

## Tickets de trabajo (= 4 horas cu) — solo disenopreparacion

### T6-101 — Definir contrato proveedor WhatsApp (Documento)
Objetivo Definir API esperada del proveedor.  
Alcance
- webhook entrante (payload)
- endpoint envio mensaje
- id_externo
Entregable doc md en repo
Pruebas na

---

### T6-102 — Adaptador WhatsApp (interfaz + mock) (Laravel)
Objetivo Desacoplar proveedor.  
Alcance
- interfaz `WhatsAppClient`
- implementacion mock
Pruebas unit test mock

---

### T6-103 — Modelo de correlacion por contacto (WhatsApp) (Laravel)
Objetivo Preparar regla 1 caso activo por contacto.  
Alcance
- helper
  - buscar caso activo por telefono
- documentar diferencia con correo
Pruebas unit test

---

### T6-104 — Reglas de idempotencia WhatsApp (Laravel)
Objetivo Reutilizar `integracion_consumo`.  
Alcance
- integracion = whatsapp
- id_externo proveedor
Pruebas unit test

---

### T6-105 — UI indicador de canal WhatsApp (Angular)
Objetivo Diferenciar mensajes WhatsApp.  
Alcance
- iconolabel canal
Pruebas manual

---

## Priorizacion
- No bloquea MVP
- Implementar solo cuando
  - proveedor confirmado
  - numero activo
  - permisos legales listos

---

## Nota de alcance
- WhatsApp queda diseñado y listo, no activo.
- Evita retrabajo futuro.
- Reglas ya validadas con negocio.

---

## Listo para Cursor + spec-kit
- Pedir solo interfaces + mocks.
- Prohibir integracion real hasta decision formal.
