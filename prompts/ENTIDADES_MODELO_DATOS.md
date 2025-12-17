# Entidades del Modelo de Datos (Fase 1)

## Núcleo Multi-tenant y Configuración
- **Cooperativas:** id, codigo, razon_social, nombre_comercial, ruc, logo_url, configuracion (JSON), estado, fecha_creacion, usuario_creacion
- **Configuraciones:** id, cooperativa_id, clave, valor (JSON/texto), descripcion, estado, fecha_creacion, usuario_creacion
- **Oficinas/Sucursales:** id, cooperativa_id, codigo, nombre, direccion, telefono, email, provincia_id, canton_id, parroquia_id, estado, fecha_creacion, usuario_creacion, fecha_eliminacion?, usuario_eliminacion?
- **Audit_logs:** id, modulo, accion, entidad, entidad_id, usuario_id, usuario_ip, datos_anteriores (JSON), datos_nuevos (JSON), metadata (JSON), fecha_hora, cooperativa_id

## Seguridad y Usuarios
- **Personas (base):** id, tipo_identificacion_id, numero_identificacion, nombres, apellidos, fecha_nacimiento, genero_id, estado_civil_id, nacionalidad_id, nivel_instruccion_id, profesion, email, telefono_convencional, telefono_celular, provincia_id, canton_id, parroquia_id, direccion_domicilio, referencia_domicilio, codigo_dactilar, foto_url, estado, fecha_creacion, usuario_creacion, fecha_modificacion?, usuario_modificacion?, fecha_eliminacion?, usuario_eliminacion?
- **Usuarios:** id, persona_id, username, password_hash, email (login), telefono_celular, sucursal_id, estado (activo/inactivo/bloqueado), motivo_bloqueo?, ultimo_login?, intentos_fallidos?, cooperativa_id, fecha_creacion, usuario_creacion, fecha_modificacion?, usuario_modificacion?, fecha_eliminacion?, usuario_eliminacion?
- **Roles:** id, nombre, descripcion, nivel_privilegio, estado, cooperativa_id, fecha_creacion, usuario_creacion, fecha_modificacion?, usuario_modificacion?
- **Permisos:** id, codigo (Modulo.Submodulo.Accion), descripcion, estado, metadata?, fecha_creacion
- **Perfiles de usuario (opcional):** id, nombre, descripcion, configuracion (roles/permisos), estado, cooperativa_id, fecha_creacion
- **Usuarios_roles:** id, usuario_id, rol_id, fecha_asignacion, usuario_asignacion, vigencia_desde?, vigencia_hasta?, cooperativa_id
- **Usuarios_permisos:** id, usuario_id, permiso_id, denegado (bool), fecha_asignacion, usuario_asignacion, vigencia_desde?, vigencia_hasta?, cooperativa_id
- **Sesiones:** id, usuario_id, token_hash/refresh_token, ip_origen, user_agent, fecha_inicio, fecha_expiracion, estado, cooperativa_id

## Catálogos Maestros
- **Catálogos (tipos):** id, codigo, nombre, descripcion, tipo (simple/jerarquico), estado, fecha_creacion, usuario_creacion
- **Catálogo_registros:** id, catalogo_id, codigo, descripcion, descripcion_corta?, orden, estado, padre_id?, metadata?, fecha_creacion, usuario_creacion, fecha_modificacion?, usuario_modificacion?
- **Provincias/Cantones/Parroquias:** id, codigo, nombre, padre_id (jerarquía), estado, orden
- **Tipos_identificación:** id, codigo, descripcion, longitud, valida_ecuador (bool), estado
- **Niveles_instrucción / Estados_civiles / Géneros / Estados_generales / Tipos_usuario / Tipos_transacción / Monedas:** id, codigo, descripcion, estado, orden

## Clientes (Gestión y Búsqueda)
- **Clientes:** persona_id (PK/FK), codigo_cliente, tipo_cliente_id, fecha_ingreso, oficina_id, oficial_credito_id, segmento_id, estado, motivo_estado?, cooperativa_id, fecha_creacion, usuario_creacion, fecha_modificacion?, usuario_modificacion?, fecha_eliminacion?, usuario_eliminacion?
- **Clientes_mensajes:** id, cliente_id, tipo_mensaje, titulo, descripcion, fecha_desde, fecha_hasta, estado, requiere_confirmacion (bool), cooperativa_id, fecha_creacion, usuario_creacion, fecha_modificacion?, usuario_modificacion?
- **Clientes_mensajes_visualizaciones:** id, mensaje_id, usuario_id, fecha_visualizacion, confirmado (bool), cooperativa_id
- **Apoderados:** persona_id (PK/FK), tipo_apoderado_id, fecha_registro, estado, cooperativa_id, fecha_creacion, usuario_creacion, fecha_modificacion?, usuario_modificacion?, fecha_eliminacion?, usuario_eliminacion?
- **Poderes:** id, cliente_id, apoderado_id, tipo_poder_id, numero_escritura, fecha_otorgamiento, fecha_inicio, fecha_fin, notaria, alcance (text), documento_url, documento_nombre, documento_tamanio, estado (vigente/vencido/revocado), motivo_revocacion?, cooperativa_id, fecha_creacion, usuario_creacion, fecha_modificacion?, usuario_modificacion?, fecha_eliminacion?, usuario_eliminacion?
- **Conyuges (referencia futura):** persona_id (PK/FK), cliente_id, fecha_matrimonio, estado, fecha_creacion, usuario_creacion

## Auditoría y Operaciones Transversales
- **Audit_logs:** (ver arriba) id, modulo, accion, entidad, entidad_id, usuario_id, usuario_ip, datos_anteriores, datos_nuevos, metadata, fecha_hora, cooperativa_id
- **Jobs_exportacion:** id, usuario_id, cooperativa_id, filtros (JSON), columnas (JSON), formato, estado_job, progreso, resultado_url?, fecha_creacion, fecha_fin?, error_detalle?
- **Notificaciones:** id, usuario_id, titulo, mensaje, tipo (info/warn/error), estado (pendiente/leida), origen, metadata?, fecha_creacion, fecha_lectura?, cooperativa_id

## Soporte de Soft Delete (campos estándar en entidades principales)
- fecha_eliminacion (timestamp)
- usuario_eliminacion (FK usuario)
- motivo_eliminacion (texto)

## Notas
- Todas las entidades principales incluyen `cooperativa_id` (multi-tenant por fila).
- Personas es la base compartida para Usuarios, Clientes, Apoderados, Cónyuges.
- Catálogos jerárquicos usan `padre_id` y orden de presentación.
