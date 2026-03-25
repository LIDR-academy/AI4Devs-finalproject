# 5. Historias de Usuario

### **Historia de Usuario 1: Búsqueda de Ruta con Filtros de Tiempo**

**Título:** Como usuario corporativo (commuter), quiero buscar rutas filtrando por fecha y hora de llegada/salida para encontrar la opción que mejor se ajuste a mi horario laboral.

**Criterios de Aceptación:**

* **Dado** que estoy en la pantalla de búsqueda,
* **Cuando** ingreso mi origen y destino, y selecciono una fecha específica,
* **Y** establezco un filtro de hora (ej. "Llegada antes de las 09:00h"),
* **Entonces** el sistema debe mostrar únicamente las rutas cuya hora de llegada a la parada asignada sea anterior o igual a las 09:00h.
* **Y** las rutas mostradas deben respetar el radio de búsqueda configurado para mi ubicación.
* **Y** si no hay rutas que cumplan con el filtro, se debe mostrar un mensaje amigable indicando que no se encontraron resultados.

**Casos Borde y Manejo de Errores:**

* **Fecha Pasada:** Si el usuario intenta seleccionar una fecha anterior a la actual, el sistema debe bloquear la selección o mostrar un error "No es posible buscar viajes en el pasado".
* **Sin Resultados:** Si no existen rutas que cumplan con el filtro de hora, mostrar componente "Empty State" con sugerencia de "Prueba ampliando tu rango de horario".
* **Fuera de Radio:** Si la dirección ingresada está fuera del radio de servicio, mostrar error "Tu ubicación no tiene paradas cercanas disponibles".

**Notas:**

* El sistema debe impedir seleccionar fechas diferentes para ida y vuelta en la misma búsqueda inicial.
* La parada asignada se calcula automáticamente basándose en la cercanía al domicilio ingresado.

---

### **Historia de Usuario 2: Visualización y Selección de Resultados**

**Título:** Como usuario, quiero ver los resultados de búsqueda ordenados por hora y con información clara de horarios para poder comparar y elegir rápidamente la mejor opción.

**Criterios de Aceptación:**

* **Dado** que he realizado una búsqueda válida,
* **Cuando** se cargan los resultados,
* **Entonces** las rutas deben aparecer listadas ordenadas de forma ascendente por su hora de salida.
* **Y** para rutas con múltiples expediciones, debo ver el horario principal y un indicador de "+ otros horarios".
* **Y** cada tarjeta de resultado debe mostrar claramente la hora de salida, hora de llegada estimada y el nombre de la ruta.

**Casos Borde y Manejo de Errores:**

* **Error de API:** Si falla la carga de resultados (timeout/error 500), mostrar mensaje "No pudimos cargar las rutas. Por favor intenta nuevamente" con botón de reintentar.
* **Datos Incompletos:** Si una ruta viene sin horario definido, no debe mostrarse en el listado para evitar confusión.

**Notas:**

* Se debe validar si los usuarios prefieren una vista de lista o de mapa (pendiente de test A/B según PRD).

---

### **Historia de Usuario 3: Flujo de Selección para Viaje de Ida y Vuelta**

**Título:** Como usuario, quiero seleccionar mi viaje de ida y luego mi viaje de vuelta de forma secuencial para no confundirme con demasiadas opciones al mismo tiempo.

**Criterios de Aceptación:**

* **Dado** que he seleccionado un tipo de viaje "Ida y Vuelta" (Round-trip),
* **Cuando** realizo la búsqueda,
* **Entonces** primero debo ver y seleccionar una opción para el tramo de "Ida" (Outbound).
* **Y** una vez seleccionada la ida, el sistema debe llevarme automáticamente a la selección del tramo de "Vuelta" (Return).
* **Y** la selección de la vuelta debe mantener el contexto de la fecha seleccionada (misma fecha).

**Casos Borde y Manejo de Errores:**

* **Abandono de flujo:** Si el usuario recarga la página en el paso 2 (Vuelta), el sistema debe intentar recuperar la selección de Ida o redirigir al inicio si no es posible.
* **Sin vuelta disponible:** Si se selecciona una ida pero no hay rutas de regreso disponibles para ese día, mostrar mensaje "No hay rutas de regreso disponibles para esta fecha" y permitir reiniciar o elegir solo ida.

**Notas:**

* Este flujo secuencial busca reducir la carga cognitiva comparado con mostrar todas las combinaciones posibles a la vez.
