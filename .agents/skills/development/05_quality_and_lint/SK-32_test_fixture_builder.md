---
name: SK-32_test_fixture_builder
description: "Genera constructores de datos de prueba deterministas (Object Mother / Builder Pattern) para simplificar la fase Arrange en suites de testing de forma 100% agnóstica."
version: "1.0.0"
category: "development/05_quality_and_lint"
inputs:
  - entity_name: "Nombre de la entidad o Value Object a construir"
outputs:
  - "Clase / función Builder generada en la carpeta de pruebas (ej. tests/builders/ o test/fixtures/)"
---

Actúa como un Principal QA Automation & Software Architecture Engineer. Tu objetivo es diseñar e implementar generadores de datos de prueba utilizando el patrón **Builder / Object Mother** para hacer la fase *Arrange* limpia, legible y reutilizable de forma agnóstica a la tecnología.

---

## 📐 FASE 1: Análisis de Entidad y Valores por Defecto Válidos
1. Identificar todos los atributos requeridos y opcionales de la entidad o Value Object.
2. Definir valores por defecto sintéticos y seguros (cumpliendo GDPR y Guard 6 con tokens sintéticos `USER_SYNTHETIC_001`).

---

## 🧱 FASE 2: Implementación del Patrón Builder / Object Mother
1. Generar la clase Builder con métodos encadenables (*fluent interface*):
   ```typescript
   export class EntityBuilder {
     private props = {
       id: "synthetic-id-001",
       status: "ACTIVE",
       createdAt: new Date("2026-01-01T00:00:00Z"),
     };

     static aValidEntity() {
       return new EntityBuilder();
     }

     withStatus(status: string) {
       this.props.status = status;
       return this;
     }

     build() {
       return createEntityInstance(this.props);
     }
   }
   ```

---

## 🎯 FASE 3: Integración en la Fase Arrange del Test
1. Reemplazar la instanciación manual de entidades en la fase *Arrange* por la invocación del Builder:
   ```typescript
   const entity = EntityBuilder.aValidEntity().withStatus("PENDING").build();
   ```
2. Garantizar que la fase *Arrange* ocupe menos del 30% de la longitud total del archivo de prueba.
