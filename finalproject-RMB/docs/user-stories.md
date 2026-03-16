# Historias de Usuario

## HU-001: Registro de Fichaje por Empleado

**Como** empleado de la empresa  
**Quiero** poder registrar mi entrada y salida del trabajo  
**Para** cumplir con el registro de jornada laboral según la normativa vigente

### Criterios de Aceptación

1. **Registro de Entrada/Salida**
   - El empleado debe poder registrar su entrada y salida
   - El sistema debe validar que no existan registros duplicados
   - Se debe registrar la ubicación del empleado
   - Se debe registrar el método de fichaje (web, móvil, terminal)

2. **Validaciones de Seguridad**
   - Se requiere certificado digital para el registro
   - Se debe validar la IP y ubicación del empleado
   - Se debe registrar el dispositivo utilizado
   - Se debe prevenir el registro fuera del horario laboral

3. **Notificaciones**
   - El empleado debe recibir confirmación del registro
   - El supervisor debe ser notificado de registros manuales
   - Se debe notificar al empleado si el registro es rechazado

### Escenarios

#### Escenario 1: Registro de entrada exitoso
```gherkin
Dado que soy un empleado con certificado digital válido
Y estoy dentro de mi horario laboral
Cuando registro mi entrada
Entonces el sistema registra la hora de entrada
Y me muestra un mensaje de confirmación
Y se notifica a mi supervisor
```

#### Escenario 2: Intento de registro duplicado
```gherkin
Dado que soy un empleado
Y ya he registrado mi entrada hoy
Cuando intento registrar otra entrada
Entonces el sistema muestra un error
Y me informa que ya existe un registro de entrada
```

#### Escenario 3: Registro fuera de horario
```gherkin
Dado que soy un empleado
Y estoy intentando registrar mi entrada fuera de horario
Cuando intento registrar mi entrada
Entonces el sistema marca el registro como manual
Y requiere aprobación del supervisor
Y me notifica que el registro está pendiente de aprobación
```

## HU-002: Gestión de Ausencias

**Como** empleado de la empresa  
**Quiero** solicitar y gestionar mis ausencias  
**Para** organizar mis periodos de vacaciones y ausencias justificadas

### Criterios de Aceptación

1. **Solicitud de Ausencia**
   - El empleado debe poder solicitar diferentes tipos de ausencia
   - Se debe validar el saldo disponible de días
   - Se debe adjuntar documentación cuando sea necesario
   - Se debe especificar el periodo de ausencia

2. **Proceso de Aprobación**
   - El supervisor debe poder aprobar/rechazar solicitudes
   - Se debe notificar al empleado del resultado
   - Se debe registrar el motivo de rechazo si aplica
   - Se debe actualizar el saldo de días disponible

3. **Visualización de Estado**
   - El empleado debe ver el estado de sus solicitudes
   - Se debe mostrar el historial de ausencias
   - Se debe mostrar el saldo de días disponible
   - Se debe poder cancelar solicitudes pendientes

### Escenarios

#### Escenario 1: Solicitud de vacaciones exitosa
```gherkin
Dado que soy un empleado con días de vacaciones disponibles
Cuando solicito un periodo de vacaciones
Y adjunto la documentación requerida
Entonces el sistema registra mi solicitud
Y notifica a mi supervisor
Y me muestra el estado "Pendiente de aprobación"
```

#### Escenario 2: Aprobación de ausencia
```gherkin
Dado que soy un supervisor
Y tengo una solicitud de ausencia pendiente
Cuando reviso la solicitud
Y la apruebo
Entonces el sistema actualiza el estado a "Aprobado"
Y notifica al empleado
Y actualiza su saldo de días
```

#### Escenario 3: Rechazo de ausencia
```gherkin
Dado que soy un supervisor
Y tengo una solicitud de ausencia pendiente
Cuando reviso la solicitud
Y la rechazo con un motivo
Entonces el sistema actualiza el estado a "Rechazado"
Y notifica al empleado con el motivo
Y mantiene el saldo de días sin cambios
```

## HU-003: Generación de Informes de Jornada

**Como** responsable de RRHH  
**Quiero** generar informes detallados de la jornada laboral  
**Para** cumplir con la normativa y gestionar la plantilla

### Criterios de Aceptación

1. **Filtros de Informe**
   - Se debe poder filtrar por departamento
   - Se debe poder filtrar por rango de fechas
   - Se debe poder filtrar por tipo de registro
   - Se debe poder filtrar por estado de aprobación

2. **Contenido del Informe**
   - Debe incluir horas trabajadas
   - Debe mostrar registros manuales pendientes
   - Debe incluir ausencias y vacaciones
   - Debe mostrar incidencias y anomalías

3. **Exportación y Formato**
   - Se debe poder exportar en PDF
   - Se debe poder exportar en Excel
   - El informe debe ser firmable digitalmente
   - Se debe mantener un historial de informes generados

### Escenarios

#### Escenario 1: Generación de informe mensual
```gherkin
Dado que soy un responsable de RRHH
Cuando selecciono un departamento
Y un periodo mensual
Y genero el informe
Entonces el sistema genera un informe detallado
Y me permite descargarlo en PDF o Excel
Y lo almacena en el historial de informes
```

#### Escenario 2: Informe con incidencias
```gherkin
Dado que soy un responsable de RRHH
Cuando genero un informe
Y existen registros manuales pendientes
Entonces el sistema marca estas incidencias
Y las agrupa en una sección específica
Y sugiere acciones a tomar
```

#### Escenario 3: Firma digital de informe
```gherkin
Dado que soy un responsable de RRHH
Cuando genero un informe
Y selecciono la opción de firma digital
Entonces el sistema me solicita mi certificado
Y firma el documento
Y lo marca como oficial
Y lo almacena con validez legal
```

## Notas Técnicas

### Prioridades
1. HU-001: Registro de Fichaje (Alta)
2. HU-002: Gestión de Ausencias (Media)
3. HU-003: Generación de Informes (Media)

### Dependencias
- Implementación de autenticación con certificado digital
- Sistema de notificaciones
- Módulo de firma digital
- Sistema de almacenamiento seguro

### Consideraciones de Seguridad
- Todos los registros deben ser auditables
- Se debe mantener trazabilidad de cambios
- Los informes deben cumplir con RGPD
- Se debe implementar control de acceso basado en roles

¿Necesitas más detalles sobre alguna de las historias de usuario o sus escenarios? 