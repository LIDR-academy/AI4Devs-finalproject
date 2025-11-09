# Spec: Frontend Authentication System Specification

## METAPROMPT LLM CURSOR CLAUDE 4.5 SONNET

Dada la especificación @2025-10-19-03-jwt-auth-review/ actua como arquitecto de producto con IA y crea un prompt para crear la especificación del frontend del api auth basado en el stack de frontend del proyecto (ver @README.md ) y crear nuestra página de login

## RESPUESTA DEL MODELO

# Frontend Authentication System Specification

## Context

We have a fully implemented and SOLID-compliant JWT authentication backend (rating 8.8/10) for the SEPE Templates Comparator project. The backend provides 7 authentication endpoints with comprehensive JWT token management, bcrypt password hashing, and proper service layer architecture.

Backend Authentication API Endpoints:

- POST /api/v1/auth/register - User registration
- POST /api/v1/auth/login - User login with JWT token
- GET /api/v1/auth/me - Get current user info
- POST /api/v1/auth/change-password - Change password
- POST /api/v1/auth/password-reset - Request password reset
- POST /api/v1/auth/password-reset/confirm - Confirm password reset
- POST /api/v1/auth/login/oauth - OAuth2-compatible login

## Objective

- Create a comprehensive frontend authentication specification that implements a complete authentication UI layer, starting with a Login Page as the primary deliverable, following the project's frontend stack and architecture patterns.

### Frontend Stack (from README.md)

- React 19 with modern hooks and concurrent features
- TypeScript with full type safety
- Vite for fast development
- TailwindCSS with custom design system
- React Router with protected routes
- Context API for state management (AuthContext, ThemeContext)
- React Hook Form for performant form validation
- Axios for HTTP client with interceptors
- Lucide Icons for iconography
- Vitest + React Testing Library for testing
  Required Specification Structure

## 1. Main Specification Document (spec.md)

Create a complete specification covering:

### User Stories:

- As a user, I want to log in with email/password to access the application
- As a user, I want to register a new account with email/password
- As a user, I want to see validation errors for invalid inputs
- As a user, I want to remain logged in across browser sessions
- As a user, I want to log out and clear my session
- As a user, I want to reset my password if I forget it
- As a user, I want automatic token refresh or re-authentication when expired

### Scope:

- Login page with email/password form
- Registration page with validation
- Password reset flow (request + confirm)
- Protected route wrapper component
- JWT token management (storage, refresh, expiration)
- Automatic logout on 401 responses
- Integration with existing AuthContext
- Error handling and user feedback
- Loading states and form validation
- Dark mode support

### Out of Scope:

- OAuth2 social login integration
- Two-factor authentication UI
- Responsive design (mobile-first)
- Remember me functionality (initially)
- Account profile management (separate feature)
