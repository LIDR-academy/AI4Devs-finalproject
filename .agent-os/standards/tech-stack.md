# Tech Stack

## Context

Global tech stack defaults for the SEPE templates comparator project, overriding the standard Agent OS defaults for project-specific needs.

- App Framework: Python con FastAPI
- Language: Python 3.10+
- Primary Database: PostgreSQL 17+
- ORM: SQLAlchemy
- JavaScript Framework: React latest stable
- Build Tool: Vite
- Import Strategy: Node.js modules
- Package Manager: npm
- Node Version: 22 LTS
- Backend Libraries: PyPDF2, pdfplumber, FastAPI, SQLAlchemy, Requests, smtplib
- Frontend Libraries: Lucide React components
- CSS Framework: TailwindCSS 4.0+
- UI Components: Instrumental Components latest
- UI Installation: Via development gems group
- Font Provider: Google Fonts
- Font Loading: Self-hosted for performance
- Icons: Lucide React components
- Application Hosting: Azure App Service o Azure VMs
- Hosting Region: Región principal basada en la ubicación del equipo de arquitectura (ej. West Europe)
- Database Hosting: Azure Database for PostgreSQL
- Database Backups: Daily automated
- Asset Storage: Azure Blob Storage
- CDN: Azure CDN
- Asset Access: Private with signed URLs
- CI/CD Platform: GitHub Actions (o Azure DevOps/Pipelines)
- CI/CD Trigger: Push to main/staging branches
- Tests: Run before deployment
- Production Environment: main branch
- Staging Environment: staging branch