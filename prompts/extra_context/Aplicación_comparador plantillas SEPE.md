

# **Aplicación: comparador plantillas SEPE** 

## ***Objetivo del proyecto:*** 

Construir una aplicación que permita detectar los cambios de las plantillas de contratos del instuto nacional de empleo (SEPE: (https://sepe.es/HomeSepe/empresas/Contratos-de-trabajo/modelos-contrato.html)), y automatizar los cambios necesarios para aplicar estos cambios en nuestro sofware HR Access.

## ***La aplicación debe:*** 

El desarrollo será iterativo con las siguientes features (cada feature se desarrollará de forma secuencial):

1\. Comparar dos plantillas de documentos y analizar las diferencias en estructura del texto y en el formulario AcroForm (inspeccionar estructura en el documento [CIND-2509-CAS-C-unlock.pdf](CIND-2509-CAS-C-unlock.pdf)) , presentar estas diferencias de forma visual. Adjunto un documento para analizar la estructura  
1.1 el usuario dispondrá de una interfaz para cargar estos documentos y ejecutar la comparación  
1.2 analizar las diferencias  
1.3 presentar al usuario estas diferencias de modo visual

2\. Contener una base de datos que permita catalogar estas plantillas e ir generando un histórico con un informe de las comparativas

3\. En la aplicación productiva existe un json de mapeo que indica cómo se debe rellenar cada campo del formulario (este json hace un match entre cada campo del documento acroform con un campo de base de datos de empleados o una función de cálculo cuando no es posible obtener el dato directamente de bbdd)  
 3.1 guardar en bbdd el json correspondiente de cada plantilla de contrato  
 3.2 en la comparativa tener el cuenta este fichero para presentar al usuario los campos del formulario afectados   
 3.3 modificar el json para que se adapte a los nuevos formatos   
 3.4 elaborar tests que permitan validar los cambios

4\. Función para scrapear directamente la web del sepe, buscar las plantillas de documentos y hacer una comparación con la plantilla vigente en el sistema local reportando un informe por email 

No considerar:  
De memento no es relevante la gestión de permisos: es una herramienta de uso interno para los arquitectos de producto

## ***Stack Tecnológico***

\- Considerar el stack clásico de la compañía: React para el front y java para el back y bbdd postgress.    
\- Evaluar otros stacks tecnológicos como python si fueran más optimos (ten en cuenta que no es necesario que la aplicación sea escalable el numero de usuarios será pequeño).   
	\- En este caso la velocidad del obtener un minimo producto viable es el objetivo  
\- Valorar también el uso de LLMs con RAG si el esfuerzo no es mucho mayor que las alternativas “tradicionales”, si usamos RAG es obligatorio conseguir una salida determinista:  
	\- Teniendo en cuenta que el objetivo de la aplicación es comparar plantillas de documentos acroform y detectar y mostrar las diferencias, y en una segunda fase, modificar los ficheros json que sirven para cumplimentar estas plantillas para adaptar los cambios legales   
\- ¿Sería una buena aproximación tecnológica usar LLM con RAG  para obtener este resultado en vez de programación tradicional? 

## ***Metodología***

\- \*\*Dentro del stack tecnológico recomiéndame la mejor metodología para seguir un buen desarrollo de software basado en patrones SOLID y 100% asistido por IA\*\*. Todo el proyecto debe ser programado/conducido por asistentes IA, como metodología de desarrollo he considerado estas metodologías   
	\- agent-os https://buildermethods.com/agent-os  
		\- porque está enfocado en especificaciones y me parece una metodología robusta  
	\- super-claude http://github.com/SuperClaude-Org/SuperClaude\_Framework  
		\- parece muy potente  
	\- memory-bank: https://gist.github.com/ipenywis/1bdb541c3a612dbac4a14e1e3f4341ab  
		\- porque nos interesa el control y archivado del contexto  
	\- ai-devs-tasks: https://github.com/snarktank/ai-dev-tasks

