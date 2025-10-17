Eres un experto en Terraform y en DevSecOps. Dime los requisitos minimos para desplegar un proyecto en una instancia de AWS mediante Terraform. El objetivo es saber que necesito y como preparar mi entorno local para desplegar mi proyecto en la nube utilizando la herramienta mencionada. El contenido es para un ingeniero de software que nunca ha utilizado terraform para desplegar un proyecto en la nube. Tus pautas para generar el contenido son:
1. Que las instrucciones sean claras y mediante una lista de pasos
2. Que incluya ejemplos y los comandos necesarios

Antes de realizar esta tarea ¿tienes alguna pregunta? 



Eres un experto en Ingenieria de Prompts y en DevSecOps
# Contexto Inicial
Tenemos un proyecto que consta de una base de datos, backend y frontend, los cuales estan empaquetados en contenedores de Docker y se levantan en conjunto con Docker-Compose, ahora buscamos desplegarlo en la nube de AWS

# Intrucciones generales
Tu tarea es generar un prompt para el modelo (ChatGPT 4.1) que me ayude a desplegar de mi proyecto completo en AWS mediante terraform cumpliendo con las siguientes instrucciones

# Instrucciones
- La infraestructura consta de una instancias EC2 del tipo t3.micro
- Tendras que hacer checkout del proyecto mediante git desde la siguiente url del proyecto: `https://github.com/rockeroicantonidev/AI4Devs-finalproject.git`, no requieres crendiales ya que el repositorio es publico
    * Deberás ubicar el proyecto en el branch `JAPM-Implementación-Frontend`
- el backend debe ser accesible por medio del puerto 3010
- el frontend debe ser accesible por medio del puerto 3000
- No es necesario solicitar nombres de keys ya que ya se encuentran configuradas con aws configure
- Utiliza terraform en la carpeta [[tf]]

# Mejores practicas
- Incluye el rol en el que debe actual el modelo

# Consideraciones adicionales
- El modelo tendrá acceso a la documentaación del proyecto y los achivos de Docker para implementar la configuracion correctamente.

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.




# Prompt para desplegar el proyecto Buscadoc en AWS usando Terraform

## Rol del modelo
Actúa como **DevSecOps experto en despliegue cloud y automatización con Terraform**. Tu objetivo es generar los archivos y comandos necesarios para desplegar el proyecto Buscadoc (base de datos, backend y frontend) en AWS, siguiendo las mejores prácticas de seguridad, documentación y arquitectura hexagonal.

## Instrucciones

1. **Infraestructura en AWS:**
   - Despliega una instancia EC2 tipo `t3.micro` en la región `us-west-1` con sistema operativo Ubuntu 22.04.
   - Configura el grupo de seguridad para permitir acceso a los puertos `22` (SSH), `3000` (frontend) y `3010` (backend) desde cualquier IP.
   - Asigna una IP pública a la instancia.

2. **Provisionamiento del proyecto:**
   - Realiza el checkout del repositorio público:  
     `https://github.com/rockeroicantonidev/AI4Devs-finalproject.git`  
     usando el branch `JAPM-Implementación-Frontend`.
   - Ubica el proyecto en la instancia EC2 y asegúrate de que los archivos `.env` y `docker-compose.yml` estén presentes.
   - Instala Docker y Docker Compose en la instancia.
   - Levanta los servicios usando el archivo `docker-compose.yml` existente.

3. **Configuración y acceso:**
   - El backend debe ser accesible por el puerto `3010`.
   - El frontend debe ser accesible por el puerto `3000`.
   - Documenta que el puerto `22` está abierto para acceso SSH.
   - Explica cómo conectarse por SSH a la instancia y cómo actualizar el código desde el repositorio en caso de futuros cambios.

4. **Terraform:**
   - Genera los archivos de configuración de Terraform en la carpeta `tf` para crear y provisionar la instancia EC2 con los parámetros indicados.
   - Incluye instrucciones para inicializar, aplicar y destruir la infraestructura.

5. **Documentación en formato Markdown:**
   - Explica cada paso del proceso de despliegue y configuración.
   - Detalla cómo acceder a los servicios desplegados y cómo realizar actualizaciones.
   - Resalta las mejores prácticas de seguridad y cumplimiento con la LFPDPPP.

## Ejemplo de estructura esperada en el archivo Markdown resultante

```markdown
# Despliegue de Buscadoc en AWS con Terraform

## 1. Infraestructura en AWS

### Configuración de la instancia EC2
...explicación y código Terraform...

### Grupo de seguridad
...puertos abiertos y justificación...

## 2. Provisionamiento del proyecto

### Clonación del repositorio y preparación
...comandos y pasos...

### Instalación de Docker y Docker Compose
...comandos y explicación...

### Levantar los servicios con Docker Compose
...comandos y verificación...

## 3. Acceso y administración

### Acceso SSH
...cómo conectarse y recomendaciones...

### Actualización del código
...comandos para actualizar desde git...

## 4. Buenas prácticas y cumplimiento

...seguridad, exclusión de archivos sensibles, LFPDPPP...

## 5. Destrucción de la infraestructura

...comandos para eliminar recursos con Terraform...
```

## Consideraciones adicionales

- Mantén la lógica de negocio fuera de los scripts de provisionamiento.
- Documenta todo en español y sigue las convenciones del proyecto.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de las tareas
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- Antes de iniciar muestrame la lista de pasos a ejecutar

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.