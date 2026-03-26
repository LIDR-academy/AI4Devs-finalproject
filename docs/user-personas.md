# Personas TravelSplit MVP

## 1. Creador de Viaje (Trip Creator)

- Nombre: Laura, 29 años
- Rol principal: Viajero Administrador (CREATOR) de cada viaje.
- Objetivo principal:
  - Organizar un viaje grupal y mantener control claro sobre participantes, gastos y saldos. [file:1]
- Necesidades:
  - Crear viajes y configurar participantes por email ya registrados.
  - Poder invitar amigos y saber si alguien aún no está registrado.
  - Editar/eliminar cualquier gasto del viaje para corregir errores.
  - Ver el estado general del viaje y saber cuándo “cerrar” las cuentas. [file:1]
- Dolor actual:
  - Gasto desordenado en chats y hojas de cálculo manuales.
  - Conflictos por errores de cálculo y falta de evidencias de gastos. [file:1]
- Capacidades / Permisos:
  - Crear viaje.
  - Invitar participantes (solo si ya existen como usuarios).
  - Editar/eliminar configuración del viaje.
  - Editar/eliminar cualquier gasto asociado al viaje.
  - Ejecutar la acción de “equilibrar gastos” para cerrar el viaje. [file:1]

## 2. Viajero Participante (Trip Member)

- Nombre: Andrés, 27 años
- Rol principal: Participante invitado a uno o varios viajes. [file:1]
- Objetivo principal:
  - Registrar sus propios gastos y entender cuánto debe o cuánto le deben, sin pelear por cálculos. [file:1]
- Necesidades:
  - Aceptar invitación a un viaje o unirse mediante código.
  - Crear gastos propios, adjuntando foto del recibo.
  - Ver el feed de gastos del viaje y los saldos individuales.
  - Ver en una lista simple “a quién le debo y cuánto”. [file:1]
- Dolor actual:
  - No recordar quién pagó qué, perder recibos de pagos compartidos.
  - No tener certeza de si los cálculos son correctos. [file:1]
- Capacidades / Permisos:
  - Unirse a viaje existente (si fue invitado o tiene código).
  - Crear nuevos gastos propios.
  - No puede editar ni eliminar gastos (ni siquiera los suyos) una vez creados.
  - Ver todos los gastos y saldos del viaje. [file:1]

## 3. Usuario Recurrente de la Plataforma

- Nombre: Camila, 32 años
- Rol principal: Usuario que participa en múltiples viajes a lo largo del año. [file:1]
- Objetivo principal:
  - Tener un historial de viajes y gastos consolidados, manteniendo un solo perfil. [file:1]
- Necesidades:
  - Ver listado de viajes activos e históricos.
  - Mantener su perfil (email, nombre, contraseña) actualizado.
  - Reutilizar sus credenciales para nuevos viajes sin re-registro. [file:1]
- Dolor actual:
  - Tener cuentas y registros dispersos entre varias apps / hojas de cálculo.
- Capacidades / Permisos:
  - Actualizar únicamente su propio perfil.
  - Crear nuevos viajes donde será CREATOR.
  - Ser MEMBER en otros viajes creados por amigos. [file:1]

## 4. Sistema / Backend (NestJS API)

- Tipo: Actor técnico.
- Rol principal:
  - Validar reglas de negocio y garantizar consistencia financiera. [file:1]
- Responsabilidades:
  - Autenticación JWT.
  - Validar que los correos invitados existan como usuarios.
  - Aplicar reglas de rol CREATOR/MEMBER en viajes.
  - Calcular saldos “quién debe a quién” a partir de gastos y splits.
  - Enviar alertas por email cuando alguien es agregado a un viaje. [file:1]
