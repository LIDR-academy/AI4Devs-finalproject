# 4. Especificación de la API

La API está expuesta como un **servicio REST** desde la capa de **Presentation** en el backend (.NET 8).  
Los ejemplos están en formato **OpenAPI 3.0 (YAML)**.

Los 3 endpoints principales:

1. Registrar venta
2. Transferir inventario entre sedes
3. Consultar inventario por sede y total

---

## 4.1. Registrar venta

```yaml
paths:
  /sales:
    post:
      summary: Registrar una nueva venta
      tags:
        - Sales
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                locationId:
                  type: integer
                userId:
                  type: integer
                paymentMethod:
                  type: string
                  enum: [Cash, Card, BankTransfer, Deposit]
                items:
                  type: array
                  items:
                    type: object
                    properties:
                      productCode:
                        type: string
                      quantity:
                        type: integer
                      unitPrice:
                        type: number
      responses:
        "201":
          description: Venta registrada exitosamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  saleId:
                    type: integer
                  total:
                    type: number
                  date:
                    type: string
                    format: date-time
```

Ejemplo resquest:

```json
{
  "locationId": 2,
  "userId": 5,
  "paymentMethod": "Cash",
  "items": [
    { "productCode": "PROD-001", "quantity": 2, "unitPrice": 5000 },
    { "productCode": "PROD-002", "quantity": 1, "unitPrice": 15000 }
  ]
}
```

---

## 4.2. Transferir inventario entre sedes

```yaml
paths:
  /movements/transfer:
    post:
      summary: Registrar transferencia de productos entre sedes
      tags:
        - Movements
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                productCode:
                  type: string
                sourceLocationId:
                  type: integer
                targetLocationId:
                  type: integer
                quantity:
                  type: integer
                userId:
                  type: integer
      responses:
        "201":
          description: Transferencia registrada exitosamente
```

Ejemplo resquest:

```json
{
  "productCode": "PROD-001",
  "sourceLocationId": 1,
  "targetLocationId": 2,
  "quantity": 10,
  "userId": 1
}
```

## 4.3. Consultar inventario

```yaml
paths:
  /inventory:
    get:
      summary: Consultar inventario de productos
      tags:
        - Inventory
      parameters:
        - in: query
          name: locationId
          required: false
          schema:
            type: integer
          description: Id de la sede (si se omite retorna el consolidado)
      responses:
        "200":
          description: Inventario listado correctamente
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    productCode:
                      type: string
                    productName:
                      type: string
                    quantity:
                      type: integer
                    location:
                      type: string
                    totalCompanyStock:
                      type: integer
```

Ejemplo de response (por sede):

```json
[
  {
    "productCode": "PROD-001",
    "productName": "Camiseta",
    "quantity": 50,
    "location": "Sucursal Norte"
  },
  {
    "productCode": "PROD-002",
    "productName": "Pantalón",
    "quantity": 30,
    "location": "Sucursal Norte"
  }
]
```

Ejemplo de response (consolidado):

```json
[
  {
    "productCode": "PROD-001",
    "productName": "Camiseta",
    "totalCompanyStock": 120
  },
  {
    "productCode": "PROD-002",
    "productName": "Pantalón",
    "totalCompanyStock": 80
  }
]
```

- Todas las respuestas incluyen códigos HTTP estándar (201 Created, 200 OK, 400 Bad Request, etc.).
- El identificador de negocio para los productos en la API es productCode, no el ProductId.
- Autenticación y manejo de sesiones se implementarán en fases posteriores.
