# SplitEat: API & Integration Contracts

This document contains the exact API specifications for SplitEat's serverless backend (Firebase Functions) and external integrations (Google Cloud Vision and Bizum).

---

## 1. Cloud OCR API Specification

- **Endpoint**: `POST /api/v1/ocr`
- **Authentication**: Optional Bearer Token (`Authorization: Bearer <Firebase_ID_Token>`). Anonymous users are rate-limited to 5 requests per day based on client IP.
- **Content-Type**: `application/json`

### 1.1 Request Payload
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE...",
  "locale": "es-ES",
  "clientTimestamp": 1780796880000
}
```

### 1.2 Response Payload (200 OK)
Returns a structured, normalized receipt object parsed by the server regex/heuristics engine.

```json
{
  "success": true,
  "data": {
    "metadata": {
      "restaurantName": "La Tagliatella",
      "date": "2026-06-07T01:10:00Z",
      "taxAmount": 4.20,
      "subtotal": 42.00,
      "totalAmount": 46.20
    },
    "items": [
      {
        "id": "fe9a2e31-897b-402e-9d22-263a233633cf",
        "name": "Pizza Carbonara",
        "quantity": 2,
        "unitPrice": 14.50,
        "totalPrice": 29.00
      },
      {
        "id": "a7b3c29d-4e9b-43a1-9492-23c2a39281db",
        "name": "Agua Mineral",
        "quantity": 3,
        "unitPrice": 2.50,
        "totalPrice": 7.50
      },
      {
        "id": "c89b213a-928d-4e1b-9f93-12a83c72dbe2",
        "name": "Tiramisu",
        "quantity": 1,
        "unitPrice": 5.50,
        "totalPrice": 5.50
      }
    ]
  }
}
```

### 1.3 Error Responses

#### 400 Bad Request (Invalid/Corrupted Image)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_IMAGE",
    "message": "The provided base64 string could not be processed as a valid image."
  }
}
```

#### 429 Too Many Requests (Rate Limit Exceeded)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Daily scan limit reached. Register to obtain unlimited receipt scans."
  }
}
```

---

## 2. Bizum QR & Message Generator API

Generates a dynamic Bizum payment link and a custom QR code. The payment string conforms to the standardized Bizum scheme: `https://bizum.es/pagar?phone={phone}&amount={amount}&concept={concept}`.

- **Endpoint**: `GET /api/v1/payment/bizum`
- **Authentication**: Required (Valid ID Token).
- **Request Parameters**:
  - `phone` (string, required): Spain phone format (e.g., `+34600112233` or `600112233`).
  - `amount` (number, required): Format `XX.XX` (e.g., `12.55`).
  - `concept` (string, optional): URL-encoded concept (e.g., `SplitEat%20Cena%20Tagliatella`).

### 2.1 Response Payload (200 OK)
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://bizum.es/pagar?phone=600112233&amount=12.55&concept=SplitEat%20Cena%20Tagliatella",
    "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM...",
    "formattedMessage": "¡Hola! Me debes 12.55€ de la cena en La Tagliatella. Puedes pagarme por Bizum aquí: https://bizum.es/pagar?phone=600112233&amount=12.55&concept=SplitEat"
  }
}
```

---

## 3. Contacts / Groups Synchronization Service

Saves and retrieves frequent contacts and family subgroups to Firestore.

- **Endpoint**: `POST /api/v1/contacts/sync`
- **Authentication**: Required.
- **Content-Type**: `application/json`

### 3.1 Request Payload
```json
{
  "contacts": [
    {
      "id": "c7a82b9e-43a1-9492-23c2a39281db",
      "name": "Elena Gómez",
      "phone": "+34678123456"
    }
  ],
  "groups": [
    {
      "id": "d89b213a-928d-4e1b-9f93-12a83c72dbe2",
      "name": "Familia Gómez",
      "memberIds": ["c7a82b9e-43a1-9492-23c2a39281db", "e9b213a-928d-4e1b-9f93-12a83c72dbe3"]
    }
  ]
}
```

### 3.2 Response Payload (200 OK)
```json
{
  "success": true,
  "syncedAt": 1780796880120,
  "recordsCount": {
    "contacts": 1,
    "groups": 1
  }
}
```
