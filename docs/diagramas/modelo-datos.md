# Diagrama del modelo de datos

Modelo mínimo previsto para el MVP de Cactify. Ver descripción detallada de campos en el [README](../../README.md#3-modelo-de-datos).

```mermaid
erDiagram
    SOIL_MIX ||--o{ SPECIES : "recomienda"
    SPECIES ||--o{ PLANT : "es de"
    LOCATION ||--o{ PLANT : "ubica"
    PLANT ||--o{ CARE_RECORD : "tiene"
    CARE_RECORD ||--o| AI_RECOMMENDATION : "genera"
    PLANT ||--o{ PLANT_TAG : "tiene"
    TAG ||--o{ PLANT_TAG : "se asigna en"

    SOIL_MIX {
        UUID id PK
        string name
        int organicPercentage
        int mineralPercentage
        decimal phMin
        decimal phMax
        string description
    }

    SPECIES {
        UUID id PK
        string scientificName
        string commonName
        int minHumidity
        int maxHumidity
        int minTemperature
        int maxTemperature
        int minLightHours
        int maxLightHours
        string wateringGuideline
        UUID soilMixId FK
    }

    LOCATION {
        UUID id PK
        string name
    }

    PLANT {
        UUID id PK
        string nickname
        UUID locationId FK
        UUID speciesId FK
        timestamp createdAt
    }

    TAG {
        UUID id PK
        string name
    }

    PLANT_TAG {
        UUID plantId FK
        UUID tagId FK
    }

    CARE_RECORD {
        UUID id PK
        UUID plantId FK
        int humidity
        int temperature
        int lightHours
        int waterAmountMl
        decimal soilPh
        timestamp recordedAt
    }

    AI_RECOMMENDATION {
        UUID id PK
        UUID careRecordId FK
        string riskLevel
        string recommendationText
        timestamp createdAt
    }
```

## Pendiente de decidir

Personalización de cuidados por ejemplar individual ([0.7](../user-stories/0.7-personalizar-cuidados-de-un-ejemplar.md)): añadir campos de override en `PLANT` (p. ej. `wateringOverride`, `lightOverride`, `temperatureOverride`) o crear una entidad `PLANT_CARE_OVERRIDE` separada. Se actualizará este diagrama cuando se tome la decisión.
