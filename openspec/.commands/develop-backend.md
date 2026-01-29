Por favor analiza y soluciona el ticket: $ARGUMENTS.

Sigue estos pasos:

1. Entiende el problema descrito en el ticket
2. Busca en el código base los archivos relevantes
3. Inicia una nueva rama usando el ID del ticket (por ejemplo SCRUM-1)
4. Implementa los cambios necesarios para resolver el ticket, siguiendo el orden de las diferentes tareas y asegurándote de cumplir todas ellas en orden, como escribir y ejecutar pruebas para verificar la solución, actualizar documentación, etc.
5. Asegura que el código pase linting y verificación de tipos
6. Haz stage solo de los archivos afectados por el ticket, y deja cualquier otro archivo cambiado fuera del commit. Crea un mensaje de commit descriptivo
7. Haz push y crea un PR, usando el ID del ticket (por ejemplo SCRUM-1) para que se vincule en el ticket solicitado

Recuerda usar el CLI de GitHub (`gh`) para todas las tareas relacionadas con GitHub.
En repositorios con origin y upstream, usar siempre origin como repositorio por defecto en gh.
