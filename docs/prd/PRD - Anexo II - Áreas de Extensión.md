Anexo - Áreas de Mejora y Extensiones Futuras del Core AI
---------------------------------------------------------

### 1. Objetivo

Este anexo recoge las funcionalidades previstas para futuras fases del proyecto TalentIA relacionadas con la evolución del **Core AI**, complementando la funcionalidad del MVP. Incluye casos de uso potenciales, recomendaciones técnicas para el modelo de datos y las APIs, y una propuesta de requisitos funcionales detallados.

* * *

### 2. Funcionalidades Futuras Previstas

#### 2.1. Matching Inverso desde Vacantes

*   Buscar candidatos en base a una vacante publicada.
    
*   Permitir sugerencias de perfiles adecuados en la base histórica del sistema.
    
*   Complementa el flujo actual que parte desde el candidato.
    

#### 2.2. Evaluación General de Candidatos (Fuera de Vacante)

*   Posibilidad de evaluar un CV sin necesidad de asociarlo a una vacante específica.
    
*   Útil para bolsa de talento, análisis de perfiles espontáneos o carga masiva de CVs.
    

#### 2.3. Calificación Manual de Candidaturas

*   Permitir a usuarios del sistema calificar subjetivamente una candidatura con estrellas (1 a 5).
    
*   Se complementa con el score de IA, añadiendo perspectiva humana explícita.
    

#### 2.4. Generación y Personalización de Pruebas Técnicas y Cuestionarios

*   Generación dinámica de tests para evaluar habilidades técnicas o competencias blandas.
    
*   Integración con bancos de preguntas internos o APIs de contenido.
    
*   Soporte para plantillas y adaptación por vacante.
    

#### 2.5. Evaluación Multivacante

*   Evaluar simultáneamente un mismo perfil contra múltiples vacantes abiertas.
    
*   Identificar mejor ajuste relativo entre varias oportunidades laborales.
    

* * *

### 3. Casos de Uso Potenciales

#### UC-F1: Buscar Candidatos Adecuados para una Vacante

**Actor:** Reclutador  
**Flujo:**
1.  Selecciona vacante.
    
2.  Solicita candidatos sugeridos.
    
3.  El sistema devuelve lista ordenada por score con candidatos anteriores ya evaluados.
    

#### UC-F2: Evaluar un CV de forma General

**Actor:** Reclutador / Sistema externo  
**Flujo:**
1.  Se sube un CV.
    
2.  El sistema devuelve una evaluación sin ligarlo a una vacante.
    

#### UC-F3: Asignar Calificación Estelar a una Candidatura

**Actor:** Reclutador / Manager  
**Flujo:**
1.  Accede al perfil de candidatura.
    
2.  Selecciona puntuación manual (1-5 estrellas).
    
3.  Se registra junto con el score de IA.
    

#### UC-F4: Generar Prueba Técnica Adaptada

**Actor:** Reclutador  
**Flujo:**
1.  Selecciona vacante.
    
2.  Solicita prueba técnica.
    
3.  El sistema genera contenido y lo presenta para revisión.
    

* * *

### 4. Recomendaciones en el Modelo de Datos

*   En `Candidatura`, añadir campo `calificacion_estrellas INT CHECK (1<=x<=5)`.
    
*   En `EvaluacionCandidatoIA`, permitir `NULL` en campos `vacante_ats_id` y `candidatura_ats_id` para evaluaciones generales.
    
*   Considerar entidad `PruebaTecnica` con atributos: `vacante_id`, `candidato_id`, `contenido`, `tipo`, `estado`, `resultado`.
    

* * *

### 5. Recomendaciones para APIs

*   Exponer un endpoint:
    *   `GET /suggested-candidates?job_id=XYZ`
        
    *   `POST /evaluate-cv` (evaluación general de CV sin vacante)
        
    *   `POST /technical-test` (generación de prueba por IA)
        
*   Añadir `rating` como campo editable en `PATCH /applications/:id`
    

* * *

### 6. Requisitos Funcionales Detallados (Extensión)

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RF-F1 | Evaluar CV sin vacante asociada | Alta |
| RF-F2 | Sugerir candidatos adecuados para una vacante | Alta |
| RF-F3 | Asignar calificación manual a candidatura | Media |
| RF-F4 | Generar prueba técnica basada en perfil de vacante | Media |
| RF-F5 | Asociar pruebas generadas y resultados por candidato | Media |
| RF-F6 | Evaluar candidato contra múltiples vacantes a la vez | Baja |

* * *

> Este anexo sirve como hoja de ruta técnica y funcional para la evolución del Core AI en fases posteriores a la Fase 1 de TalentIA.