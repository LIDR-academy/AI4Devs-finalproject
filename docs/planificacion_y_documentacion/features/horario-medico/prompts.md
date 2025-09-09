Eres un experto en diseño de sistemas, modelado de datos, Prisma ORM y Javascript.
# Contexto inicial
Actualmente tengo un base de datos diseñada e implementada para un sistema de búsqueda de especialidades médicas y profesionales de la salud la cual requerimos hacer modificaciones adicionales.
Actualmente contamos con el siguiente modelo de datos definido: [[ARCHIVO]]

# Instrucciones Generales
El objetivo es diseñar e implementar una nueva entidad en la base de datos llamada `AVAILABILITY` la cual alberga los datos de disponibilidad de horario de un medico cumpliendo con los siguientes requerimientos

# Requerimientos
1. La entidad de datos llamada `AVAILABILITY` tiene la siguiente estructura:
```markdown
### AVAILABILITY (Disponibilidad)
Horarios disponibles de los médicos.

**Campos principales:**
- **id**: Identificador único (PK)
- **doctor_id**: Identificador del médico (FK)
- **day_of_week**: Día de la semana (1-7)
- **start_time**: Hora de inicio
- **end_time**: Hora de fin
- **is_available**: Disponibilidad
- **created_at**: Fecha de creación
- **updated_at**: Fecha de última actualización
```
2. Actualizar el archivo [[ARCHIVO]] del modelo de datos
    * Actualizar la sección "## 2. Entidades Principales" con los datos de la nueva entidad
    * Actualizar el diagrama de mermaid en la sección "## 3. Diagrama de Entidad-Relación"
        * Actualizar diagrama con la nueva entidad
        * Generar la nueva relación (cardinalidad) con la entidad `DOCTOR` en el diagrama
    * Actualizar la sección "## 4. Relaciones Principales" con la relación de la nueva entidad
    * Eliminar la entidad "### 5.4. AVAILABILITY (Disponibilidad)" de la sección "## 5. Entidades Adicionales (Extensiones Futuras)"
    * Analiza si es necesario actualizar alguna otra sección del documento
3. Actualizar el schema de prisma [[ARCHIVO]] con la nueva entidad `AVAILABILITY`
4. Generar las instrucciones para generar para realizar la migración en Prisma
5. Actualizar el archivo de datos de prueba [[ARCHIVO]] con la nueva entidad para los datos de prueba

# Mejores Practicas
1. Para el modelo de datos conservar las convenciones establecidas en todas las secciones y diagrama a actualizar
2. Para el schema en prisma conservar las convenciones y formato establecido en el archivo
3. Para el archivo de datos de prueba conservar la estructura y practicas de codificación establecidas

# Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de los requerimientos
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso de la lista menciona el archivo que se va a crear o modificar e incluye el código que se va agregar

Antes de realizar la tarea revisa mis requisitos ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.