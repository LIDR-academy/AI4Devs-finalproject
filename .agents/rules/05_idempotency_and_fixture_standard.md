# 🔄 Estándar Agnóstico de Idempotencia y Datos Fixture (.agents/rules/05_idempotency_and_fixture_standard.md)

Directiva agnóstica universal que rige la creación de datos semilla (*seeding*), simulación de entornos (*fixtures*) y estrategias de persistencia idempotente en cualquier motor de base de datos o lenguaje de programación.

---

## 🏛️ Los 5 Pilares Agnósticos de Datos Semilla y Fixtures

Toda estrategia de inicialización o carga de datos en el sistema DEBE cumplir estrictamente con los siguientes 5 pilares:

### 1. Separación Estricta de Entornos (Environments Separation)
- **Essential Seeds (Estructurales):** Datos maestros necesarios para el funcionamiento del sistema en cualquier entorno (ej. catálogo de unidades, roles, permisos del sistema). Son ejecutables en producción y desarrollo.
- **Synthetic Fixtures Seeds (Simulaciones):** Datos de prueba para desarrollo local, staging o demostraciones (ej. registros de prueba, transacciones falsas). **Nunca deben ejecutarse en entornos de producción**.

### 2. Idempotencia Obligatoria 100% (Idempotent Execution)
- La ejecución de scripts o funciones de sembrado $N$ veces consecutivas DEBE producir exactamente el mismo estado final en la base de datos sin lanzar errores de clave duplicada ni generar registros redundantes (uso de operaciones de inserción/actualización atómica `upsert`, o verificación previa de existencia).

### 3. Desacoplamiento del Servidor de Producción (Dedicated Runner CLI)
- Prohibido incluir semillas pesadas de prueba dentro del ciclo de arranque del servidor web o API de producción. El sembrado debe ejecutarse a través de procesos CLI o tareas de inicialización desacopladas.

### 4. Aislamiento en Pruebas Automatizadas (Test Factories)
- Los tests unitarios e integración no deben depender de semillas globales mutadas por otros tests. Cada prueba automatizada DEBE generar sus propios datos independientes utilizando el patrón *Test Factory* en el ciclo de preparación (`Arrange / Given`).

### 5. Gobernanza de Datos Sintéticos y Sanitización (GDPR & AI Governance)
- Las semillas de desarrollo y pruebas DEBEN utilizar exclusivamente datos sintéticos anónimos. Queda strictly prohibido usar datos personales reales. Credenciales o pines de prueba deben soportar sobreescritura mediante variables de entorno y almacenarse mediante algoritmos de hash seguros.

---

## 📐 Enforcement

1. **Scripts de Inicialización:** Todo script de sembrado nuevo o modificado debe ser verificado ejecutándolo al menos 2 veces consecutivas en un entorno limpio para validar idempotencia (0 errores en la segunda corrida).
2. **Sanitización:** Todo fixture de desarrollo debe ser auditado para garantizar que no contenga credenciales hardcodeadas en texto plano.
