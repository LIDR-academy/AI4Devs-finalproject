# F.5 - App móvil con sincronización de sensores por Bluetooth

**Estado:** Fuera de alcance del MVP / Roadmap

## Historia

**Como** propietario de un vivero
**Quiero** una app móvil que se conecte por Bluetooth a sondas/sensores portátiles (humedad, temperatura) y sincronice automáticamente las lecturas con el backend
**Para** capturar los datos de cada cactus en el momento de medirlo en el invernadero, sin tener que anotarlos a mano y transcribirlos después a la web.

## Notas

* Prioridad alta dentro del roadmap: es la evolución más directa del registro manual del MVP ([0.2](0.2-registrar-condiciones-de-cultivo.md)) — mismo dato, mismo modelo (`CareRecord`), pero capturado con un sensor en vez de tecleado, sin necesidad de instalar hardware fijo en cada planta.
* Relacionada con [F.4](F.4-carga-automatica-desde-sensor-iot.md) (carga automática desde sensor IoT), pero con un enfoque distinto: aquí el puente es el móvil del propietario leyendo una sonda BLE puntual, no un dispositivo fijo tipo ESP32 conectado permanentemente por WiFi a cada planta. Esto reduce el coste y la complejidad de desplegar hardware por ejemplar.
* Requeriría: app móvil (probablemente multiplataforma), integración BLE con la sonda elegida, y un endpoint de sincronización en el backend (reutilizando `POST /plants/{id}/care-records`).
* Sigue fuera del MVP por la misma razón que [F.4](F.4-carga-automatica-desde-sensor-iot.md): depende de hardware externo (la sonda BLE) y de desarrollo de app nativa, lo que excede las ~30 horas disponibles para el MVP.
