# Estado de los tickets de planificación (según readme §6)

Resumen de lo **implementado** y lo **pendiente** según los criterios de aceptación de cada ticket.

---

## Backend

### Ticket 1: Autenticación con MFA
- **Hecho**: Login (dev + JWT), guards, refresh, logout. No Keycloak completo en Docker.
- **Pendiente**: MFA real con Keycloak (TOTP), configuración Keycloak en Docker, tests >85%.

### Ticket 2: HCE - Registro de pacientes
- **Hecho**: Entidades, CRUD, búsqueda, encriptación SSN, auditoría, tests; **validación duplicados SSN**: en create (BadRequest si ya existe) y en update (excluye al propio paciente); **cobertura >80%**: hce.service.spec.ts con 27 tests (createPatient, findPatientById, updatePatient con SSN mismo/otro paciente, searchPatients, deletePatient, addAllergy, addMedication, updateMedicalRecord, updateAllergy, deleteAllergy, updateMedication, deleteMedication, getPatientMedicalHistory), cobertura hce.service.ts ~91% statements / 96% lines.
- **Pendiente**: (ninguno)

### Ticket 3: Integración HL7, DICOM
- **Hecho**: Módulo integration, OrthancService, HL7Service, sync DICOM a paciente.
- **Pendiente**: Webhook laboratorio, sync automática programada, farmacia, tests de integración, logging explícito de integraciones.

### Ticket 4: Planificación quirúrgica
- **Hecho**: Surgery, SurgicalPlanning, DICOMImage, endpoints, DicomAnalysisService, scores de riesgo.
- **Pendiente**: Reconstrucción 3D real, simulación quirúrgica completa, generación de guías, tests >75%.

### Ticket 5: Checklist WHO
- **Hecho**: Entidad Checklist, fases pre-inducción/pre-incisión/post-procedimiento, endpoints, validación, alertas ítems faltantes, tests; **historial de checklists**: tabla `checklist_versions`, migración CreateChecklistVersionsTable, snapshot en cada actualización de fase o al completar, GET /planning/surgeries/:surgeryId/checklist/history (lista de versiones, más reciente primero), tests getChecklistHistory.
- **Pendiente**: (opcional) Optimización para tablet, tests E2E.

### Ticket 6: Gestión de recursos quirúrgicos
- **Hecho**: OperatingRoom (en planning), validación de conflictos, calendario, módulo resources (Equipment, StaffAssignment), **notificaciones de confirmación**: módulo `notifications`, tabla `notifications`, al asignar personal a una cirugía se crea una notificación para el usuario asignado (título "Asignación a cirugía", mensaje con procedimiento y rol). API `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`. **Tests**: `notifications.service.spec.ts`, `resources.service.spec.ts` (staff assignments + equipment).
- **Pendiente**: (opcional) Tests E2E de asignación de personal desde la UI.

### Ticket 7: Documentación intraoperatoria
- **Hecho**: WebSockets, entidad Documentation, servicio, gateway, auto-guardado, endpoints, find-or-create; **historial de cambios (versionado)**: tabla `documentation_versions`, migración CreateDocumentationVersionsTable, snapshot en cada update/updateField, GET /documentation/:id/versions (lista de versiones), GET /documentation/:id/history (cambios campo a campo), tests getVersionHistory.
- **Pendiente**: (opcional) Tests E2E del flujo documentación.

### Ticket 8: Seguimiento postoperatorio y alta
- **Hecho**: PostopEvolution, DischargePlan, CRUD, PDF plan de alta, alertas complicaciones; tests getComplicationsAlerts; criterios documentados en followup/README.md; **criterios concretos de alertas**: ALERTAS-CRITERIOS.md (definición, origen, consulta, alcance, uso en UI, tests); **cobertura**: followup.service.spec.ts con 23 tests (createEvolution con fecha ISO con hora, getEvolutionsBySurgery, getEvolutionById, getComplicationsAlerts, createOrUpdateDischargePlan, getDischargePlanBySurgery, finalizeDischargePlan, generateDischargePlanFromSurgery, getDischargePlanPdfBuffer).
- **Pendiente**: (opcional) Alertas automáticas por umbrales si se exigen en el futuro.

---

## Frontend

### Ticket 9: Autenticación y dashboard
- **Hecho**: Login (dev), React Router, rutas protegidas, Dashboard con datos reales (cirugías, pacientes, checklists pendientes, planificaciones), logout.
- **Pendiente**: Integración Keycloak real, MFA en UI, widgets por rol más granulares.

### Ticket 10: HCE - Registro de pacientes
- **Hecho**: PatientList, PatientForm, PatientDetail, búsqueda/listado; formulario antecedentes (MedicalHistoryForm), gestión alergias/medicación (PatientAllergies, PatientMedications), vista historia clínica completa unificada (PatientFullHistory, /hce/patients/:id/full-history).
- **Pendiente**: (ninguno)

### Ticket 11: Visualizador 3D
- **Hecho**: DicomViewer3D, Planning3DViewer, integración con planificación; modo oscuro; panel de simulación; **herramientas de medición**: raycasting (click en plano/malla), dos puntos, línea y etiqueta en mm, botón borrar; **optimización**: gl powerPreference high-performance, pixelRatio limitado, esferas de baja resolución; **tests**: Planning3DViewer.spec.tsx (5), DicomViewer3D.spec.tsx (3).
- **Pendiente**: (opcional) Mediciones adicionales (ángulo), optimización FPS medida en dispositivos reales.

### Ticket 12: Checklist WHO
- **Hecho**: ChecklistPage, ChecklistListPage, tres fases, validación visual, enlace desde cirugía; **historial en UI**: filtros (Todos / Historial completados / En progreso / Sin iniciar), fecha de completado en listado, orden por completado (más reciente primero); **optimización tablet**: áreas táctiles ≥44px (botones fase, checkbox ítems, Volver, filtros, enlaces), touch-manipulation, min-height en filas y cards; **tests unitarios**: ChecklistPage.spec.tsx (6 tests), ChecklistListPage.spec.tsx (6 tests).
- **Pendiente**: (opcional) Tests E2E del checklist.

### Ticket 13: Documentación intraoperatoria
- **Hecho**: DocumentationPage, DocumentationEditor, VoiceInput (Web Speech API), WebSockets, auto-guardado, indicadores de estado; **optimización móvil/tablet**: áreas táctiles ≥44px, layout responsivo (cabecera y estado apilables), pestañas con scroll horizontal, grid 1 col móvil; **documentado** en TESTING.md (sección "Documentación intraoperatoria – Uso en móvil/tablet"); **tests** documentation.service.spec.ts (getBySurgeryId, update, create, complete).
- **Pendiente**: (opcional) Tests E2E del flujo documentación.

### Ticket 14: Base de datos
- **Hecho**: Migraciones idempotentes (HCE, Planning, Checklists, Followup, Documentations), seeds, orden documentado, documentación de esquema (docs/database-schema.md), pasos de verificación del rollback documentados.
- **Pendiente**: Migraciones de índices/triggers adicionales si se exigen.

---

## Resumen de lo que FALTA (priorizable)

| Área | Pendiente principal |
|------|----------------------|
| **Ticket 6** | Equipment, StaffAssignment, módulo Resources, notificaciones |
| **Ticket 3** | Completado: webhook lab, sync programada, farmacia, logging, tests |
| **Ticket 4** | Guías quirúrgicas implementadas; pend. 3D real, simulación completa |
| **Ticket 10** | Completado (antecedentes, alergias, medicación, historia unificada) |
| **Ticket 11** | Completado: medición 3D (distancia, línea, mm), optimización gl, tests |
| **Ticket 1 / 9** | Keycloak + MFA completo (login dev ya cubre flujo básico) |
| **Ticket 14** | Rollback documentado y pasos de verificación en docs/database-schema.md |

---

*Documento generado a partir de la sección 6 (Tickets de trabajo) del readme.md. Última revisión según estado del código actual.*
