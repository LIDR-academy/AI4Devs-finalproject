sequenceDiagram
    participant Cliente as "Cliente (React)"
    participant DTO as "DTO (Filtro)"
    participant Controller as "Controller (Recepcionista)"
    participant Service as "Service (Cerebro)"
    participant Entity as "Entity/DB (Memoria)"

    Cliente->>DTO: Envía JSON {monto, concepto}
    DTO->>Controller: Valida tipos de datos (¿Es número?)
    Controller->>Service: Llama a createExpense()
    Service->>Service: Aplica lógica (¿Usuario pertenece al viaje?)
    Service->>Entity: Guarda en Base de Datos
    Entity-->>Service: Retorna objeto guardado
    Service-->>Controller: Retorna resultado
    Controller-->>Cliente: Respuesta HTTP 201 Created