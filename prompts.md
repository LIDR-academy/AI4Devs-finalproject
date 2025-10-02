Para la generación Aquí pongo los prompts usados para generar cada documento

1. mvp-requirements.md

Rol: Socio estratégico (🧠)
Contexto: Definir qué mínimo producto viable se debe construir en MailTuner para salir al mercado en menos de un mes.
Destinatario final: Equipo fundador y comité de producto.
Prompt:

Actúa como socio estratégico de un proyecto SaaS.  
Tu tarea es definir los requisitos mínimos para un MVP del producto MailTuner, que permite reescribir correos electrónicos en 1 clic según el tono elegido.  

1. Resume el objetivo del producto.  
2. Indica las funcionalidades mínimas obligatorias para lanzar en <30 días.  
3. Excluye funcionalidades avanzadas que no sean críticas.  
4. Entrega el resultado en formato claro, con secciones y listas.  

2. product-specs.md

Rol: Product Owner (📋)
Contexto: Especificar qué hará el producto, cómo se usará y cómo se verá a nivel de funcionalidades y flujos.
Destinatario final: Equipo técnico y de UI/UX.
Prompt:

Actúa como Product Owner.  
Debes crear las especificaciones de producto para MailTuner, un SaaS que mejora correos electrónicos ajustando su tono en un clic.  

1. Define los perfiles de usuario.  
2. Explica el flujo principal de uso (input de email, selección de tono, output reescrito).  
3. Lista las pantallas necesarias (ej. input de email, resultados, historial básico).  
4. Incluye reglas de negocio que aseguren coherencia del producto.  
5. Sé preciso y orientado a ejecución.  

3. technical-specs.md

Rol: CTO (🛠️)
Contexto: Traducir las necesidades de negocio en un plan técnico realista, con tecnologías, endpoints y despliegue.
Destinatario final: Equipo de desarrollo.
Prompt:

Actúa como CTO de un SaaS.  
Tu tarea es definir las especificaciones técnicas para el proyecto MailTuner.  

1. Selecciona el stack tecnológico adecuado (frontend, backend, hosting, integraciones).  
2. Describe la arquitectura general.  
3. Define los endpoints API necesarios (ej. /api/rewrite).  
4. Indica dependencias externas críticas (ej. API de ChatGPT, Redis para rate limiting, Sentry, PostHog).  
5. Propón cómo organizar el código y la carpeta /docs.  
6. Entrega el resultado en formato markdown, con secciones técnicas claras. 


Aclaración: Realizo 3 prompts mediante Github copilot con Claude Sonnet 4.

1r Prompt en modo "ask":
Como experto programador lee los documentos añadidos al contexto y consultame cualquier pregunta que puedas tener.


2º Prompt:
Rol:
Como senior programador

Contexto:
El sistema recibe un email original escrito por el usuario y debe reescribirlo en un tono específico elegido (ej. formal, claro, empático, persuasivo, cercano, etc.). El objetivo es entregar un mensaje mejorado pero que conserve el contenido y la intención original.

Destinatario final:
Usuarios de MailTuner (profesionales, freelancers, estudiantes, etc.) que necesitan mejorar y adaptar rápidamente sus correos electrónicos antes de enviarlos.

Realiza el proyecto siguiendo las instrucciones de los documentos generados.

Aclaración después de estar unos 20 minutos. Ha finalizado el desarrollo con éxito. La fase de testeo la he realizado manual y solo he detectado un funcionamiento anómalo. Algunas veces generaba el email de respuesta en ingles independientemente del idioma en que pusieses el mail.

3r Prompt:
El resultado del mail tratado por la IA, siempre lo está devolviendo en inglés, adapta el prompt que usa para que detecte el idioma que es y lo devuelva tratado con el tono pero en el mimso idioma que se envío el original.