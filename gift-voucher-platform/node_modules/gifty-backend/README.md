# Gift Voucher Platform API

This is the backend API for the Gift Voucher Platform, a system for managing gift vouchers, stores, and users.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd gift-voucher-platform/packages/backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=1d
   ```
5. Start the development server:
   ```
   npm run dev
   ```

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

Authentication is required for most endpoints. Use the JWT token received from the login endpoint in the Authorization header:

```
Authorization: Bearer <token>
```

### Error Handling

All endpoints return a consistent error format:

```json
{
  "success": false,
  "error": "Error message or array of validation errors"
}
```

### User Endpoints

#### Get All Users

Retrieves a list of all users.

- **URL**: `/users`
- **Method**: `GET`
- **Access**: Admin
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "count": 2,
      "data": [
        {
          "_id": "60d21b4667d0d8992e610c85",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "customer",
          "createdAt": "2023-06-22T19:12:38.657Z",
          "updatedAt": "2023-06-22T19:12:38.657Z"
        },
        {
          "_id": "60d21b4667d0d8992e610c86",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "role": "store_manager",
          "createdAt": "2023-06-22T19:12:38.657Z",
          "updatedAt": "2023-06-22T19:12:38.657Z"
        }
      ]
    }
    ```

#### Get User by ID

Retrieves a specific user by ID.

- **URL**: `/users/:id`
- **Method**: `GET`
- **URL Parameters**: 
  - `id`: MongoDB ObjectId of the user
- **Access**: Admin or the user themselves
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "customer",
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:12:38.657Z"
      }
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Invalid ID format
    - 404 Not Found - User not found

#### Create User

Creates a new user.

- **URL**: `/users`
- **Method**: `POST`
- **Access**: Admin or Public (for customer registration)
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "customer"
  }
  ```
- **Response**:
  - **Code**: 201 Created
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "customer",
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:12:38.657Z"
      }
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Validation error or email already exists

#### Update User

Updates an existing user.

- **URL**: `/users/:id`
- **Method**: `PUT`
- **URL Parameters**: 
  - `id`: MongoDB ObjectId of the user
- **Access**: Admin or the user themselves
- **Request Body**:
  ```json
  {
    "name": "John Updated",
    "email": "john.updated@example.com",
    "role": "store_manager"
  }
  ```
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "John Updated",
        "email": "john.updated@example.com",
        "role": "store_manager",
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:15:38.657Z"
      }
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Invalid ID format, validation error, or email already in use
    - 404 Not Found - User not found

#### Delete User

Deletes a user.

- **URL**: `/users/:id`
- **Method**: `DELETE`
- **URL Parameters**: 
  - `id`: MongoDB ObjectId of the user
- **Access**: Admin
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {}
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Invalid ID format
    - 404 Not Found - User not found

### Store Endpoints

#### Get All Stores

Retrieves a list of all stores.

- **URL**: `/stores`
- **Method**: `GET`
- **Access**: Public
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "count": 2,
      "data": [
        {
          "_id": "60d21b4667d0d8992e610c87",
          "name": "Example Store",
          "ownerId": "60d21b4667d0d8992e610c85",
          "email": "store@example.com",
          "phone": "+1234567890",
          "address": "123 Main St, City, Country",
          "createdAt": "2023-06-22T19:12:38.657Z",
          "updatedAt": "2023-06-22T19:12:38.657Z"
        },
        {
          "_id": "60d21b4667d0d8992e610c88",
          "name": "Another Store",
          "ownerId": "60d21b4667d0d8992e610c86",
          "email": "another.store@example.com",
          "phone": "+0987654321",
          "address": "456 Other St, City, Country",
          "createdAt": "2023-06-22T19:12:38.657Z",
          "updatedAt": "2023-06-22T19:12:38.657Z"
        }
      ]
    }
    ```

#### Get Store by ID

Retrieves a specific store by ID.

- **URL**: `/stores/:id`
- **Method**: `GET`
- **URL Parameters**: 
  - `id`: MongoDB ObjectId of the store
- **Access**: Public
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c87",
        "name": "Example Store",
        "ownerId": "60d21b4667d0d8992e610c85",
        "email": "store@example.com",
        "phone": "+1234567890",
        "address": "123 Main St, City, Country",
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:12:38.657Z"
      }
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Invalid ID format
    - 404 Not Found - Store not found

#### Create Store

Creates a new store.

- **URL**: `/stores`
- **Method**: `POST`
- **Access**: Private/StoreManager
- **Request Body**:
  ```json
  {
    "name": "Example Store",
    "ownerId": "60d21b4667d0d8992e610c85",
    "email": "store@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, Country"
  }
  ```
- **Response**:
  - **Code**: 201 Created
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c87",
        "name": "Example Store",
        "ownerId": "60d21b4667d0d8992e610c85",
        "email": "store@example.com",
        "phone": "+1234567890",
        "address": "123 Main St, City, Country",
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:12:38.657Z"
      }
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Validation error or email already exists

#### Update Store

Updates an existing store.

- **URL**: `/stores/:id`
- **Method**: `PUT`
- **URL Parameters**: 
  - `id`: MongoDB ObjectId of the store
- **Access**: Private/StoreManager
- **Request Body**:
  ```json
  {
    "name": "Updated Store",
    "email": "updated.store@example.com",
    "phone": "+0987654321",
    "address": "456 New St, City, Country"
  }
  ```
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c87",
        "name": "Updated Store",
        "ownerId": "60d21b4667d0d8992e610c85",
        "email": "updated.store@example.com",
        "phone": "+0987654321",
        "address": "456 New St, City, Country",
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:15:38.657Z"
      }
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Invalid ID format, validation error, or email already in use
    - 404 Not Found - Store not found

#### Delete Store

Deletes a store.

- **URL**: `/stores/:id`
- **Method**: `DELETE`
- **URL Parameters**: 
  - `id`: MongoDB ObjectId of the store
- **Access**: Private/Admin
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {}
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Invalid ID format
    - 404 Not Found - Store not found

### Product Endpoints

#### Get All Products

Retrieves a list of all products with optional filtering, sorting, and pagination.

- **URL**: `/products`
- **Method**: `GET`
- **Query Parameters**:
  - `storeId`: Filter products by store ID
  - `sort`: Sort by field (prefix with - for descending order, e.g., -price)
  - `limit`: Number of results per page (default: 10)
  - `page`: Page number (default: 1)
  - `showInactive`: Set to 'true' to include inactive products
- **Access**: Public
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "count": 2,
      "data": [
        {
          "_id": "60d21b4667d0d8992e610c89",
          "storeId": "60d21b4667d0d8992e610c87",
          "name": "Example Product",
          "description": "This is an example product description",
          "price": 99.99,
          "isActive": true,
          "createdAt": "2023-06-22T19:12:38.657Z",
          "updatedAt": "2023-06-22T19:12:38.657Z"
        },
        {
          "_id": "60d21b4667d0d8992e610c90",
          "storeId": "60d21b4667d0d8992e610c87",
          "name": "Another Product",
          "description": "This is another product description",
          "price": 149.99,
          "isActive": true,
          "createdAt": "2023-06-22T19:12:38.657Z",
          "updatedAt": "2023-06-22T19:12:38.657Z"
        }
      ]
    }
    ```

#### Get Product by ID

Retrieves a specific product by ID.

- **URL**: `/products/:id`
- **Method**: `GET`
- **URL Parameters**: 
  - `id`: MongoDB ObjectId of the product
- **Access**: Public
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c89",
        "storeId": "60d21b4667d0d8992e610c87",
        "name": "Example Product",
        "description": "This is an example product description",
        "price": 99.99,
        "isActive": true,
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:12:38.657Z"
      }
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Invalid ID format
    - 404 Not Found - Product not found

#### Get Products by Store ID

Retrieves all products for a specific store with optional sorting and pagination.

- **URL**: `/products/store/:storeId`
- **Method**: `GET`
- **URL Parameters**: 
  - `storeId`: MongoDB ObjectId of the store
- **Query Parameters**:
  - `sort`: Sort by field (prefix with - for descending order, e.g., -price)
  - `limit`: Number of results per page (default: 10)
  - `page`: Page number (default: 1)
  - `showInactive`: Set to 'true' to include inactive products
- **Access**: Public
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "count": 2,
      "data": [
        {
          "_id": "60d21b4667d0d8992e610c89",
          "storeId": "60d21b4667d0d8992e610c87",
          "name": "Example Product",
          "description": "This is an example product description",
          "price": 99.99,
          "isActive": true,
          "createdAt": "2023-06-22T19:12:38.657Z",
          "updatedAt": "2023-06-22T19:12:38.657Z"
        },
        {
          "_id": "60d21b4667d0d8992e610c90",
          "storeId": "60d21b4667d0d8992e610c87",
          "name": "Another Product",
          "description": "This is another product description",
          "price": 149.99,
          "isActive": true,
          "createdAt": "2023-06-22T19:12:38.657Z",
          "updatedAt": "2023-06-22T19:12:38.657Z"
        }
      ]
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Invalid store ID format
    - 404 Not Found - Store not found

#### Create Product

Creates a new product.

- **URL**: `/products`
- **Method**: `POST`
- **Access**: Private/StoreManager
- **Request Body**:
  ```json
  {
    "storeId": "60d21b4667d0d8992e610c87",
    "name": "Example Product",
    "description": "This is an example product description",
    "price": 99.99,
    "isActive": true
  }
  ```
- **Response**:
  - **Code**: 201 Created
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c89",
        "storeId": "60d21b4667d0d8992e610c87",
        "name": "Example Product",
        "description": "This is an example product description",
        "price": 99.99,
        "isActive": true,
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:12:38.657Z"
      }
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Validation error or invalid store ID
    - 404 Not Found - Store not found

#### Update Product

Updates an existing product.

- **URL**: `/products/:id`
- **Method**: `PUT`
- **URL Parameters**: 
  - `id`: MongoDB ObjectId of the product
- **Access**: Private/StoreManager
- **Request Body**:
  ```json
  {
    "name": "Updated Product",
    "description": "This is an updated product description",
    "price": 149.99,
    "isActive": true
  }
  ```
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c89",
        "storeId": "60d21b4667d0d8992e610c87",
        "name": "Updated Product",
        "description": "This is an updated product description",
        "price": 149.99,
        "isActive": true,
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:15:38.657Z"
      }
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Invalid ID format or validation error
    - 404 Not Found - Product not found

#### Delete Product

Deletes a product.

- **URL**: `/products/:id`
- **Method**: `DELETE`
- **URL Parameters**: 
  - `id`: MongoDB ObjectId of the product
- **Access**: Private/StoreManager
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {}
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Invalid ID format
    - 404 Not Found - Product not found

### Voucher Endpoints

#### Get All Vouchers

Retrieves a list of all vouchers.

- **URL**: `/vouchers`
- **Method**: `GET`
- **Access**: Admin
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "count": 2,
      "data": [
        {
          "_id": "60d21b4667d0d8992e610c89",
          "storeId": "60d21b4667d0d8992e610c87",
          "productId": "60d21b4667d0d8992e610c88",
          "customerId": "60d21b4667d0d8992e610c85",
          "code": "ABC123XYZ",
          "status": "active",
          "expirationDate": "2023-12-31T00:00:00.000Z",
          "qrCode": "data:image/png;base64,...",
          "sender_name": "John Doe",
          "sender_email": "john@example.com",
          "receiver_name": "Jane Smith",
          "receiver_email": "jane@example.com",
          "message": "Happy birthday! Enjoy your gift!",
          "template": "template1",
          "createdAt": "2023-06-22T19:12:38.657Z",
          "updatedAt": "2023-06-22T19:12:38.657Z"
        },
        {
          "_id": "60d21b4667d0d8992e610c90",
          "storeId": "60d21b4667d0d8992e610c87",
          "productId": "60d21b4667d0d8992e610c88",
          "customerId": null,
          "code": "DEF456UVW",
          "status": "redeemed",
          "expirationDate": "2023-12-31T00:00:00.000Z",
          "qrCode": "data:image/png;base64,...",
          "sender_name": "Alice Johnson",
          "sender_email": "alice@example.com",
          "receiver_name": "Bob Brown",
          "receiver_email": "bob@example.com",
          "message": "Thank you for your help!",
          "template": "template2",
          "createdAt": "2023-06-22T19:12:38.657Z",
          "updatedAt": "2023-06-22T19:12:38.657Z"
        }
      ]
    }
    ```

#### Get Voucher by ID

Retrieves a specific voucher by ID.

- **URL**: `/vouchers/:id`
- **Method**: `GET`
- **URL Parameters**: 
  - `id`: MongoDB ObjectId of the voucher
- **Access**: Admin, Store Manager, or Customer (if assigned to them)
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c89",
        "storeId": "60d21b4667d0d8992e610c87",
        "productId": "60d21b4667d0d8992e610c88",
        "customerId": "60d21b4667d0d8992e610c85",
        "code": "ABC123XYZ",
        "status": "active",
        "expirationDate": "2023-12-31T00:00:00.000Z",
        "qrCode": "data:image/png;base64,...",
        "sender_name": "John Doe",
        "sender_email": "john@example.com",
        "receiver_name": "Jane Smith",
        "receiver_email": "jane@example.com",
        "message": "Happy birthday! Enjoy your gift!",
        "template": "template1",
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:12:38.657Z"
      }
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Invalid ID format
    - 404 Not Found - Voucher not found

#### Get Voucher by Code

Retrieves a specific voucher by its code.

- **URL**: `/vouchers/code/:code`
- **Method**: `GET`
- **URL Parameters**: 
  - `code`: Unique voucher code
- **Access**: Public
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c89",
        "storeId": "60d21b4667d0d8992e610c87",
        "productId": "60d21b4667d0d8992e610c88",
        "customerId": "60d21b4667d0d8992e610c85",
        "code": "ABC123XYZ",
        "status": "active",
        "expirationDate": "2023-12-31T00:00:00.000Z",
        "qrCode": "data:image/png;base64,...",
        "sender_name": "John Doe",
        "sender_email": "john@example.com",
        "receiver_name": "Jane Smith",
        "receiver_email": "jane@example.com",
        "message": "Happy birthday! Enjoy your gift!",
        "template": "template1",
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:12:38.657Z"
      }
    }
    ```
  - **Error Codes**:
    - 404 Not Found - Voucher not found

#### Create Voucher

Creates a new voucher.

- **URL**: `/vouchers`
- **Method**: `POST`
- **Access**: Admin or Store Manager
- **Request Body**:
  ```json
  {
    "storeId": "60d21b4667d0d8992e610c87",
    "productId": "60d21b4667d0d8992e610c88",
    "customerId": "60d21b4667d0d8992e610c85", // Optional
    "expirationDate": "2023-12-31T00:00:00.000Z",
    "sender_name": "John Doe",
    "sender_email": "john@example.com",
    "receiver_name": "Jane Smith",
    "receiver_email": "jane@example.com",
    "message": "Happy birthday! Enjoy your gift!",
    "template": "template1" // Optional, defaults to "template1"
  }
  ```
- **Response**:
  - **Code**: 201 Created
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c89",
        "storeId": "60d21b4667d0d8992e610c87",
        "productId": "60d21b4667d0d8992e610c88",
        "customerId": "60d21b4667d0d8992e610c85",
        "code": "ABC123XYZ", // Automatically generated
        "status": "active",
        "expirationDate": "2023-12-31T00:00:00.000Z",
        "qrCode": "data:image/png;base64,...", // Automatically generated
        "sender_name": "John Doe",
        "sender_email": "john@example.com",
        "receiver_name": "Jane Smith",
        "receiver_email": "jane@example.com",
        "message": "Happy birthday! Enjoy your gift!",
        "template": "template1",
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:12:38.657Z"
      }
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Validation error
    - 404 Not Found - Store, product, or customer not found

#### Update Voucher

Updates an existing voucher.

- **URL**: `/vouchers/:id`
- **Method**: `PUT`
- **URL Parameters**: 
  - `id`: MongoDB ObjectId of the voucher
- **Access**: Admin or Store Manager
- **Request Body**:
  ```json
  {
    "customerId": "60d21b4667d0d8992e610c85",
    "status": "redeemed",
    "expirationDate": "2024-01-31T00:00:00.000Z",
    "sender_name": "John Updated",
    "sender_email": "john.updated@example.com",
    "receiver_name": "Jane Updated",
    "receiver_email": "jane.updated@example.com",
    "message": "Updated message!",
    "template": "template2"
  }
  ```
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c89",
        "storeId": "60d21b4667d0d8992e610c87",
        "productId": "60d21b4667d0d8992e610c88",
        "customerId": "60d21b4667d0d8992e610c85",
        "code": "ABC123XYZ",
        "status": "redeemed",
        "expirationDate": "2024-01-31T00:00:00.000Z",
        "qrCode": "data:image/png;base64,...",
        "sender_name": "John Updated",
        "sender_email": "john.updated@example.com",
        "receiver_name": "Jane Updated",
        "receiver_email": "jane.updated@example.com",
        "message": "Updated message!",
        "template": "template2",
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:15:38.657Z"
      }
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Invalid ID format or validation error
    - 404 Not Found - Voucher not found

#### Delete Voucher

Deletes a voucher.

- **URL**: `/vouchers/:id`
- **Method**: `DELETE`
- **URL Parameters**: 
  - `id`: MongoDB ObjectId of the voucher
- **Access**: Admin or Store Manager
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {}
    }
    ```
  - **Error Codes**:
    - 400 Bad Request - Invalid ID format
    - 404 Not Found - Voucher not found

#### Redeem Voucher

Redeems a voucher by its code.

- **URL**: `/vouchers/code/:code/redeem`
- **Method**: `PUT`
- **URL Parameters**: 
  - `code`: Unique voucher code
- **Access**: Public
- **Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d21b4667d0d8992e610c89",
        "storeId": "60d21b4667d0d8992e610c87",
        "productId": "60d21b4667d0d8992e610c88",
        "customerId": "60d21b4667d0d8992e610c85",
        "code": "ABC123XYZ",
        "status": "redeemed",
        "expirationDate": "2023-12-31T00:00:00.000Z",
        "qrCode": "data:image/png;base64,...",
        "sender_name": "John Doe",
        "sender_email": "john@example.com",
        "receiver_name": "Jane Smith",
        "receiver_email": "jane@example.com",
        "message": "Happy birthday! Enjoy your gift!",
        "template": "template1",
        "createdAt": "2023-06-22T19:12:38.657Z",
        "updatedAt": "2023-06-22T19:15:38.657Z"
      },
      "message": "Voucher successfully redeemed"
    }
    ```
  - **Error Codes**:
    - 404 Not Found - Voucher not found
    - 400 Bad Request - Voucher already redeemed or expired

### Voucher Templates

The system supports 5 different voucher templates that can be selected when creating a voucher:

1. **template1**: Classic design with a two-column layout
2. **template2**: Modern design with a header and content sections
3. **template3**: Gradient design with a colorful background
4. **template4**: Elegant design with decorative corners
5. **template5**: Minimalist design with a clean layout

Each template displays the following information:
- Sender name and email
- Receiver name and email
- Product details
- Personal message
- Expiration date
- QR code for redemption
- Store information

## Postman Collection

A Postman collection is available in the `postman` directory. Import the `gift-voucher-platform.postman_collection.json` file into Postman to test the API endpoints.

## Development

### Running Tests

```
npm test
```

### Linting

```
npm run lint
```

## License

This project is licensed under the MIT License.

## VoucherUsage Endpoints

### Get All Voucher Usages
- **URL**: `/voucher-usages`
- **Method**: `GET`
- **Query Parameters**:
  - `voucherId`: Filter by voucher ID
  - `storeId`: Filter by store ID
  - `customerId`: Filter by customer ID
  - `sort`: Sort field and order (e.g., `-usedAt` for descending order by usedAt)
  - `limit`: Number of results per page (default: 10)
  - `page`: Page number (default: 1)
- **Access**: Private/Admin
- **Description**: Retrieve all voucher usages with optional filtering, sorting, and pagination.
- **Response**:
  ```json
  {
    "voucherUsages": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "voucherId": {
          "_id": "60d21b4667d0d8992e610c80",
          "code": "GIFT123",
          "status": "redeemed"
        },
        "storeId": {
          "_id": "60d21b4667d0d8992e610c81",
          "name": "Store Name"
        },
        "customerId": {
          "_id": "60d21b4667d0d8992e610c82",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "usedAt": "2023-06-22T10:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalResults": 1
  }
  ```

### Get Voucher Usage by ID
- **URL**: `/voucher-usages/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Voucher usage ID
- **Access**: Private
- **Description**: Retrieve a specific voucher usage by its ID.
- **Response**:
  ```json
  {
    "_id": "60d21b4667d0d8992e610c85",
    "voucherId": {
      "_id": "60d21b4667d0d8992e610c80",
      "code": "GIFT123",
      "status": "redeemed"
    },
    "storeId": {
      "_id": "60d21b4667d0d8992e610c81",
      "name": "Store Name"
    },
    "customerId": {
      "_id": "60d21b4667d0d8992e610c82",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "usedAt": "2023-06-22T10:00:00.000Z"
  }
  ```
- **Error Codes**:
  - `400`: Invalid voucher usage ID format
  - `404`: Voucher usage not found
  - `500`: Server error

### Get Voucher Usage by Voucher ID
- **URL**: `/voucher-usages/voucher/:voucherId`
- **Method**: `GET`
- **URL Parameters**:
  - `voucherId`: Voucher ID
- **Access**: Private
- **Description**: Retrieve a voucher usage by the voucher ID.
- **Response**: Same as "Get Voucher Usage by ID"
- **Error Codes**:
  - `400`: Invalid voucher ID format
  - `404`: Voucher not found or Voucher usage not found
  - `500`: Server error

### Get Voucher Usages by Store ID
- **URL**: `/voucher-usages/store/:storeId`
- **Method**: `GET`
- **URL Parameters**:
  - `storeId`: Store ID
- **Query Parameters**:
  - `sort`: Sort field and order (e.g., `-usedAt` for descending order by usedAt)
  - `limit`: Number of results per page (default: 10)
  - `page`: Page number (default: 1)
- **Access**: Private/StoreManager
- **Description**: Retrieve all voucher usages for a specific store.
- **Response**: Same as "Get All Voucher Usages"
- **Error Codes**:
  - `400`: Invalid store ID format
  - `404`: Store not found
  - `500`: Server error

### Get Voucher Usages by Customer ID
- **URL**: `/voucher-usages/customer/:customerId`
- **Method**: `GET`
- **URL Parameters**:
  - `customerId`: Customer ID
- **Query Parameters**:
  - `sort`: Sort field and order (e.g., `-usedAt` for descending order by usedAt)
  - `limit`: Number of results per page (default: 10)
  - `page`: Page number (default: 1)
- **Access**: Private
- **Description**: Retrieve all voucher usages for a specific customer.
- **Response**: Same as "Get All Voucher Usages"
- **Error Codes**:
  - `400`: Invalid customer ID format
  - `404`: Customer not found
  - `500`: Server error

### Create Voucher Usage
- **URL**: `/voucher-usages`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "voucherId": "60d21b4667d0d8992e610c80",
    "storeId": "60d21b4667d0d8992e610c81",
    "customerId": "60d21b4667d0d8992e610c82"
  }
  ```
- **Access**: Private/StoreManager
- **Description**: Create a new voucher usage record and mark the voucher as redeemed.
- **Response**:
  ```json
  {
    "_id": "60d21b4667d0d8992e610c85",
    "voucherId": "60d21b4667d0d8992e610c80",
    "storeId": "60d21b4667d0d8992e610c81",
    "customerId": "60d21b4667d0d8992e610c82",
    "usedAt": "2023-06-22T10:00:00.000Z"
  }
  ```
- **Error Codes**:
  - `400`: Missing required fields, Invalid ID format, Voucher is not active, Voucher has already been redeemed
  - `404`: Voucher not found, Store not found, Customer not found
  - `500`: Server error

### Delete Voucher Usage
- **URL**: `/voucher-usages/:id`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: Voucher usage ID
- **Access**: Private/Admin
- **Description**: Delete a voucher usage record and reactivate the associated voucher.
- **Response**:
  ```json
  {
    "message": "Voucher usage deleted successfully"
  }
  ```
- **Error Codes**:
  - `400`: Invalid voucher usage ID format
  - `404`: Voucher usage not found
  - `500`: Server error

## VoucherUsage Data Model

### Required Fields
- `voucherId`: ObjectId (Reference to Voucher)
- `storeId`: ObjectId (Reference to Store)
- `customerId`: ObjectId (Reference to User)
- `usedAt`: Date (Default: current date/time)

### Indexes
- `{ voucherId: 1 }`: Unique index to ensure each voucher is redeemed only once
- `{ storeId: 1, customerId: 1 }`: Index for fetching redemption history for a user/store 