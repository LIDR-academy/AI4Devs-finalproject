# Technical Stack

## Application Framework
- **Framework:** FastAPI
- **Version:** Latest stable
- **Language:** Python 3.10+

## Database System
- **Primary Database:** PostgreSQL 17+
- **ORM:** SQLAlchemy
- **Hosting:** Azure Database for PostgreSQL
- **Backups:** Daily automated

## JavaScript Framework
- **Frontend Framework:** React
- **Version:** Latest stable
- **Build Tool:** Vite
- **Package Manager:** npm
- **Node Version:** 22 LTS

## Import Strategy
- **Strategy:** Node.js modules
- **Module System:** ES6 modules

## CSS Framework
- **Framework:** TailwindCSS
- **Version:** 4.0+
- **Responsive Breakpoints:** xs (400px), sm, md, lg, xl, 2xl

## UI Component Library
- **Components:** Instrumental Components
- **Version:** Latest
- **Icons:** Lucide React components

## Fonts Provider
- **Provider:** Google Fonts
- **Loading Strategy:** Self-hosted for performance
- **Fallbacks:** System fonts

## Icon Library
- **Library:** Lucide React components
- **Usage:** Consistent iconography across application

## Application Hosting
- **Platform:** Azure App Service or Azure VMs
- **Region:** West Europe (primary team location)
- **Environment:** Production (main branch), Staging (staging branch)

## Database Hosting
- **Service:** Azure Database for PostgreSQL
- **Configuration:** High availability with automatic failover
- **Scaling:** Vertical and horizontal scaling capabilities

## Asset Hosting
- **Storage:** Azure Blob Storage
- **CDN:** Azure CDN
- **Access Control:** Private with signed URLs
- **File Types:** PDF templates, generated reports, mapping files

## Deployment Solution
- **CI/CD Platform:** GitHub Actions
- **Triggers:** Push to main/staging branches
- **Testing:** Automated tests run before deployment
- **Environments:** Staging and production with automated promotion

## Backend Libraries
- **PDF Processing:** PyPDF2, pdfplumber
- **Web Framework:** FastAPI
- **Database:** SQLAlchemy
- **HTTP Requests:** Requests
- **Email:** smtplib
- **Task Queue:** Celery (for background processing)

## Frontend Libraries
- **UI Components:** Lucide React components
- **State Management:** React Context API / Zustand
- **HTTP Client:** Axios
- **Routing:** React Router
- **Form Handling:** React Hook Form

## Code Repository
- **Platform:** GitHub
- **Repository URL:** To be determined during project initialization
- **Branching Strategy:** GitFlow (main, staging, feature branches)
- **Code Review:** Required pull requests with automated checks
