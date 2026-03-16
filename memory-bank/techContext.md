# ZenTurno Technical Context

## Technologies Used

### Frontend Stack
- **React 18**: Modern component-based UI framework
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **React Hook Form**: Form handling and validation
- **Date-fns**: Date manipulation and formatting

### Backend Stack
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type safety for backend code
- **Prisma**: Type-safe ORM for database access
- **jsonwebtoken**: JWT authentication implementation
- **bcrypt**: Password hashing
- **cors**: Cross-origin resource sharing
- **helmet**: Security middleware
- **express-rate-limit**: API rate limiting

### Database & Services
- **PostgreSQL**: Relational database in Docker container
- **Docker**: Containerization for local development
- **Email Service**: SMTP for notifications (Gmail/SendGrid)
- **Vercel**: Frontend hosting and deployment
- **Railway/Render**: Backend hosting options

## Development Setup

### Prerequisites
- Node.js v18+
- npm v9+
- Git
- Docker and Docker Compose
- Vercel account

### Local Development
```bash
# Start PostgreSQL in Docker
cd backend
docker-compose up -d postgres

# Initialize Prisma (first time only)
./setup-prisma.sh

# Backend
cd backend
npm install
npm run dev  # Runs on port 3001

# Frontend
cd frontend
npm install
npm start    # Runs on port 3000
```

### Environment Variables
**Backend (.env)**
- `PORT`: Server port (3001)
- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRATION`: Token expiration time
- `SMTP_*`: Email service configuration

**Frontend (.env.local)**
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_SUPABASE_URL`: Supabase project URL (optional)

## Technical Constraints

### Performance Requirements
- Page load time < 3 seconds
- API response time < 500ms
- Mobile-first responsive design
- Offline capability for basic functions

### Security Requirements
- HTTPS everywhere
- JWT token expiration (24h)
- Password hashing with bcrypt
- Input validation and sanitization
- CORS properly configured
- Rate limiting on API endpoints

### Scalability Considerations
- Stateless backend design
- Database indexing for performance
- CDN for static assets (Vercel)
- Horizontal scaling capability

## Dependencies

### Production Dependencies
- Core framework dependencies (React, Express)
- Prisma ORM and client
- Authentication and security libraries
- Database client libraries
- Utility libraries for dates, validation

### Development Dependencies
- TypeScript compiler and types
- Prisma CLI
- Testing frameworks (Jest, React Testing Library)
- Code formatting (Prettier, ESLint)
- Build tools and bundlers
- Docker and Docker Compose

## Development Workflow
1. Local development with Docker and hot reload
2. Git-based version control
3. Automatic deployment on push to main
4. Environment-specific configurations
5. Database migrations via Prisma Migrate
6. Simple database migrations via SQL scripts
