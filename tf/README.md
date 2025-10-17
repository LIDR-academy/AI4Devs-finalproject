# Despliegue de Buscadoc en AWS con Terraform

## 1. Infraestructura en AWS

### Configuración de la instancia EC2

Se utiliza Terraform para crear una instancia EC2 tipo `t3.small` en la región `us-west-1` con Ubuntu 22.04, asignando una IP pública y generando automáticamente una clave SSH segura. El grupo de seguridad permite acceso a los puertos 22 (SSH), 3000 (frontend) y 3010 (backend).

**Archivos clave:**
- `main.tf`: Define recursos AWS (EC2, Security Group, Key Pair).
- `variables.tf` y `terraform.tfvars`: Configuración de parámetros.
- `outputs.tf`: Muestra IP pública y comando SSH.

### Grupo de seguridad

El grupo de seguridad `buscadoc_sg` permite:
- **SSH (22):** Acceso remoto seguro para administración.
- **Frontend (3000):** Acceso web a la interfaz de usuario.
- **Backend (3010):** Acceso a la API REST.

**Justificación:**  
Permitir solo los puertos necesarios reduce la superficie de ataque y facilita el monitoreo.

---

## 2. Provisionamiento del proyecto

### Clonación del repositorio y preparación

La instancia EC2 ejecuta un script de provisionamiento (`provision.sh`) que:
- Instala Docker y Docker Compose.
- Clona el repositorio público en el branch `JAPM-Implementación-Frontend`.
- Verifica la presencia de los archivos `.env` y `docker-compose.yml`.

### Instalación de Docker y Docker Compose

El script instala las dependencias necesarias y agrega el usuario `ubuntu` al grupo `docker` para facilitar la administración de contenedores.

### Levantar los servicios con Docker Compose

Se ejecuta el comando:

```sh
sudo docker compose up -d --build
```

Esto inicia los servicios de base de datos, backend y frontend siguiendo la arquitectura hexagonal del proyecto.

## 3. Acceso y administración
Acceso SSH
Para conectarse a la instancia EC2:
```sh
ssh -i ./buscadoc_key.pem ubuntu@<IP_PUBLICA>
```

**Recomendaciones**:

- Mantén la clave privada segura y con permisos restringidos.
- No compartas la clave por correo ni la subas a repositorios.

Acceso a los servicios: 
- Frontend: `http://<IP_PUBLICA>:3000`
- Backend: `http://<IP_PUBLICA>:3010`

Actualización del código
Para actualizar el proyecto en la instancia:
```sh
cd /home/ubuntu/buscadoc
git fetch --all
git checkout JAPM-Implementación-Frontend
git pull
sudo docker compose up -d --build
```

## 4. Buenas prácticas y cumplimiento
Seguridad
- No subas archivos .env ni claves privadas a Git.
- Usa variables de entorno para credenciales y datos sensibles.
- Aplica el principio de menor privilegio en IAM y grupos de seguridad.
- Audita el acceso y uso de datos personales conforme a la LFPDPPP.

Cumplimiento LFPDPPP
- Informa y protege los datos personales de los usuarios.
- Limita el acceso a datos sensibles solo a servicios autorizados.
- Documenta el uso y almacenamiento de datos personales en la carpeta docs/.

Internacionalización y arquitectura hexagonal
- El frontend soporta multilenguaje con vue-i18n.
- El backend desacopla la lógica de negocio siguiendo el patrón hexagonal.
- Los endpoints REST siguen la estructura /api/{recurso} y usan JWT/OAuth2.

## 5. Destrucción de la infraestructura
Para eliminar todos los recursos creados por Terraform:
```sh
cd tf
terraform destroy
```

## Referencias y notas adicionales

- [docs/product_requirement_document.md](../docs/product_requirement_document.md): Documento de requisitos y arquitectura hexagonal del sistema.
- [docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md](../docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md): Modelo de base de datos y relaciones entre entidades.
- [docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md](../docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md): Diagrama visual de la arquitectura hexagonal (puertos y adaptadores).
- [docs/planificacion_y_documentacion/diagramas/diagrama_casos_de_uso.md](../docs/planificacion_y_documentacion/diagramas/diagrama_casos_de_uso.md): Diagrama de casos de uso y flujos principales del sistema.

**Notas:**
- Consulta los diagramas y documentación en la carpeta `docs/` para detalles sobre la arquitectura, flujos de trabajo y cumplimiento de la LFPDPPP.
- Mantén la lógica de negocio desacoplada en servicios de dominio y sigue los patrones hexagonales en backend y frontend.
- Aplica las convenciones de internacionalización y seguridad en todos los componentes y servicios.