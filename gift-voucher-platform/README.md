# Gifty - Gift Voucher Platform

A modern gift voucher platform built with Node.js, Express, MongoDB, and TypeScript following Hexagonal Architecture principles.

## Project Structure

This project is organized as a monorepo using Turborepo:

```
/gift-voucher-platform
├── packages
│   ├── backend (Node.js API)
│   └── frontend (To be added later)
```

## Backend Architecture

The backend follows Hexagonal Architecture (Ports & Adapters) with a Screaming Architecture file organization:

```
/backend
├── src
│   ├── application (use cases)
│   ├── domain (entities, aggregates, domain logic)
│   ├── infrastructure (database, API clients, repositories)
│   ├── interfaces (controllers, HTTP requests, event listeners)
│   ├── config (env variables, database config)
│   ├── server.ts (Express setup)
│   └── app.ts (App entry point)
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v9 or higher)
- MongoDB

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd gift-voucher-platform
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cd packages/backend
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

4. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

The API includes the following core modules:

- **Users:** Authentication and user management
- **Vouchers:** CRUD operations for gift vouchers
- **Orders:** Create and retrieve orders
- **Payments:** Integration with MercadoPago
- **Voucher Redemption:** Track voucher usage

## Development

### Available Scripts

- `npm run build` - Build all packages
- `npm run dev` - Start development servers
- `npm run lint` - Run linting
- `npm run test` - Run tests

## Technologies

- **Backend Framework:** Node.js with Express
- **Database:** MongoDB with Mongoose
- **Validation:** Joi
- **Authentication:** JWT
- **Monorepo Management:** Turborepo
- **Code Quality:** ESLint, Prettier
- **Testing:** Jest

## License

This project is licensed under the MIT License.

## Security and Environment Variables

### Environment Variables

This project uses environment variables to manage sensitive configuration. Each package (backend and frontend) has its own set of environment variables.

#### Backend Environment Variables

1. Copy the example environment file to create your own:
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   ```

2. Update the values in `.env` with your actual credentials and configuration.

3. Important environment variables for the backend:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT token generation
   - `MERCADO_PAGO_ACCESS_TOKEN`: Your MercadoPago access token

#### Frontend Environment Variables

1. Copy the example environment file to create your own:
   ```bash
   cp packages/frontend/.env.example packages/frontend/.env
   ```

2. Update the values in `.env` with your actual configuration.

3. Important environment variables for the frontend:
   - `NEXT_PUBLIC_API_URL`: URL of the backend API
   - `NEXT_PUBLIC_AUTH_DOMAIN`: Authentication domain
   - `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`: MercadoPago public key

### Security Best Practices

1. **Never commit sensitive information**: All `.env` files are excluded in `.gitignore` to prevent accidental commits of sensitive data.

2. **Use environment variables**: Never hardcode sensitive information in your code.

3. **Rotate secrets regularly**: Change your JWT secrets and API keys periodically.

4. **Use secure connections**: Always use HTTPS in production.

5. **Validate user input**: All user input should be validated and sanitized to prevent injection attacks.

6. **Implement proper authentication and authorization**: Ensure that users can only access resources they are authorized to.

### Security Check Script

The project includes a security check script that helps identify potentially sensitive information in the codebase. This script scans for common patterns that might indicate sensitive data and checks for .env files that should not be committed.

To run the security check:

```bash
# Make the script executable (Unix/Linux/macOS)
chmod +x scripts/check-sensitive-info.sh

# Run the script
./scripts/check-sensitive-info.sh
```

For Windows users:
```bash
# Using Git Bash
bash scripts/check-sensitive-info.sh

# Using PowerShell
sh scripts/check-sensitive-info.sh
```

Run this script before committing changes to ensure no sensitive information is accidentally exposed. 