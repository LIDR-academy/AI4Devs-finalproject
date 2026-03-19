# Spec: External Order ID Generation

> **Origen**: [`external-order-id-coherence`](../../changes/archive/2026-03-13-external-order-id-coherence/)  
> **Última actualización**: 2026-03-13

---

### Requirement: Generación de externalOrderId para plataforma WOOCOMMERCE

El sistema SHALL generar un `externalOrderId` numérico entero para tiendas `WOOCOMMERCE`. Obtendrá el valor máximo de los `externalOrderId` numéricos existentes de esa tienda (filtrados con `/^\d+$/`) y sumará un delta aleatorio entero entre 1 y 5. Si no existen pedidos previos numéricos, devolverá `"100"`.

#### Scenario: Sin pedidos previos

- **WHEN** `ExternalOrderIdService.generate(storeId)` se ejecuta para una tienda WOOCOMMERCE sin pedidos
- **THEN** devuelve `"100"`

#### Scenario: Con pedidos previos numéricos

- **WHEN** `ExternalOrderIdService.generate(storeId)` se ejecuta para una tienda WOOCOMMERCE con pedidos cuyos `externalOrderId` son `["100", "102", "105"]`
- **THEN** devuelve un string que representa un entero entre `106` y `110` inclusive

#### Scenario: Pedidos existentes con IDs no numéricos se ignoran

- **WHEN** la tienda WOOCOMMERCE tiene pedidos con `externalOrderId` como `["abc", "100"]`
- **THEN** solo se considera `"100"` como base y el resultado es un entero entre `101` y `105`

---

### Requirement: Generación de externalOrderId para plataforma SHOPIFY

El sistema SHALL generar un `externalOrderId` para tiendas `SHOPIFY` infiriendo el patrón del pedido más reciente (`createdAt DESC`). Aplicará la regex `/^(.*?)(\d{4,})(.*)$/` para extraer prefijo, número (≥4 dígitos) y sufijo, sumará 1 al número preservando el padding de ceros, y reconstruirá con el mismo prefijo y sufijo. Si no hay pedidos previos, devolverá `"1001"`.

#### Scenario: Sin pedidos previos

- **WHEN** `ExternalOrderIdService.generate(storeId)` se ejecuta para una tienda SHOPIFY sin pedidos
- **THEN** devuelve `"1001"`

#### Scenario: Con patrón prefijo-número-sufijo

- **WHEN** el pedido más reciente de la tienda tiene `externalOrderId = "MM-01007-OUT"`
- **THEN** devuelve `"MM-01008-OUT"`

#### Scenario: Con número simple (sin prefijo ni sufijo)

- **WHEN** el pedido más reciente de la tienda tiene `externalOrderId = "1005"`
- **THEN** devuelve `"1006"`

#### Scenario: Preservación del padding de ceros

- **WHEN** el pedido más reciente tiene `externalOrderId = "MM-01001-OUT"` (número `01001`, 5 dígitos)
- **THEN** devuelve `"MM-01002-OUT"` preservando el pad de 5 dígitos

---

### Requirement: Generación de externalOrderId para plataforma PRESTASHOP

El sistema SHALL generar un `externalOrderId` de exactamente 9 letras mayúsculas (A-Z) aleatorias para tiendas `PRESTASHOP`. Verificará que no exista ya un pedido de esa tienda con ese valor. Reintentará hasta 10 veces ante colisión; si se supera el límite, lanzará un error.

#### Scenario: Generación exitosa

- **WHEN** `ExternalOrderIdService.generate(storeId)` se ejecuta para una tienda PRESTASHOP
- **THEN** devuelve una cadena de exactamente 9 caracteres, todos letras mayúsculas (A-Z)

#### Scenario: Reintento ante colisión

- **WHEN** la primera cadena generada coincide con un `externalOrderId` existente de la tienda
- **THEN** el servicio genera una nueva cadena en el segundo intento y la devuelve

#### Scenario: Error al superar 10 reintentos

- **WHEN** los 10 intentos generan cadenas que colisionan con pedidos existentes
- **THEN** el servicio lanza un error describiendo el problema

---

### Requirement: Fallback para plataformas desconocidas

El sistema SHALL devolver `"SIM-" + Date.now()` para cualquier plataforma no reconocida o no implementada.

#### Scenario: Plataforma desconocida

- **WHEN** `ExternalOrderIdService.generate(storeId)` se ejecuta para una tienda con plataforma diferente a `WOOCOMMERCE`, `SHOPIFY` y `PRESTASHOP`
- **THEN** devuelve un string con formato `"SIM-<timestamp>"`
