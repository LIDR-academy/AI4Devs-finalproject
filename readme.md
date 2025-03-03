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
Ximena Paparella

### **0.2. Nombre del proyecto:** 
Gifty

### **0.3. Descripción breve del proyecto:** 
The Gift Vouchers Platform is designed to enable businesses to create, sell, and manage customizable gift certificates. The platform will cater to small businesses, service providers, and enterprises, providing tools for personalization, sales tracking, and voucher validation through QR codes and unique alphanumeric codes. It will support white-label capabilities and integration with various platforms like WordPress and custom websites. The MVP will focus on the Argentine market, with plans to expand internationally.

### **0.4. URL del proyecto:** 

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

https://github.com/ximepaparella/AI4Devs-finalproject-XP


---

## 1. Descripción general del producto


### **1.1. Objetivo:** 

- Provide an easy-to-use platform for small businesses and entrepreneurs to create and manage gift certificates.
- Enable customers to purchase and redeem vouchers with secure validation methods.
- Offer white-label solutions for businesses to customize the platform to their brand.
- Integrate seamlessly with popular CMS platforms and payment gateways.
- Deliver a scalable solution with robust analytics and multilingual capabilities.

### **1.2. Características y funcionalidades principales:**

### Voucher Creation and Customization

- Customizable sender and recipient details.
- Add personal messages.
- Choose from a variety of voucher templates.
- Set expiration dates and usage restrictions.
- Attach vouchers to specific services or products.
- Enable store managers to create and resend vouchers without requiring payment.

### Payment Integration

- Support for Mercado Pago in the MVP.
- Scalability to add PayPal and Stripe for international payments.

### Validation and Redemption

- QR code generation for easy scanning.
- Unique alphanumeric codes for manual validation.
- Redemption tracking for businesses.

### White-Label Features

- Custom branding (logos, colors, domain).
- API access for integration with client platforms.

### Analytics and Reporting

#### Key metrics for businesses:
- Sales trends.
- Top-selling products/services.
- Unused vouchers.
- Monthly sales reports.

#### Platform-wide metrics for administrators.

### Customer Experience

- Automated email notifications for:
  - Purchase confirmation.
  - Voucher delivery.
  - Expiration reminders.
- User-friendly interface for customization.
- Customer login to view vouchers, expiration dates, and transaction history.

## Integration Capabilities

- Ready-to-use plugin for WordPress.
- APIs for custom websites.
- Future support for widgets.

### Multi-Purchase Capability

- Allow customers to buy multiple vouchers in a single transaction.
- Generate separate vouchers for each product or service purchased.


## Diagramas

### Main Flow

This diagram gives a global view of how all users interact within the system. 
Reference flows/main-flows.png

`graph TD;
  A[Customer Browses Vouchers] -->|Selects & Customizes| B[Voucher Purchase]
  B -->|Payment Processed| C[Generate Voucher]
  C -->|Send via Email| D[Customer Receives Voucher]
  D -->|Views in My Account| E[Customer Dashboard]
  D -->|Presents QR Code| F[Voucher Redemption]
  F -->|Scans QR/Code Validation| G[Store Manager Confirms]
  G -->|Voucher Marked as Redeemed| H[Transaction Completed]
 subgraph Store Manager
    I[Create & Manage Vouchers] -->|Generate New Vouchers| C
    I -->|Modify & Resend| J[Voucher Resend]
    G -->|View Sales & Analytics| K[Sales Dashboard]
  end
 subgraph Administrator
    L[Manage Businesses & Users] -->|Oversee Activities| M[Platform Analytics]
    M -->|Monitor Sales & Reports| K
  end
`

###  Voucher Creation Flow
The adminsitrator or store creates the services and the expirations or restriction to allow users to buy that voucher to gift.

Reference: flows/voucher-creation.png

`graph TD;
  A[Store Manager Logs In] --> B[Navigates to Dashboard]
  B --> C[Clicks 'Create New Voucher']
  C --> D[Enters Voucher Details]
  D -->|Selects Type| E{Voucher Type}
  E -->|Service-based| F[Attach to a Service]
  E -->|Product-based| G[Attach to a Product]
  F --> H[Set Expiration & Restrictions]
  G --> H
  H --> I[Select Template or Upload Custom Design]
  I --> J[Generate QR Code & Unique Key]
  J --> K[Save & Confirm Voucher]
  K --> L[Voucher Created & Available]
`

### Voucher Purchase Flow (buyer experience)

All the users can interact with the stores page to select the service or product to buy a gift voucher and customize to use or give to another person. Reference: flows/buyer-flow.png

`graph TD;
  A[Customer Browses Store Page] --> B[Selects Voucher]
  B --> C[Customizes Voucher]
  C -->|Adds Recipient, Message, Template| D[Proceeds to Checkout]
  D --> E[Selects Payment Method]
  E -->|Confirms Payment| F[Payment Processing]
  F -->|Success| G[Voucher Generated]
  G --> H[Voucher Sent via Email]
  G --> I[Customer Can View in My Account]
  H --> J[Receives Confirmation Email with QR Code]
`
### Voucher Redemption Flow

The user go to the store or exchange it online to validate the one use of that voucher and access to the benefict (service or product). Reference flows/redemtion-flow.png

`graph TD;
  A[Customer Visits Store] --> B[Presents QR Code or Unique Key]
  B --> C[Store Manager Logs into Dashboard]
  C --> D[Accesses 'Redeem Voucher' Section]
  D -->|Scans QR Code| E[System Validates Voucher]
  D -->|Manually Enters Code| E
  E -->|Valid Voucher| F[Mark as Redeemed]
  F --> G[Update Customer & Store Records]
  G --> H[Transaction Completed]
  E -->|Invalid Voucher| I[Display Error Message]
`

### Administrator Oversight Flow
This is the main view of the dashboard for the stores to see the analytics and data for the vouchers that have been purchased, used, expired or resend those vouchers to the buyers. Reference: flows/admin-overview.png

`graph TD;
  A[Administrator Logs In] --> B[Accesses Admin Dashboard]
  B --> C[Manages Businesses & Users]
  B --> D[Oversees Voucher Transactions]
  B --> E[Monitors Sales & Redemption Data]
  C -->|Approve or Disable Stores| F[Update Store Status]
  D -->|View Active & Redeemed Vouchers| G[Export Reports]
  E -->|Analyze Sales Trends| H[Generate Analytics Reports]
  H --> I[Identify Growth Opportunities]
`

### **1.3 Analisis de mercado y competencias:**
https://docs.google.com/document/d/1BxpFzMfPuDJVSnw77Ef5vIN7iODImbm6NZtPzr1DvAs/edit?tab=t.0

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---


### **2.1. Diagrama de arquitectura:**

El stack seleccionado y comentado a continuacion fue elegido con el objetivo de hacer un sitio a la vanguardia del mercado, de facil utilizacion y administracion por distintos desarrolladores y que cuide los patrones de desarrollo pensando en la escalabilidad y la mantenibilidad el proyecto. En node sacrificamos un poco el multithread pero realmente no lo creemos necesario de escalar a tales niveles y MongoDB es seleccionada para obtener una base mas escalable en distitos stores, pudiendo generar collections mas organizadas en caso de que la aplicacion escale, y no tener tanta anidacion de relaciones.

La arquitectura de carpetas sera hexagonal con screaming architecture para beneficiar el entendimiento y la posibilidad de luego separar las entidades generando microservicios individuales. 

El stack de react y nextjs esta siendo pensado para utilizar el Server side render y permitir la mayor performance posible de cara a los Web Vitals y a un buen posicionamiento dado que next nos beneficiara con su buena aplicacion de SEO.

### Frontend - React
Use Next.js for SSR (Server-Side Rendering) & improved performance.
Tailwind CSS or SASS
React Query
AntD

### Backend - Node.js API
Express.js (lightweight and flexible) or NestJS (for modular architecture).
Mongoose for MongoDB ORM.
Joi for request validation.
Helmet & CORS for security.
Winston or Pino for logging.
Rate Limiting (Express-Rate-Limit) to prevent API abuse.


### Database
MongoDB
MongoDB Atlas for cloud hosting (or self-hosted MongoDB if needed).
Indexing & Aggregations to optimize queries.
Mongoose Schema Validations to enforce data consistency.

### Security
JWT + Refresh Tokens to manage authentication securely.
bcrypt for password hashing.
Environment Variables (.env) to store secrets securely.
OAuth2 for social logins (Google, Facebook, etc.).

### Infrastructure & DevOps
Docker to containerize the application.
CI/CD Pipelines with GitHub Actions or GitLab CI/CD.
PM2 or Docker Compose for backend process management.

### Tests
Jest for unit testing
Cypress for testing end to end for core functionalities

### Payments
Mercado Pago APK

### Further improvements:
Redis for session storage and API response caching.
Redis for caching frequently accessed data.
Load Balancer (NGINX or AWS ALB) for traffic management.
Microservices (Future Scaling) – If needed later.


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

### Relations Diagram

`erDiagram
    USER ||--o{ STORE : owns
    STORE ||--o{ PRODUCT : offers
    STORE ||--o{ VOUCHER : issues
    PRODUCT ||--o{ VOUCHER : linked_to
    USER ||--o{ ORDER : places
    ORDER ||--|{ PAYMENTDETAILS : has
    VOUCHER ||--|{ VOUCHERUSAGE : used_in
    USER ||--o{ VOUCHERUSAGE : redeems
    USER ||--o{ VOUCHER : purchases
`


### Class Diagram

`classDiagram
    class USER {
        string _id PK
        string name
        string email UNIQUE
        string password
        string role ENUM("admin", "store_manager", "customer")
        date createdAt
        date updatedAt
    }
    
    class STORE {
        string _id PK
        string name
        string ownerId FK
        string email UNIQUE
        string phone
        string address
        date createdAt
        date updatedAt
    }
    
    class PRODUCT {
        string _id PK
        string storeId FK
        string name
        string description
        float price
        boolean isActive
        date createdAt
        date updatedAt
    }
    
    class VOUCHER {
        string _id PK
        string storeId FK
        string productId FK
        string customerId FK NULLABLE
        string code UNIQUE
        string status ENUM("active", "redeemed", "expired")
        date expirationDate
        string qrCode
        date createdAt
        date updatedAt
    }

    class ORDER {
        string _id PK
        string customerId FK
        string voucherId FK
        object paymentDetails
        date createdAt
        date updatedAt
    }
    
    class PAYMENTDETAILS {
        string paymentId UNIQUE
        string paymentStatus ENUM("pending", "completed", "failed")
        string paymentEmail
        float amount
        string provider ENUM("mercadopago", "paypal", "stripe")
    }

    class VOUCHERUSAGE {
        string _id PK
        string voucherId FK
        string storeId FK
        string customerId FK
        date usedAt
    }

    class ADMIN {
        string _id PK
        string userId FK
        date createdAt
        date updatedAt
    }
`


### **3.2. Descripción de entidades principales:**

#### 1. **User**
- **_id** (string, PK): Unique identifier for the user.
- **name** (string): Full name of the user.
- **email** (string, UNIQUE): Email address for login and communication.
- **password** (string): Hashed password for authentication.
- **role** (enum): Defines the user type. Possible values: `admin`, `store_manager`, `customer`.
- **createdAt** (date): Timestamp when the user was created.
- **updatedAt** (date): Timestamp of the last update.

#### 2. **Store**
- **_id** (string, PK): Unique identifier for the store.
- **name** (string): Name of the store.
- **ownerId** (string, FK): Reference to the user (store owner).
- **email** (string, UNIQUE): Contact email of the store.
- **phone** (string): Contact phone number.
- **address** (string): Physical address of the store.
- **createdAt** (date): Timestamp when the store was created.
- **updatedAt** (date): Timestamp of the last update.

#### 3. **Product**
- **_id** (string, PK): Unique identifier for the product or service.
- **storeId** (string, FK): Reference to the store that offers this product.
- **name** (string): Name of the product/service.
- **description** (string): Detailed description of the product/service.
- **price** (float): Price of the product/service.
- **isActive** (boolean): Whether the product/service is currently available.
- **createdAt** (date): Timestamp when the product was created.
- **updatedAt** (date): Timestamp of the last update.

#### 4. **Voucher**
- **_id** (string, PK): Unique identifier for the voucher.
- **storeId** (string, FK): Reference to the store issuing the voucher.
- **productId** (string, FK): Reference to the associated product/service.
- **customerId** (string, FK, NULLABLE): Reference to the customer who owns the voucher.
- **code** (string, UNIQUE): Unique alphanumeric voucher code.
- **status** (enum): Status of the voucher. Possible values: `active`, `redeemed`, `expired`.
- **expirationDate** (date): Expiry date of the voucher.
- **qrCode** (string): QR code for voucher validation.
- **createdAt** (date): Timestamp when the voucher was created.
- **updatedAt** (date): Timestamp of the last update.

#### 5. **Order**
- **_id** (string, PK): Unique identifier for the order.
- **customerId** (string, FK): Reference to the customer who placed the order.
- **voucherId** (string, FK): Reference to the purchased voucher.
- **paymentDetails** (object): Contains details of the payment transaction.
- **createdAt** (date): Timestamp when the order was placed.
- **updatedAt** (date): Timestamp of the last update.

#### 6. **PaymentDetails** (Embedded in Order)
- **paymentId** (string, UNIQUE): Payment provider's transaction ID.
- **paymentStatus** (enum): Status of the payment. Possible values: `pending`, `completed`, `failed`.
- **paymentEmail** (string): Email associated with the payment.
- **amount** (float): Total amount paid.
- **provider** (enum): Payment provider used. Possible values: `mercadopago`, `paypal`, `stripe`.

#### 7. **VoucherUsage**
- **_id** (string, PK): Unique identifier for the voucher usage log.
- **voucherId** (string, FK): Reference to the used voucher.
- **storeId** (string, FK): Reference to the store where the voucher was redeemed.
- **customerId** (string, FK): Reference to the customer who used the voucher.
- **usedAt** (date): Timestamp when the voucher was redeemed.

#### 8. **Admin**
- **_id** (string, PK): Unique identifier for the admin.
- **userId** (string, FK): Reference to the user assigned as an admin.
- **createdAt** (date): Timestamp when the admin role was assigned.
- **updatedAt** (date): Timestamp of the last update.


---

## 4. Especificación de la API

```yaml
openapi: 3.0.0
info:
  title: Gift Voucher System API
  description: API for managing gift vouchers, orders, and redemptions
  version: 1.0.0

paths:
  /users/{userId}:
    get:
      summary: Get User by ID
      description: Retrieve a user by their unique identifier.
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: User details retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  _id:
                    type: string
                  name:
                    type: string
                  email:
                    type: string
                  role:
                    type: string
                    enum: [admin, store_manager, customer]
                  createdAt:
                    type: string
                    format: date-time
                  updatedAt:
                    type: string
                    format: date-time
        '404':
          description: User not found

  /vouchers:
    post:
      summary: Create a new Voucher
      description: Generates a new voucher linked to a product and store.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [storeId, productId, code, expirationDate]
              properties:
                storeId:
                  type: string
                productId:
                  type: string
                customerId:
                  type: string
                  nullable: true
                code:
                  type: string
                status:
                  type: string
                  enum: [active, redeemed, expired]
                expirationDate:
                  type: string
                  format: date-time
      responses:
        '201':
          description: Voucher created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  _id:
                    type: string
                  storeId:
                    type: string
                  productId:
                    type: string
                  code:
                    type: string
                  expirationDate:
                    type: string
                    format: date-time
        '400':
          description: Invalid input data

  /orders:
    post:
      summary: Create a new Order
      description: Places an order for a voucher purchase.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [customerId, voucherId, paymentDetails]
              properties:
                customerId:
                  type: string
                voucherId:
                  type: string
                paymentDetails:
                  type: object
                  properties:
                    paymentId:
                      type: string
                    paymentStatus:
                      type: string
                      enum: [pending, completed, failed]
                    paymentEmail:
                      type: string
                    amount:
                      type: number
                    provider:
                      type: string
                      enum: [mercadopago, paypal, stripe]
      responses:
        '201':
          description: Order created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  _id:
                    type: string
                  customerId:
                    type: string
                  voucherId:
                    type: string
                  paymentDetails:
                    type: object
                    properties:
                      paymentId:
                        type: string
                      paymentStatus:
                        type: string
                      paymentEmail:
                        type: string
                      amount:
                        type: number
                      provider:
                        type: string
        '400':
          description: Invalid input data
```


---

## 5. Historias de Usuario

PRD: https://docs.google.com/document/d/1cy7LfPV6TeUMitq3cQNGqtmtuxlmfG6iagUYqQQopuM/edit?usp=sharing

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**
## User Story 1: Create a Voucher

### Title: Store Manager can create a voucher

**Description:**  
As a Store Manager, I want to create a voucher for a specific product or service, so that customers can purchase and redeem it.

### Acceptance Criteria:
- The Store Manager can input the required details (`storeId`, `productId`, `code`, `expirationDate`).
- The voucher is stored in the system with a unique identifier and status (`active`).
- The Store Manager receives a confirmation that the voucher has been created.
- The system validates that all required fields are provided.
- The Store Manager can see the newly created voucher in their dashboard.



**Historia de Usuario 2**

## User Story 2: Purchase a Voucher

### Title: Customer can purchase a voucher

**Description:**  
As a Customer, I want to purchase a voucher online, so that I can redeem it later for a product or service.

### Acceptance Criteria:
- The customer can select a voucher and proceed to checkout.
- The system processes the payment and generates an order.
- The customer receives an email confirmation with the voucher details.
- The order is stored in the system with the payment details.

**Historia de Usuario 3**

## User Story 3: Redeem a Voucher

### Title: Customer can redeem a voucher

**Description:**  
As a Customer, I want to redeem my voucher at a store, so that I can claim the purchased product or service.

### Acceptance Criteria:
- The customer presents their voucher at the store.
- The Store Manager can scan the QR code or enter the voucher code manually.
- The system validates the voucher and updates its status to redeemed.
- The customer and Store Manager receive a confirmation.

---

## 6. Tickets de Trabajo

**Ticket 1**

## Development Tickets for User Story 1

### Backend: Implement Voucher Creation API

#### Title: Develop API endpoint for voucher creation

**Description:**  
Implement the `/vouchers` endpoint to allow Store Managers to create vouchers.

**Tasks:**
- Create a `POST /vouchers` API endpoint.
- Implement request validation for required fields.
- Store the voucher in MongoDB with a unique code.
- Return a success message upon creation.
- Add error handling for missing or invalid fields.

---

### Frontend: Build Voucher Creation Form

#### Title: Develop UI for creating a voucher

**Description:**  
Implement a form on the Store Manager's dashboard to allow voucher creation.

**Tasks:**
- Design and implement a form with fields (`storeId`, `productId`, `code`, `expirationDate`).
- Validate inputs before submitting.
- Display success/failure messages.
- Update the dashboard to reflect new vouchers.

---

### Database: Define Voucher Schema

#### Title: Set up MongoDB schema for vouchers

**Description:**  
Define the Voucher model in MongoDB.

**Tasks:**
- Create a `voucher` collection with fields (`storeId`, `productId`, `customerId`, `code`, `status`, `expirationDate`, `qrCode`).
- Ensure the `code` field is unique.
- Implement indexing for optimized queries.

**Ticket 2**

## Development Tickets for User Story 2

### Backend: Implement Order Processing API

#### Title: Develop API for processing voucher purchases

**Description:**  
Implement the `/orders` endpoint to handle voucher purchases.

**Tasks:**
- Create a `POST /orders` API endpoint.
- Validate request payload (`customer`, `voucher`, `payment details`).
- Process payment via MercadoPago.
- Store order details in MongoDB.
- Send email confirmation to the customer.

---

### Frontend: Implement Voucher Purchase Flow

#### Title: Develop UI for voucher purchase

**Description:**  
Implement the frontend flow for purchasing a voucher.

**Tasks:**
- Allow customers to select a voucher and proceed to checkout.
- Integrate with the payment gateway.
- Show purchase confirmation and receipt.

---

### Database: Define Order Schema

#### Title: Set up MongoDB schema for orders

**Description:**  
Define the Order model in MongoDB.

**Tasks:**
- Create an `order` collection with fields (`customerId`, `voucherId`, `paymentDetails`, `status`).
- Ensure data integrity between vouchers and orders.


**Ticket 3**

## Development Tickets for User Story 3

### Backend: Implement Voucher Redemption API

#### Title: Develop API for voucher redemption

**Description:**  
Implement the `/vouchers/redeem` endpoint to validate and mark vouchers as redeemed.

**Tasks:**
- Create a `POST /vouchers/redeem` API endpoint.
- Validate voucher code and store ID.
- Update the voucher status to redeemed.
- Send confirmation to the Store Manager and customer.

---

### Frontend: Implement Redemption Flow

#### Title: Develop UI for voucher redemption

**Description:**  
Implement the interface for scanning and redeeming vouchers.

**Tasks:**
- Allow Store Managers to enter a voucher code or scan a QR code.
- Show success/failure messages based on validation.
- Update the dashboard with redeemed vouchers.

---

### Database: Define Voucher Usage Schema

#### Title: Set up MongoDB schema for voucher usage

**Description:**  
Define the `VoucherUsage` model in MongoDB.

**Tasks:**
- Create a `voucherUsage` collection with fields (`voucherId`, `storeId`, `customerId`, `usedAt`).
- Ensure validation for tracking redemptions.

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

