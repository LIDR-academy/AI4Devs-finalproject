# Application Deployment Workflow Documentation

## Current Deployment Architecture

The ShopMefy application uses a **S3-based deployment** approach to AWS EC2 with the following specifications:

## Deployment Flow

### **1. CI/CD Pipeline** 🔄
- **Build Stage**: Compile TypeScript backend and React frontend
- **Test Stage**: Run unit and integration tests
- **Package Stage**: Create deployment artifacts (backend.zip, frontend.zip)
- **S3 Upload**: Store artifacts in S3 bucket for deployment

### **2. Environment Setup** ⚙️
- Configure AWS credentials for EC2, RDS, and S3 access
- Prepare SSH private key for EC2 connection
- Set deployment environment variables

### **3. Process Management** 🛑
- Stop existing Node.js backend processes using PID files
- Stop existing frontend serve processes using PID files
- Fallback: Force kill any remaining processes
- Wait for clean shutdown before proceeding

### **4. Artifact Download** 📥
- **S3 Download**: Download pre-built backend.zip and frontend.zip
- **Extract**: Unzip artifacts to deployment directory
- **Verification**: Confirm all files extracted correctly

### **5. Backend Deployment** 🔧
- **Dependencies**: `npm ci --silent` (production-only packages)
- **Environment**: Create `.env` with all required variables:
  - `DATABASE_URL`, `OPENROUTER_API_KEY`, `JWT_SECRET`
  - `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
  - `PUBLIC_URL`, `FRONTEND_URL`, `SWAGGER_USER`, `SWAGGER_PASSWORD`
- **Database**: `npx prisma migrate deploy` (NO force-reset to preserve data)
- **S3 Upload**: Upload PDF documents to S3 bucket
- **Conditional Seed**: Only if manually triggered (default: false)
- **Start**: `node dist/src/index.js` on port 8080 with PID tracking

### **6. Frontend Deployment** 🎨
- **Dependencies**: Install `serve` globally if needed
- **Start**: `serve -s dist -l 3000` with PID tracking
- **Static Files**: Pre-built React app served from dist/

### **7. Nginx Configuration** 🌐
- **Dynamic Config**: Generate nginx configuration via script
- **Frontend Route**: `/` → `http://localhost:3000`
- **Backend Route**: `/api` → `http://localhost:8080`
- **File Upload Limits**: `client_max_body_size 20M`
- **Proxy Headers**: Proper forwarding for rate limiting
- **Service Restart**: `nginx -t` validation + `systemctl restart nginx`

### **8. Health Verification** ✅
- Wait 15 seconds for services startup
- Check frontend: `curl http://IP/` (expect HTTP 200)
- Check backend API: `curl http://IP/api/health` (expect HTTP 200)
- Display deployment summary with status

## Infrastructure Requirements

### **AWS Resources**
- **EC2 Instance**: t3.small (2GB RAM) with Ubuntu
- **RDS PostgreSQL**: Database service (always running)
- **S3 Bucket**: Deployment artifacts + document storage
- **Elastic IP**: Fixed public IP address (52.7.57.53)
- **Security Groups**: Ports 22, 80, 443, 3000, 8080

### **Server Setup**
- **Node.js 20.x**: Latest LTS version
- **Nginx**: Reverse proxy server with upload limits
- **PostgreSQL Client**: For database operations
- **AWS CLI**: For S3 operations during deployment

## GitHub Secrets Required

### **AWS Access**
- `AWS_ACCESS_KEY_ID`: AWS access key for S3, RDS, EC2
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_S3_BUCKET`: S3 bucket name for artifacts and documents

### **EC2 Connection**
- `SSH_PRIVATE_KEY`: RSA private key for SSH access

### **Application Configuration**
- `DATABASE_URL`: PostgreSQL connection string
- `OPENROUTER_API_KEY`: AI service API key (NOT OpenAI)
- `JWT_SECRET`: Authentication secret
- `SWAGGER_USER`: Swagger UI username
- `SWAGGER_PASSWORD`: Swagger UI password

## Workflow Triggers

### **Automatic Deployment**
- Triggers after successful CI/CD pipeline completion
- Only on `main` branch with successful tests
- Uses `workflow_run` trigger for sequential execution

### **Manual Deployment**
- `workflow_dispatch` with optional seed execution
- **Seed Flag**: Default `false` to preserve data
- **Warning System**: 10-second delay + warnings for seed execution

## Service Architecture

### **Application Stack**
```
Internet → Nginx (Port 80) → {
  / → React Frontend (Port 3000) [serve -s dist]
  /api → Node.js Backend (Port 8080) [node dist/src/index.js]
}
```

### **Backend Services**
- **API Server**: Express.js with TypeScript (compiled)
- **Database**: PostgreSQL via Prisma ORM
- **File Storage**: AWS S3 for document uploads
- **AI Integration**: OpenRouter API (not OpenAI) for chatbot
- **Security**: Helmet, CORS, rate limiting with proxy trust

### **Frontend Services**
- **React App**: Pre-built static files served by `serve`
- **UI Framework**: shadcn/ui with Tailwind CSS
- **State Management**: TanStack Query for API calls
- **Build Tool**: Vite for fast builds and HMR

## Deployment Benefits

### **Performance & Reliability**
- ✅ Pre-built artifacts (no build on server)
- ✅ S3-based artifact storage
- ✅ PID-based process management
- ✅ Graceful shutdown procedures
- ✅ Health check verification

### **Data Safety**
- ✅ NO automatic database reset
- ✅ Seed execution only when manually triggered
- ✅ Data preservation by default
- ✅ Migration without data loss

### **Development Workflow**
- ✅ Push to main → Auto CI/CD → Auto deploy
- ✅ Manual deployment with optional seed
- ✅ Environment-specific configs
- ✅ Comprehensive logging and monitoring

## Access Information

### **Application URLs**
- **Frontend**: `http://52.7.57.53/`
- **Backend API**: `http://52.7.57.53/api`
- **Health Check**: `http://52.7.57.53/api/health`
- **Swagger Docs**: `http://52.7.57.53/api-docs`
- **PDF Preview**: `http://52.7.57.53/api/documents/{id}/preview`

### **Management Commands**
- **SSH Access**: `ssh -i ~/.ssh/id_rsa ubuntu@52.7.57.53`
- **Backend Logs**: `tail -f shopmefy-deployment/backend.log`
- **Frontend Logs**: `tail -f shopmefy-deployment/frontend.log`
- **Process Status**: `ps aux | grep -E "(node|serve)"`
- **PID Files**: `cat shopmefy-deployment/{backend,frontend}.pid`

## Security Considerations

### **Network Security**
- SSH access via private key only
- Database accessible only from EC2
- S3 bucket with IAM-restricted access
- Nginx proxy with security headers
- Rate limiting with proxy trust configuration

### **Application Security**
- Environment variables for all secrets
- JWT-based authentication (demo tokens for MVP)
- Input validation and sanitization
- CORS configured for specific origins
- Helmet security middleware
- File upload restrictions and validation

### **Data Protection**
- Database migrations without data loss
- S3 document storage with proper permissions
- No hardcoded secrets in code
- Secure PDF streaming without iframe restrictions

## Troubleshooting

### **Common Issues**
- **Port Conflicts**: Use `sudo fuser -k 8080/tcp` to free ports
- **Process Management**: Check PID files and kill processes gracefully
- **Database Issues**: Verify DATABASE_URL and run migrations
- **S3 Access**: Ensure AWS credentials and bucket permissions
- **Nginx Config**: Test with `nginx -t` before restart

### **Deployment Verification**
1. Check process status: `ps aux | grep -E "(node|serve)"`
2. Test endpoints: `curl http://52.7.57.53/api/health`
3. Verify logs: `tail -f shopmefy-deployment/*.log`
4. Check database: `docker exec -it shopmefy-db psql -U shopmefy -d shopmefy -c "SELECT COUNT(*) FROM products;"`
