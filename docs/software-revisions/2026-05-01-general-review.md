Hallazgos (solo alta / crítica, ordenados)
[ALTA] Falta de contrato de error homogéneo para 401/403 en el gateway.
En la configuración de seguridad no se define ServerAuthenticationEntryPoint ni ServerAccessDeniedHandler; se usa la configuración por defecto de oauth2ResourceServer().jwt(...). Eso deja el formato de error 401/403 al comportamiento por defecto de Spring Security, en vez de unificarlo explícitamente con el contrato API (ProblemDetail homogéneo), que es un requisito explícito en la regla backend para gateway. 
Además, en los tests de integración solo se valida el status code (401/403), no el cuerpo/headers del error contractual, por lo que esta desviación puede pasar inadvertida en CI. 

[ALTA] Hueco de pruebas sobre el enrutado/seguridad de ai-assistant-service (riesgo de regresión silenciosa).
El gateway publica ruta para /api/ai/**, pero las pruebas de integración no registran mtl.ai.uri ni ejercitan ningún caso de /api/ai/** (ni protegido con JWT ni comportamiento público/denegado). Esto deja sin cobertura de comportamiento crítico una ruta productiva del gateway (routing + seguridad). 





Media
Hallazgos (solo alta / crítica)
[ALTA] Falta validación de seguridad/autorización en integración real (riesgo alto de regresión en endpoints sensibles).
El servicio define reglas de seguridad importantes (público vs protegido por roles) para rutas de subida/confirmación/lectura de fotos, pero en integración solo existe un contextLoads(); no hay pruebas IT que validen 401/403, enforcement de roles, ni consistencia de respuestas de error en runtime. Esto deja sin red de seguridad la parte más crítica del servicio (control de acceso sobre operaciones de media). 
Además, los WebMvc tests desactivan filtros (addFilters = false), por lo que no sustituyen pruebas de seguridad reales del filtro chain. 





Incidencias altas/críticas (ordenadas)
[CRÍTICA] Inconsistencia del “punto único de entrada” en seguridad/contrato de error del API Gateway.
A nivel de arquitectura, el gateway debería consolidar políticas transversales (seguridad y forma de error hacia cliente), pero actualmente usa oauth2ResourceServer().jwt(...) sin handlers explícitos de 401/403 en WebFlux. Esto rompe la uniformidad contractual frente a microservicios que sí implementan Problem* handlers. Resultado: el cliente puede recibir formatos distintos según dónde se origine el rechazo, debilitando el rol arquitectónico del gateway como frontera homogénea. 

[ALTA] Riesgo operativo por falta de pruebas de integración de seguridad en media-service.
El servicio define reglas de autorización relevantes (público vs roles para subida/confirmación/lectura), pero su suite de integración no valida esas reglas en runtime (solo contextLoads). Arquitectónicamente, en un sistema distribuido con seguridad por JWT, esto deja una pieza crítica sin verificación de contrato de acceso entre capas y aumenta mucho el riesgo de regresión en despliegues. 