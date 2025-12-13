## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
Estefania Miceli

### **0.2. Nombre del proyecto:**
Pefeni

### **0.3. Descripción breve del proyecto:**
Plataforma moderna de e-commerce especializada en la venta de collares personalizables para mascotas. El usuario puede elegir qué texto se graba en el collar (nombre, frase corta o mensaje especial), así como los colores del collar y de los charms. El objetivo es ofrecer una experiencia simple, visual y atractiva que permita diseñar el producto en segundos y completar la compra sin fricciones.

### **0.4. Propuesta de valor:**
Pefeni permite a los dueños de mascotas personalizar collares con charms de forma rápida y visual, sin complicaciones. En menos de 2 minutos, el usuario puede diseñar un collar único para su mascota, ver una vista previa en tiempo real y completar la compra con un flujo simplificado. La propuesta de valor se centra en:
- **Simplicidad:** Proceso de personalización intuitivo sin opciones abrumadoras
- **Velocidad:** Diseño y compra en minutos, no en horas
- **Visualización:** Vista previa instantánea del producto final antes de comprar
- **Enfoque MVP:** Un solo producto base con personalización limitada pero efectiva

### **0.5. Problema que resuelve:**
Los dueños de mascotas que buscan collares personalizados enfrentan varios problemas:
- **Complejidad excesiva:** Muchas tiendas online ofrecen demasiadas opciones que generan parálisis por análisis
- **Falta de visualización:** No pueden ver cómo quedará el producto final antes de comprar
- **Procesos largos:** El checkout tradicional tiene múltiples pasos y fricciones
- **Falta de claridad:** No está claro qué charms están disponibles o cómo se ven

Pefeni resuelve esto ofreciendo:
- Un único producto base (collar) con opciones claras y limitadas
- Vista previa en tiempo real mientras personalizan
- Selección simple de charms mediante checkboxes
- Checkout simplificado sin pasos innecesarios

### **0.6. Público objetivo:**
**Primario:**
- Dueños de mascotas (perros y gatos principalmente) de 25-45 años
- Personas que valoran la personalización y el diseño
- Usuarios con experiencia básica en compras online
- Buscan productos únicos para sus mascotas

**Secundario:**
- Personas que regalan collares personalizados
- Dueños de múltiples mascotas que quieren productos diferenciados

### **0.7. Objetivos del MVP:**
1. **Validar el concepto:** Probar que los usuarios pueden personalizar y comprar un collar en menos de 3 minutos
2. **Time-to-market:** Lanzar funcionalidad core en el menor tiempo posible
3. **Conversión:** Lograr que al menos el 5% de los visitantes completen una orden (simulada)
4. **Experiencia de usuario:** Obtener feedback sobre el flujo de personalización
5. **Base técnica:** Establecer arquitectura escalable para futuras funcionalidades

**Principio rector:** Minimizar complejidad, maximizar valor entregado al usuario.

### **0.8. Flujo E2E (End-to-End) detallado:**

```
1. USUARIO LLEGA A LA WEB (HU1: Ver producto base)
   └─> Ve la página principal con el collar base disponible
   └─> Información clara: nombre del producto, descripción, precio estándar
   └─> Información: "Incluye hasta 8 charms" (precio fijo independiente de cantidad)
   └─> Indicador de que puede personalizar el collar

2. USUARIO SELECCIONA CHARMS (HU2: Seleccionar charms)
   └─> Ve lista de charms disponibles con checkboxes (máximo 8 charms)
   └─> Cada charm muestra: nombre (sin precio individual)
   └─> Selecciona de 0 a 8 charms (puede elegir menos, el precio es el mismo)
   └─> Puede deseleccionar charms si cambia de opinión
   └─> Indicador visual de cuántos charms ha seleccionado (ej: "3 de 8 seleccionados")

3. USUARIO VE VISTA PREVIA EN TIEMPO REAL (HU3: Vista previa visual)
   └─> Mientras selecciona charms, ve representación visual/textual del collar
   └─> La vista previa se actualiza automáticamente al cambiar selección
   └─> Ve collar base + charms seleccionados en tiempo real
   └─> Actualización fluida sin recargar la página

4. USUARIO AGREGA AL CARRITO (HU4: Agregar al carrito)
   └─> Click en "Agregar al carrito"
   └─> Mensaje de confirmación (toast/banner)
   └─> Carrito muestra: collar base + charms seleccionados (0 a 8)
   └─> Precio estándar del collar (fijo, no se calcula)
   └─> Opción para ver carrito y "Finalizar compra"

5. USUARIO COMPLETA COMPRA (HU5: Completar compra - OPCIONAL)
   └─> Click en "Finalizar compra" (si implementado)
   └─> Formulario simple: nombre completo, email, dirección, teléfono (opcional)
   └─> Validación de campos requeridos y formato de email
   └─> Click en "Confirmar orden"
   └─> Página de confirmación con:
       • Número de orden único
       • Resumen completo: collar + charms seleccionados + precio estándar
       • Información de envío
       • Mensaje de agradecimiento
       • Opción para volver al inicio
```

**Tiempo estimado del flujo completo:**
- **Flujo básico (hasta carrito):** 1-2 minutos
- **Flujo completo (incluyendo compra):** 2-3 minutos

**Nota:** El paso 5 (Completar compra) es opcional en el MVP. El flujo core termina en el paso 4 (Agregar al carrito), que permite validar el concepto de personalización sin necesidad de implementar el checkout completo.

### **0.9. Métricas iniciales (KPIs del MVP):**
- **Tasa de conversión:** % de visitantes que completan una orden (objetivo: 5%)
- **Tiempo en sitio:** Tiempo promedio desde entrada hasta confirmación (objetivo: < 3 min)
- **Tasa de abandono:** % de usuarios que abandonan en cada paso del flujo
- **Charms más seleccionados:** Para entender preferencias de usuarios
- **Errores técnicos:** Número de errores 500, timeouts, etc. (objetivo: < 1%)

**Nota:** En el MVP, estas métricas se recopilarán de forma básica (logs del servidor, eventos del frontend). No se implementará analytics complejo en esta fase.

### **0.10. URL del proyecto:**
(Pendiente de definir en etapa de despliegue)

### **0.11. URL o archivo comprimido del repositorio:**
(Pendiente de definir)


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

Impulsar una tienda online que combine personalización en tiempo real, diseño intuitivo y un flujo de compra ágil. El foco es aumentar la conversión, mejorar la satisfacción del cliente y construir una marca memorable en el mercado pet-friendly mediante una experiencia de diseño divertida, directa y orientada al usuario.

**Enfoque MVP:** Para la primera versión, nos enfocamos en validar el concepto con funcionalidades core, priorizando un flujo de compra simple y directo que permita al usuario personalizar y agregar al carrito rápidamente.

### **1.2. Características y funcionalidades principales del MVP:**

**Funcionalidades Must (incluidas en MVP):**
- **Visualización del producto base (HU1):** Página principal que muestra el collar disponible con información clara (nombre, descripción, precio estándar fijo que incluye hasta 8 charms)
- **Selección de charms (HU2):** Lista simple de charms disponibles que el usuario puede seleccionar mediante checkboxes, con posibilidad de seleccionar de 0 a 8 charms máximo (el precio es fijo independientemente de la cantidad seleccionada)
- **Vista previa visual en tiempo real (HU3):** Representación visual o textual del collar que se actualiza automáticamente cuando el usuario selecciona o deselecciona charms (puede ser lista de texto o imágenes estáticas simples en MVP)
- **Carrito de compras básico (HU4):** Agregar producto al carrito con los charms seleccionados (0 a 8), visualización del carrito con precio estándar fijo del collar

**Funcionalidades Should (opcionales en MVP, pueden quedar para v2):**
- **Completar compra (simulada) (HU5):** Formulario simple para crear orden sin pago real, con página de confirmación que muestra número de orden y resumen de la compra

**Funcionalidades Won't (no incluidas en MVP):**
- Sistema de pago real
- Múltiples productos base
- Personalización de texto grabado
- Selección de colores del collar
- Sistema de usuarios/autenticación
- Historial de pedidos
- Catálogo extenso de productos

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.


### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.


### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

---

### **Historia de Usuario 1: Ver producto base disponible** (MUST)

**Como** dueño de una mascota  
**Quiero** ver el collar base disponible en la página principal  
**Para** entender qué producto puedo personalizar y comprar

#### **Criterios de Aceptación (Given/When/Then):**

**Given** que soy un usuario que visita la web por primera vez  
**When** accedo a la página principal  
**Then** debo ver:
- El collar base disponible con su nombre
- Una descripción breve del producto
- El precio estándar del collar (fijo, incluye hasta 8 charms)
- Información clara: "Incluye hasta 8 charms" (precio fijo independiente de cantidad)
- Un botón o indicador claro de que puedo personalizarlo

**Given** que estoy en la página principal  
**When** veo la información del producto  
**Then** la información debe ser clara y fácil de entender sin conocimientos técnicos

#### **Dependencias:**
- Ninguna (es la primera funcionalidad)

#### **Riesgos:**
- ⚠️ **Bajo:** Información poco clara que confunda al usuario
- ⚠️ **Bajo:** Diseño que no sea responsive en móviles

#### **Notas de QA:**
- ✅ Verificar que la información se muestra correctamente en desktop, tablet y móvil
- ✅ Validar que el precio estándar se muestra con formato correcto (ej: $29.99)
- ✅ Verificar que se indica claramente que el precio incluye hasta 8 charms
- ✅ Probar con diferentes tamaños de pantalla
- ✅ Verificar accesibilidad: contraste de colores, texto legible
- ✅ Validar que no hay errores en consola del navegador
- ✅ Escenario negativo: ¿Qué pasa si no hay producto disponible? (mostrar mensaje apropiado)

---

### **Historia de Usuario 2: Seleccionar charms** (MUST)

**Como** dueño de una mascota  
**Quiero** seleccionar uno o más charms desde una lista  
**Para** personalizar el collar según mis preferencias

#### **Criterios de Aceptación (Given/When/Then):**

**Given** que estoy en la página del producto  
**When** veo la lista de charms disponibles  
**Then** debo poder:
- Ver cada charm con su nombre (sin precio individual, el precio del collar es fijo)
- Seleccionar de 0 a 8 charms máximo mediante checkboxes
- Ver qué charms he seleccionado (estado visual claro)
- Ver un indicador de cuántos charms he seleccionado (ej: "3 de 8 seleccionados")

**Given** que he seleccionado uno o más charms  
**When** reviso mi selección  
**Then** debo poder deseleccionar charms si cambio de opinión

**Given** que he seleccionado 8 charms  
**When** intento seleccionar otro charm  
**Then** debo ver un mensaje indicando que el máximo es 8 charms (o el checkbox debe estar deshabilitado)

**Given** que no he seleccionado ningún charm (o he seleccionado menos de 8)  
**When** intento agregar al carrito  
**Then** debo poder agregar el collar base con los charms seleccionados (el precio es el mismo independientemente de la cantidad)

#### **Dependencias:**
- Historia de Usuario 1 (ver producto base)

#### **Riesgos:**
- ⚠️ **Medio:** Usuario confundido sobre el límite de 8 charms
- ⚠️ **Bajo:** Usuario confundido pensando que debe seleccionar 8 charms (debe quedar claro que puede elegir menos)
- ⚠️ **Bajo:** Problemas de usabilidad si hay más de 8 charms disponibles (debe haber límite claro)

#### **Notas de QA:**
- ✅ Validar que los checkboxes funcionan correctamente (seleccionar/deseleccionar)
- ✅ Probar seleccionar exactamente 8 charms (máximo permitido)
- ✅ Probar seleccionar 0 charms (debe permitirse)
- ✅ Probar seleccionar menos de 8 charms (1, 2, 3, etc.)
- ✅ Validar que no se puede seleccionar más de 8 charms (mostrar mensaje o deshabilitar)
- ✅ Verificar que el indicador de "X de 8 seleccionados" funciona correctamente
- ✅ Verificar que el estado se mantiene si el usuario navega y vuelve
- ✅ Validar accesibilidad: navegación por teclado, screen readers
- ✅ Escenario negativo: ¿Qué pasa si no hay charms disponibles? (mostrar mensaje)
- ✅ Escenario límite: Seleccionar/deseleccionar rápidamente múltiples veces (no debe romper)
- ✅ Validar que el precio mostrado es siempre el mismo independientemente de la cantidad de charms seleccionados

---

### **Historia de Usuario 3: Vista previa visual en tiempo real** (MUST)

**Como** dueño de una mascota  
**Quiero** ver una representación visual del collar que se actualiza en tiempo real mientras selecciono charms  
**Para** tener certeza de cómo se verá el producto final antes de agregarlo al carrito

#### **Criterios de Aceptación (Given/When/Then):**

**Given** que estoy en la página del producto  
**When** selecciono o deselecciono charms  
**Then** debo ver:
- Una representación visual o textual del collar que se actualiza en tiempo real
- Los charms seleccionados visibles en la representación
- Actualización instantánea sin recargar la página

**Given** que no he seleccionado ningún charm  
**When** veo la vista previa  
**Then** debo ver solo el collar base

**Given** que he seleccionado múltiples charms  
**When** veo la vista previa  
**Then** debo ver todos los charms seleccionados en la representación

**Given** que cambio rápidamente la selección de charms  
**When** veo la vista previa  
**Then** la actualización debe ser fluida sin retrasos perceptibles

#### **Dependencias:**
- Historia de Usuario 2 (seleccionar charms)

#### **Riesgos:**
- ⚠️ **Medio:** Complejidad técnica para implementar actualización en tiempo real
- ⚠️ **Bajo:** Performance si la actualización es muy pesada
- ⚠️ **Bajo:** En MVP puede ser suficiente con lista de texto o imágenes estáticas simples

#### **Notas de QA:**
- ✅ Validar que la vista previa se actualiza correctamente al seleccionar/deseleccionar charms
- ✅ Probar seleccionar múltiples charms y verificar que todos aparecen
- ✅ Validar que no hay delay perceptible en la actualización (< 100ms idealmente)
- ✅ Probar en diferentes navegadores y dispositivos
- ✅ Escenario negativo: Error al cargar imágenes de charms (mostrar placeholder o mensaje)
- ✅ Escenario límite: Seleccionar/deseleccionar rápidamente (no debe romper la vista previa)
- ✅ Escenario límite: Seleccionar todos los charms disponibles (debe mostrar todos)
- ✅ Validar accesibilidad: texto alternativo para imágenes, contraste adecuado
- ✅ Validar que la vista previa es responsive en móviles

**Nota:** En el MVP, la vista previa puede implementarse de forma simple (lista de texto mostrando "Collar base + Charm 1 + Charm 2" o imágenes estáticas que se actualizan). La vista previa interactiva avanzada con renderizado dinámico puede quedar para v2.

---

### **Historia de Usuario 4: Agregar producto al carrito** (MUST)

**Como** dueño de una mascota  
**Quiero** agregar el collar con los charms seleccionados al carrito  
**Para** proceder con la compra

#### **Criterios de Aceptación (Given/When/Then):**

**Given** que he seleccionado de 0 a 8 charms  
**When** hago click en "Agregar al carrito"  
**Then** debo ver:
- Un mensaje de confirmación (toast, banner o similar)
- El carrito actualizado con el producto y charms seleccionados (0 a 8)
- El precio estándar del collar (fijo, no se calcula, es el mismo independientemente de la cantidad de charms)

**Given** que tengo un producto en el carrito  
**When** veo el carrito  
**Then** debo poder ver:
- El collar base
- Los charms seleccionados listados claramente (0 a 8)
- El precio estándar del collar (fijo)
- Información: "Incluye hasta 8 charms" (si aplica)
- Un botón para "Finalizar compra"

**Given** que intento agregar el mismo producto múltiples veces  
**When** hago click en "Agregar al carrito"  
**Then** el sistema debe manejar esto según regla de negocio (duplicar, actualizar cantidad, o mostrar mensaje)

#### **Dependencias:**
- Historia de Usuario 2 (seleccionar charms)
- Historia de Usuario 3 (vista previa visual) - opcional, pero mejora la experiencia

#### **Riesgos:**
- ⚠️ **Bajo:** Usuario confundido pensando que el precio cambia según cantidad de charms (debe quedar claro que es fijo)
- ⚠️ **Bajo:** Pérdida del carrito si el usuario recarga la página (en MVP puede ser aceptable)
- ⚠️ **Bajo:** Usuario confundido sobre qué hay en el carrito

#### **Notas de QA:**
- ✅ Validar que el precio mostrado es siempre el precio estándar fijo del collar (no se calcula)
- ✅ Verificar que el precio es el mismo independientemente de la cantidad de charms (0, 1, 5, 8)
- ✅ Probar agregar múltiples veces el mismo producto (¿se duplica o se actualiza?)
- ✅ Verificar que el carrito muestra correctamente los charms seleccionados (0 a 8)
- ✅ Probar con 0 charms, 1 charm, 5 charms, 8 charms (máximo)
- ✅ Validar que el mensaje de confirmación aparece y desaparece correctamente
- ✅ Escenario negativo: Agregar al carrito sin seleccionar charms (debe permitirse, precio es el mismo)
- ✅ Escenario límite: Agregar producto con 8 charms (verificar que se muestran todos)
- ✅ Validar que el precio se muestra con formato correcto (ej: $29.99)
- ✅ Validar que el carrito es accesible (navegación por teclado, screen readers)

---

### **Historia de Usuario 5: Completar compra (simulada)** (SHOULD)

**Como** dueño de una mascota  
**Quiero** completar el proceso de compra llenando un formulario simple  
**Para** crear mi orden y recibir confirmación

#### **Criterios de Aceptación (Given/When/Then):**

**Given** que tengo productos en el carrito  
**When** hago click en "Finalizar compra"  
**Then** debo ver un formulario con campos:
- Nombre completo (requerido)
- Email (requerido, validación de formato)
- Dirección de envío (requerido)
- Teléfono (opcional en MVP)

**Given** que he llenado el formulario correctamente  
**When** hago click en "Confirmar orden"  
**Then** debo:
- Ver una página de confirmación
- Recibir un número de orden único
- Ver el resumen de mi compra (collar + charms seleccionados + precio estándar fijo)
- Ver un mensaje de agradecimiento
- Ver opción para volver al inicio o hacer otra compra

**Given** que he llenado el formulario con datos inválidos  
**When** intento confirmar la orden  
**Then** debo ver mensajes de error claros indicando qué campos están incorrectos

**Given** que hay un error en el servidor al crear la orden  
**When** intento confirmar  
**Then** debo ver un mensaje de error apropiado y no perder los datos del formulario (si es posible)

#### **Dependencias:**
- Historia de Usuario 4 (agregar al carrito)

#### **Riesgos:**
- ⚠️ **Medio:** Validación insuficiente que permita datos inválidos
- ⚠️ **Medio:** Pérdida de datos si hay error en el servidor
- ⚠️ **Bajo:** Usuario confundido sobre si la orden se creó realmente (necesita feedback claro)

#### **Notas de QA:**
- ✅ Validar todos los campos requeridos (no debe permitir enviar vacíos)
- ✅ Validar formato de email (debe rechazar emails inválidos)
- ✅ Probar con datos válidos y crear orden exitosamente
- ✅ Probar con datos inválidos y verificar mensajes de error
- ✅ Verificar que el número de orden es único
- ✅ Validar que el resumen de la compra es correcto (collar + charms seleccionados + precio estándar fijo)
- ✅ Verificar que el precio mostrado en la confirmación es el precio estándar (no calculado)
- ✅ Escenario negativo: Error de servidor al crear orden (mostrar mensaje apropiado, no perder datos del formulario si es posible)
- ✅ Escenario límite: Email muy largo, nombres con caracteres especiales, direcciones largas
- ✅ Validar que después de crear orden, el carrito se vacía (o se mantiene, según regla de negocio)
- ✅ Validar accesibilidad del formulario: labels, navegación por teclado, mensajes de error claros

---

## **Resumen de Priorización:**

| Historia | Prioridad | Complejidad | Valor de Negocio |
|----------|-----------|-------------|------------------|
| HU1: Ver producto base | MUST | Baja | Alto |
| HU2: Seleccionar charms | MUST | Baja | Alto |
| HU3: Vista previa visual en tiempo real | MUST | Media | Alto |
| HU4: Agregar al carrito | MUST | Media | Alto |
| HU5: Completar compra (simulada) | SHOULD | Media | Medio |

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

