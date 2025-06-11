# Environment Setup Documentation - ShopMefy Platform

## 🔧 Environment Configuration

### Backend Environment Variables (`.env`)

```bash
# Application Configuration
NODE_ENV=production
PORT=8080

# Database Configuration
DATABASE_URL=postgresql://username:password@host:5432/database

# AI Service Configuration (OpenRouter - NOT OpenAI)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Authentication
JWT_SECRET=your_jwt_secret_here

# AWS S3 Configuration
AWS_S3_BUCKET=your_s3_bucket_name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Application URLs
PUBLIC_URL=http://52.7.57.53
FRONTEND_URL=http://52.7.57.53:3000

# Swagger Documentation
SWAGGER_USER=admin
SWAGGER_PASSWORD=your_swagger_password
```

### Frontend Environment Variables (`.env`)

```bash
# API Configuration
VITE_API_URL=http://52.7.57.53/api

# Application Configuration
VITE_APP_NAME=ShopMefy
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=production
```

### GitHub Secrets Configuration

```bash
# AWS Access
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_s3_bucket_name

# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# AI Service
OPENROUTER_API_KEY=your_openrouter_api_key

# Authentication
JWT_SECRET=your_jwt_secret

# Swagger
SWAGGER_USER=admin
SWAGGER_PASSWORD=your_swagger_password

# SSH Access
SSH_PRIVATE_KEY=your_ssh_private_key_content
```

## 🚀 Development Setup

### Local Development Environment

1. **Backend Setup**:
```bash
cd backend
cp .env.example .env
# Edit .env with your local values
npm install
npm run dev
```

2. **Frontend Setup**:
```bash
cd frontend
cp .env.example .env
# Edit .env with your local values
npm install
npm run dev
```

3. **Database Setup**:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### Production Environment

The production environment is automatically configured during deployment with the following characteristics:

- **Database**: AWS RDS PostgreSQL
- **File Storage**: AWS S3
- **Server**: AWS EC2 with Nginx reverse proxy
- **AI Service**: OpenRouter API (not OpenAI)
- **Process Management**: PID-based process tracking

## 🔒 Security Considerations

### Environment Variable Security

- ✅ Never commit `.env` files to version control
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate secrets regularly
- ✅ Use different secrets for different environments
- ✅ Validate environment variables on startup

### Database Security

- ✅ Use strong passwords
- ✅ Enable SSL connections
- ✅ Restrict database access to application servers only
- ✅ Regular backups and monitoring

### API Security

- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Use JWT for authentication
- ✅ Implement CORS properly

## 🛠️ Environment Validation

### Backend Validation

The backend validates required environment variables on startup:

```typescript
const requiredEnvVars = [
  'DATABASE_URL',
  'OPENROUTER_API_KEY',
  'JWT_SECRET',
  'AWS_S3_BUCKET',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY'
];

// Validation happens in src/index.ts
```

### Frontend Validation

The frontend validates API connectivity:

```typescript
// Validates VITE_API_URL connectivity
const healthCheck = await fetch(`${import.meta.env.VITE_API_URL}/health`);
```

## 📋 Environment Checklist

### Development Setup
- [ ] Backend `.env` file created and configured
- [ ] Frontend `.env` file created and configured
- [ ] Database connection working
- [ ] OpenRouter API key valid
- [ ] Local file uploads working

### Production Deployment
- [ ] All GitHub Secrets configured
- [ ] AWS credentials valid
- [ ] S3 bucket accessible
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] SSL certificates configured (if using HTTPS)

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check DATABASE_URL format
   - Verify database server is running
   - Check network connectivity

2. **OpenRouter API Errors**:
   - Verify OPENROUTER_API_KEY is valid
   - Check API quota and billing
   - Ensure correct API endpoint

3. **S3 Upload Failures**:
   - Verify AWS credentials
   - Check S3 bucket permissions
   - Ensure correct AWS region

4. **Frontend API Connection**:
   - Verify VITE_API_URL is correct
   - Check CORS configuration
   - Ensure backend is running

### Environment Debugging

```bash
# Backend environment check
curl http://localhost:8080/api/health

# Frontend environment check
curl http://localhost:3000

# Database connection test
npx prisma db execute --file test-connection.sql

# S3 connection test
aws s3 ls s3://your-bucket-name
```

## 📚 Related Documentation

- **Infrastructure**: `prompts/docs/infra-workflow-prompt.md`
- **Deployment**: `prompts/docs/deploy-workflow.md`
- **Database**: `prompts/docs/database-schema.md`
- **Security**: `prompts/docs/owasp.md` 