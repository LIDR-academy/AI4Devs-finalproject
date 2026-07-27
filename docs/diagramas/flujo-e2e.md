# Diagrama de flujo E2E principal

Flujo end-to-end del MVP de Cactify: *Inventario → Seguimiento → Conocimiento → IA → Historial*.

```mermaid
flowchart TD
    A["Registrar especie y sus rangos de cuidado (0.6)"] --> B["Registrar un cactus seleccionando su especie y ubicación (0.1)"]
    B --> C["Introducir manualmente una lectura: humedad, temperatura, horas de luz, acidez del sustrato, riego (0.2)"]
    C --> D["El sistema compara la lectura con los rangos recomendados de la especie (0.3)"]
    D --> E["La IA genera una recomendación: riesgo, explicación, acción, prioridad (0.4)"]
    E --> F["La recomendación se guarda en el historial de la planta (0.5)"]
    F --> C
```

Los números entre paréntesis referencian las historias de usuario en [docs/user-stories](../user-stories/README.md).
