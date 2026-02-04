# Canvas del Proceso Quirúrgico - Sistema Integrado

## 🎯 Diagrama Principal del Proceso Completo

```mermaid
flowchart TD
    START([🚀 INICIO<br/>Consulta Paciente]) --> AUTH[🔒 Autenticación MFA]
    AUTH --> REG[📋 Registro en HCE]
    
    REG --> HCE_DATA[📋 Recopilación Datos]
    HCE_DATA --> HCE1[Datos Demográficos]
    HCE_DATA --> HCE2[Antecedentes Médicos]
    HCE_DATA --> HCE3[Alergias/Medicación]
    HCE_DATA --> HCE4[Examen Físico]
    
    HCE1 --> INT[📋 Integración Sistemas]
    HCE2 --> INT
    HCE3 --> INT
    HCE4 --> INT
    
    INT --> LAB[Laboratorios]
    INT --> RAD[Radiología PACS]
    INT --> FARM[Farmacia]
    
    LAB --> ENCRYPT[🔒 Encriptación Datos]
    RAD --> ENCRYPT
    FARM --> ENCRYPT
    
    ENCRYPT --> STORE[📋 Almacenamiento Seguro]
    STORE --> AUDIT[🔒 Auditoría y Logging]
    
    AUDIT --> EVAL[🎯 Evaluación Preoperatoria]
    
    EVAL --> IMG[Análisis Imágenes]
    EVAL --> 3D[Reconstrucción 3D]
    EVAL --> RISK[Evaluación Riesgo]
    
    IMG --> COMPLIANCE[🔒 Validación Cumplimiento]
    3D --> COMPLIANCE
    RISK --> COMPLIANCE
    
    COMPLIANCE --> PLAN[🎯 Planificación Procedimiento]
    
    PLAN --> APPROACH[Selección Abordaje]
    PLAN --> SIM[Simulación 3D/VR]
    PLAN --> GUIDES[Diseño Guías]
    
    APPROACH --> CHECKLIST[🎯 Checklist WHO]
    SIM --> CHECKLIST
    GUIDES --> CHECKLIST
    
    CHECKLIST --> RESOURCES[Asignación Recursos]
    RESOURCES --> QUIR[Programación Quirófano]
    RESOURCES --> EQUIP[Equipamiento]
    RESOURCES --> STAFF[Personal]
    
    QUIR --> AUDIT2[🔒 Auditoría]
    EQUIP --> AUDIT2
    STAFF --> AUDIT2
    
    AUDIT2 --> PRE1[⏰ Pre-inducción]
    PRE1 --> PRE2[⏰ Pre-incisión]
    PRE2 --> SURGERY[⚕️ Procedimiento Quirúrgico]
    SURGERY --> POST[📝 Post-procedimiento]
    
    POST --> DOC[📋 Documentación Intraop]
    DOC --> AUDIT3[🔒 Auditoría]
    
    AUDIT3 --> FOLLOW[📊 Seguimiento Postop]
    FOLLOW --> NOTES[Notas Evolución]
    NOTES --> DISCHARGE[Alta Médica]
    
    DISCHARGE --> ARCHIVE[📋 Archivo HCE]
    ARCHIVE --> REPORTS[📈 Reportes]
    REPORTS --> END([✅ FIN])
    
    %% Estilos mejorados
    classDef hce fill:#4FC3F7,stroke:#0277BD,stroke-width:3px,color:#000
    classDef seguridad fill:#FFB74D,stroke:#E65100,stroke-width:3px,color:#000
    classDef planificacion fill:#BA68C8,stroke:#4A148C,stroke-width:3px,color:#000
    classDef proceso fill:#81C784,stroke:#1B5E20,stroke-width:3px,color:#000
    classDef inicio fill:#FFF176,stroke:#F57F17,stroke-width:3px,color:#000
    classDef fin fill:#F48FB1,stroke:#880E4F,stroke-width:3px,color:#000
    
    class REG,HCE_DATA,HCE1,HCE2,HCE3,HCE4,INT,LAB,RAD,FARM,STORE,DOC,ARCHIVE hce
    class AUTH,ENCRYPT,AUDIT,COMPLIANCE,AUDIT2,AUDIT3 seguridad
    class EVAL,IMG,3D,RISK,PLAN,APPROACH,SIM,GUIDES,CHECKLIST,RESOURCES,QUIR,EQUIP,STAFF planificacion
    class PRE1,PRE2,SURGERY,POST,FOLLOW,NOTES,DISCHARGE proceso
    class START inicio
    class END,REPORTS fin
```

## 📊 Canvas Visual - Vista de Matriz

```mermaid
graph TB
    subgraph MATRIZ["CANVAS DEL PROCESO QUIRÚRGICO"]
        subgraph FASE1["FASE 1: CONSULTA"]
            direction LR
            F1_HCE["📋 HCE<br/>━━━━━━━━<br/>• Registro Paciente<br/>• Antecedentes<br/>• Examen Físico"]
            F1_SEG["🔒 SEGURIDAD<br/>━━━━━━━━<br/>• Autenticación MFA<br/>• Control Acceso<br/>• Logging"]
            F1_PLAN["🎯 PLANIFICACIÓN<br/>━━━━━━━━<br/>• -"]
        end
        
        subgraph FASE2["FASE 2: EVALUACIÓN"]
            direction LR
            F2_HCE["📋 HCE<br/>━━━━━━━━<br/>• Integración Lab<br/>• Imágenes DICOM<br/>• Documentación"]
            F2_SEG["🔒 SEGURIDAD<br/>━━━━━━━━<br/>• Encriptación<br/>• Auditoría<br/>• Versiones"]
            F2_PLAN["🎯 PLANIFICACIÓN<br/>━━━━━━━━<br/>• Análisis Imágenes<br/>• Reconstrucción 3D<br/>• Evaluación Riesgo"]
        end
        
        subgraph FASE3["FASE 3: PLANIFICACIÓN"]
            direction LR
            F3_HCE["📋 HCE<br/>━━━━━━━━<br/>• Consentimiento<br/>• Notas Planificación"]
            F3_SEG["🔒 SEGURIDAD<br/>━━━━━━━━<br/>• Integridad Datos<br/>• Control Versiones"]
            F3_PLAN["🎯 PLANIFICACIÓN<br/>━━━━━━━━<br/>• Simulación 3D/VR<br/>• Guías Quirúrgicas<br/>• Checklist WHO"]
        end
        
        subgraph FASE4["FASE 4: CIRUGÍA"]
            direction LR
            F4_HCE["📋 HCE<br/>━━━━━━━━<br/>• Notas Tiempo Real<br/>• Procedimiento<br/>• Complicaciones"]
            F4_SEG["🔒 SEGURIDAD<br/>━━━━━━━━<br/>• Log Tiempo Real<br/>• No Repudio"]
            F4_PLAN["🎯 PLANIFICACIÓN<br/>━━━━━━━━<br/>• Navegación AR/VR<br/>• Guías Activas"]
        end
        
        subgraph FASE5["FASE 5: POSTOPERATORIO"]
            direction LR
            F5_HCE["📋 HCE<br/>━━━━━━━━<br/>• Evolución<br/>• Complicaciones<br/>• Medicación"]
            F5_SEG["🔒 SEGURIDAD<br/>━━━━━━━━<br/>• Retención Datos<br/>• Acceso Controlado"]
            F5_PLAN["🎯 PLANIFICACIÓN<br/>━━━━━━━━<br/>• -"]
        end
        
        subgraph FASE6["FASE 6: ALTA"]
            direction LR
            F6_HCE["📋 HCE<br/>━━━━━━━━<br/>• Plan Alta<br/>• Instrucciones<br/>• Historial Completo"]
            F6_SEG["🔒 SEGURIDAD<br/>━━━━━━━━<br/>• Exportación Segura<br/>• Backup<br/>• GDPR"]
            F6_PLAN["🎯 PLANIFICACIÓN<br/>━━━━━━━━<br/>• -"]
        end
    end
    
    FASE1 --> FASE2
    FASE2 --> FASE3
    FASE3 --> FASE4
    FASE4 --> FASE5
    FASE5 --> FASE6
    
    classDef hceBox fill:#4FC3F7,stroke:#0277BD,stroke-width:2px
    classDef segBox fill:#FFB74D,stroke:#E65100,stroke-width:2px
    classDef planBox fill:#BA68C8,stroke:#4A148C,stroke-width:2px
    
    class F1_HCE,F2_HCE,F3_HCE,F4_HCE,F5_HCE,F6_HCE hceBox
    class F1_SEG,F2_SEG,F3_SEG,F4_SEG,F5_SEG,F6_SEG segBox
    class F1_PLAN,F2_PLAN,F3_PLAN,F4_PLAN,F5_PLAN,F6_PLAN planBox
```

## ⏱️ Timeline del Proceso Quirúrgico

```mermaid
gantt
    title Timeline del Proceso Quirúrgico Integrado
    dateFormat X
    axisFormat %s
    
    section 📋 HCE
    Registro Paciente           :0, 1
    Recopilación Datos          :1, 2
    Integración Sistemas        :2, 3
    Documentación Preop         :3, 4
    Notas Intraoperatorias      :8, 2
    Seguimiento Postop          :10, 3
    Alta y Archivo              :13, 2
    
    section 🔒 Seguridad
    Autenticación               :0, 1
    Control Acceso              :1, 1
    Encriptación Datos          :2, 8
    Auditoría Continua          :0, 15
    Validación Cumplimiento     :4, 2
    Backup Automático           :0, 15
    
    section 🎯 Planificación
    Evaluación Preop            :3, 2
    Análisis Imágenes           :3, 2
    Reconstrucción 3D           :4, 2
    Simulación                  :5, 1
    Guías Quirúrgicas           :5, 1
    Checklist WHO               :6, 1
    Asignación Recursos         :6, 1
    
    section ⚕️ Procedimiento
    Pre-inducción               :7, 1
    Pre-incisión                :7, 1
    Procedimiento Quirúrgico    :8, 2
    Post-procedimiento          :10, 1
```

## 🔄 Diagrama de Interacción entre Áreas

```mermaid
graph TB
    subgraph CENTRAL["PROCESO QUIRÚRGICO"]
        PROC[⚕️ Procedimiento Quirúrgico]
    end
    
    subgraph HCE_AREA["📋 HISTORIA CLÍNICA ELECTRÓNICA"]
        HCE1[Registro Paciente]
        HCE2[Datos Clínicos]
        HCE3[Imágenes Médicas]
        HCE4[Documentación]
        HCE5[Historial Completo]
    end
    
    subgraph PLAN_AREA["🎯 PLANIFICACIÓN QUIRÚRGICA"]
        PLAN1[Análisis Preop]
        PLAN2[Reconstrucción 3D]
        PLAN3[Simulación]
        PLAN4[Guías Quirúrgicas]
        PLAN5[Checklist WHO]
    end
    
    subgraph SEG_AREA["🔒 SEGURIDAD Y CUMPLIMIENTO"]
        SEG1[Autenticación]
        SEG2[Encriptación]
        SEG3[Auditoría]
        SEG4[Control Acceso]
        SEG5[Cumplimiento]
    end
    
    %% Flujos HCE
    HCE1 --> HCE2
    HCE2 --> HCE3
    HCE3 --> PLAN1
    HCE2 --> PLAN1
    HCE4 --> PROC
    PROC --> HCE5
    
    %% Flujos Planificación
    PLAN1 --> PLAN2
    PLAN2 --> PLAN3
    PLAN3 --> PLAN4
    PLAN4 --> PLAN5
    PLAN5 --> PROC
    
    %% Flujos Seguridad (transversal)
    SEG1 --> HCE1
    SEG1 --> PLAN1
    SEG2 --> HCE2
    SEG2 --> PLAN2
    SEG3 --> HCE4
    SEG3 --> PROC
    SEG4 --> HCE1
    SEG4 --> PLAN1
    SEG5 --> HCE5
    
    %% Conexiones bidireccionales
    HCE3 -.->|Datos| PLAN2
    PLAN4 -.->|Guías| PROC
    PROC -.->|Resultados| HCE4
    
    classDef hce fill:#4FC3F7,stroke:#0277BD,stroke-width:2px
    classDef plan fill:#BA68C8,stroke:#4A148C,stroke-width:2px
    classDef seg fill:#FFB74D,stroke:#E65100,stroke-width:2px
    classDef proc fill:#81C784,stroke:#1B5E20,stroke-width:3px
    
    class HCE1,HCE2,HCE3,HCE4,HCE5 hce
    class PLAN1,PLAN2,PLAN3,PLAN4,PLAN5 plan
    class SEG1,SEG2,SEG3,SEG4,SEG5 seg
    class PROC proc
```

## Canvas Detallado por Fases

### FASE 1: CONSULTA Y REGISTRO INICIAL

```mermaid
graph LR
    subgraph ACTORES["👥 ACTORES"]
        P1[Paciente]
        C1[Cirujano]
        E1[Enfermería]
    end
    
    subgraph HCE["📋 HCE"]
        H1[Registro Paciente]
        H2[Historia Clínica]
        H3[Antecedentes]
    end
    
    subgraph SEG["🔒 SEGURIDAD"]
        S1[Login MFA]
        S2[Verificación Identidad]
        S3[Permisos RBAC]
        S4[Log Acceso]
    end
    
    P1 -->|Consulta| C1
    C1 -->|Autenticación| S1
    S1 -->|Verificación| S2
    S2 -->|Autorización| S3
    S3 -->|Acceso| H1
    H1 -->|Registro| H2
    H2 -->|Datos| H3
    H3 -->|Auditoría| S4
    E1 -->|Apoyo| C1
```

### FASE 2: EVALUACIÓN Y PLANIFICACIÓN

```mermaid
graph TB
    subgraph INPUT["📥 ENTRADAS"]
        I1[Imágenes DICOM]
        I2[Resultados Lab]
        I3[Examen Físico]
    end
    
    subgraph PLAN["🎯 PLANIFICACIÓN"]
        P1[Análisis Imágenes]
        P2[Reconstrucción 3D]
        P3[Simulación]
        P4[Guías Quirúrgicas]
        P5[Checklist WHO]
    end
    
    subgraph HCE2["📋 HCE"]
        H1[Documentación Preop]
        H2[Consentimiento]
        H3[Notas Planificación]
    end
    
    subgraph SEG2["🔒 SEGURIDAD"]
        S1[Encriptación Datos]
        S2[Control Versiones]
        S3[Auditoría Cambios]
    end
    
    I1 --> P1
    I2 --> P1
    I3 --> P1
    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 --> P5
    P5 --> H1
    H1 --> H2
    H2 --> H3
    H3 --> S1
    S1 --> S2
    S2 --> S3
```

### FASE 3: PROCEDIMIENTO QUIRÚRGICO

```mermaid
graph LR
    subgraph PRE["⏰ PRE-QUIRÚRGICO"]
        P1[Checklist Pre-inducción]
        P2[Checklist Pre-incisión]
    end
    
    subgraph DURANTE["⚕️ DURANTE CIRUGÍA"]
        D1[Procedimiento]
        D2[Documentación Tiempo Real]
        D3[Navegación AR/VR]
    end
    
    subgraph POST["📝 POST-QUIRÚRGICO"]
        PO1[Checklist Final]
        PO2[Documentación Completa]
        PO3[Conteo Instrumentos]
    end
    
    subgraph HCE3["📋 HCE"]
        H1[Notas Intraoperatorias]
        H2[Procedimiento Realizado]
        H3[Complicaciones]
    end
    
    subgraph SEG3["🔒 SEGURIDAD"]
        S1[Log Tiempo Real]
        S2[Integridad Datos]
        S3[No Repudio]
    end
    
    P1 --> D1
    P2 --> D1
    D1 --> D2
    D1 --> D3
    D2 --> PO1
    D3 --> PO1
    PO1 --> PO2
    PO2 --> PO3
    PO3 --> H1
    H1 --> H2
    H2 --> H3
    H3 --> S1
    S1 --> S2
    S2 --> S3
```

### FASE 4: SEGUIMIENTO Y ALTA

```mermaid
graph TB
    subgraph SEGUIMIENTO["📊 SEGUIMIENTO"]
        S1[Evolución Diaria]
        S2[Complicaciones]
        S3[Medicación]
        S4[Pruebas Postop]
    end
    
    subgraph HCE4["📋 HCE"]
        H1[Notas Evolución]
        H2[Plan Alta]
        H3[Instrucciones]
        H4[Historial Completo]
    end
    
    subgraph SEG4["🔒 SEGURIDAD"]
        S5[Retención Datos]
        S6[Acceso Paciente]
        S7[Exportación Segura]
        S8[Backup Automático]
    end
    
    subgraph REPORTES["📈 REPORTES"]
        R1[Estadísticas]
        R2[Calidad]
        R3[Investigación]
    end
    
    S1 --> H1
    S2 --> H1
    S3 --> H1
    S4 --> H1
    H1 --> H2
    H2 --> H3
    H3 --> H4
    H4 --> S5
    S5 --> S6
    S6 --> S7
    S7 --> S8
    H4 --> R1
    R1 --> R2
    R2 --> R3
```

## Matriz de Integración de Áreas

| Fase del Proceso | HCE | Planificación Quirúrgica | Seguridad y Cumplimiento |
|-----------------|-----|-------------------------|-------------------------|
| **Consulta Inicial** | Registro paciente, antecedentes, examen físico | - | Autenticación, control de acceso, logging |
| **Evaluación Preop** | Integración lab/radiología, documentación | Análisis imágenes, evaluación riesgo | Encriptación datos, auditoría cambios |
| **Planificación** | Consentimiento, notas planificación | Reconstrucción 3D, simulación, guías | Control versiones, integridad datos |
| **Pre-quirúrgico** | Checklist preop en HCE | Checklist WHO, asignación recursos | Logging acceso, verificación identidad |
| **Intraoperatorio** | Notas tiempo real, procedimiento | Navegación AR/VR, guías | Log tiempo real, no repudio |
| **Postoperatorio** | Evolución, complicaciones, medicación | - | Retención datos, acceso controlado |
| **Alta y Seguimiento** | Plan alta, instrucciones, historial completo | - | Exportación segura, backup, cumplimiento GDPR |

## Puntos Críticos de Integración

### 1. **Punto de Integración HCE ↔ Planificación**
- **Momento**: Evaluación preoperatoria
- **Datos compartidos**: Imágenes médicas, antecedentes, evaluación de riesgo
- **Seguridad**: Encriptación en tránsito, control de acceso granular

### 2. **Punto de Integración Planificación ↔ Seguridad**
- **Momento**: Generación de guías y simulación
- **Datos compartidos**: Modelos 3D, planificación quirúrgica
- **Seguridad**: Integridad de datos, control de versiones, auditoría

### 3. **Punto de Integración HCE ↔ Seguridad**
- **Momento**: Todo el proceso
- **Datos compartidos**: Toda la información del paciente
- **Seguridad**: Encriptación, logging, cumplimiento normativo

## Métricas y KPIs del Proceso

### Métricas de HCE
- Tiempo de registro de datos
- Completitud de historias clínicas
- Tasa de integración con sistemas externos
- Disponibilidad del sistema

### Métricas de Planificación
- Tiempo de planificación preoperatoria
- Precisión de simulaciones
- Reducción de complicaciones
- Tiempo quirúrgico vs planificado

### Métricas de Seguridad
- Tiempo de respuesta a incidentes
- Tasa de accesos no autorizados detectados
- Cumplimiento de normativas (%)
- Disponibilidad de backups

## Flujo de Datos y Seguridad

```mermaid
graph TB
    subgraph CAPA_PRESENTACION["Capa de Presentación"]
        UI[Interfaz de Usuario]
    end
    
    subgraph CAPA_APLICACION["Capa de Aplicación"]
        API[API REST]
        AUTH[Servicio Autenticación]
        RBAC[Control de Acceso]
    end
    
    subgraph CAPA_NEGOCIO["Capa de Negocio"]
        HCE_SVC[Servicio HCE]
        PLAN_SVC[Servicio Planificación]
        AUDIT_SVC[Servicio Auditoría]
    end
    
    subgraph CAPA_DATOS["Capa de Datos"]
        DB[(Base de Datos<br/>Encriptada)]
        CACHE[(Cache Redis)]
        STORAGE[Almacenamiento<br/>Imágenes]
    end
    
    subgraph SEGURIDAD["🔒 Seguridad Transversal"]
        ENCRYPT[Encriptación TLS 1.3]
        LOG[Logging Centralizado]
        BACKUP[Backup Automático]
    end
    
    UI -->|HTTPS| ENCRYPT
    ENCRYPT --> API
    API --> AUTH
    AUTH --> RBAC
    RBAC --> HCE_SVC
    RBAC --> PLAN_SVC
    HCE_SVC --> AUDIT_SVC
    PLAN_SVC --> AUDIT_SVC
    AUDIT_SVC --> LOG
    HCE_SVC --> DB
    PLAN_SVC --> DB
    HCE_SVC --> CACHE
    PLAN_SVC --> STORAGE
    DB --> BACKUP
    STORAGE --> BACKUP
```

## 📐 Canvas Visual Simplificado - Vista de Proceso

```mermaid
flowchart LR
    subgraph IN["ENTRADA"]
        PAC[👤 Paciente]
    end
    
    subgraph PROC["PROCESO"]
        subgraph HCE_LAYER["📋 CAPA HCE"]
            H1[Registro]
            H2[Datos]
            H3[Documentación]
        end
        
        subgraph PLAN_LAYER["🎯 CAPA PLANIFICACIÓN"]
            P1[Evaluación]
            P2[3D/Simulación]
            P3[Guías]
        end
        
        subgraph SEG_LAYER["🔒 CAPA SEGURIDAD"]
            S1[Autenticación]
            S2[Encriptación]
            S3[Auditoría]
        end
        
        subgraph QUIR["⚕️ CIRUGÍA"]
            Q1[Procedimiento]
        end
    end
    
    subgraph OUT["SALIDA"]
        RES[📊 Resultados]
        REP[📈 Reportes]
    end
    
    PAC --> H1
    H1 --> S1
    S1 --> H2
    H2 --> P1
    P1 --> S2
    S2 --> P2
    P2 --> P3
    P3 --> S3
    S3 --> H3
    H3 --> Q1
    Q1 --> RES
    RES --> REP
    
    classDef hce fill:#4FC3F7,stroke:#0277BD,stroke-width:2px
    classDef plan fill:#BA68C8,stroke:#4A148C,stroke-width:2px
    classDef seg fill:#FFB74D,stroke:#E65100,stroke-width:2px
    classDef quir fill:#81C784,stroke:#1B5E20,stroke-width:2px
    classDef io fill:#FFF176,stroke:#F57F17,stroke-width:2px
    
    class H1,H2,H3 hce
    class P1,P2,P3 plan
    class S1,S2,S3 seg
    class Q1 quir
    class PAC,RES,REP io
```

## 🎨 Canvas de Integración - Vista de Capas

```mermaid
graph TB
    subgraph LAYER1["🔒 CAPA 1: SEGURIDAD (Transversal)"]
        SEC1[Autenticación MFA]
        SEC2[Control Acceso RBAC]
        SEC3[Encriptación TLS/AES]
        SEC4[Auditoría y Logging]
        SEC5[Cumplimiento GDPR/LOPD]
    end
    
    subgraph LAYER2["📋 CAPA 2: HISTORIA CLÍNICA ELECTRÓNICA"]
        HCE1[Registro y Gestión Paciente]
        HCE2[Integración Sistemas Externos]
        HCE3[Documentación Clínica]
        HCE4[Almacenamiento Seguro]
    end
    
    subgraph LAYER3["🎯 CAPA 3: PLANIFICACIÓN QUIRÚRGICA"]
        PLAN1[Análisis y Evaluación]
        PLAN2[Visualización 3D/AR/VR]
        PLAN3[Simulación y Guías]
        PLAN4[Checklist y Recursos]
    end
    
    subgraph LAYER4["⚕️ CAPA 4: PROCESO QUIRÚRGICO"]
        PROC1[Pre-operatorio]
        PROC2[Intra-operatorio]
        PROC3[Post-operatorio]
    end
    
    LAYER1 -.->|Protege| LAYER2
    LAYER1 -.->|Protege| LAYER3
    LAYER1 -.->|Protege| LAYER4
    
    LAYER2 -->|Alimenta| LAYER3
    LAYER3 -->|Guía| LAYER4
    LAYER4 -->|Documenta| LAYER2
    
    classDef layer1 fill:#FFB74D,stroke:#E65100,stroke-width:3px
    classDef layer2 fill:#4FC3F7,stroke:#0277BD,stroke-width:3px
    classDef layer3 fill:#BA68C8,stroke:#4A148C,stroke-width:3px
    classDef layer4 fill:#81C784,stroke:#1B5E20,stroke-width:3px
    
    class LAYER1,SEC1,SEC2,SEC3,SEC4,SEC5 layer1
    class LAYER2,HCE1,HCE2,HCE3,HCE4 layer2
    class LAYER3,PLAN1,PLAN2,PLAN3,PLAN4 layer3
    class LAYER4,PROC1,PROC2,PROC3 layer4
```

## Conclusión

Este canvas muestra cómo las tres áreas (HCE, Planificación Quirúrgica y Seguridad) se integran a lo largo de todo el proceso quirúrgico, desde la consulta inicial hasta el alta y seguimiento, garantizando:

1. **Trazabilidad completa** del proceso
2. **Seguridad en cada etapa** del flujo
3. **Planificación precisa** basada en datos completos
4. **Cumplimiento normativo** en todo momento
5. **Eficiencia operativa** mediante integración de sistemas

### 📌 Notas para Visualización

Los diagramas están diseñados para visualizarse en:
- **GitHub/GitLab**: Los diagramas Mermaid se renderizan automáticamente
- **VS Code**: Con extensión "Markdown Preview Mermaid Support"
- **Herramientas online**: [Mermaid Live Editor](https://mermaid.live/)
- **Documentación**: Cualquier visor de Markdown con soporte Mermaid

### 🎯 Leyenda de Colores

- 🔵 **Azul**: Historia Clínica Electrónica (HCE)
- 🟣 **Morado**: Planificación Quirúrgica
- 🟠 **Naranja**: Seguridad y Cumplimiento
- 🟢 **Verde**: Proceso Quirúrgico
- 🟡 **Amarillo**: Puntos de Entrada/Salida
