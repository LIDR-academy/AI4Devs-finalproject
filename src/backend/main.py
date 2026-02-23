from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import redis

app = FastAPI(
    title="SF-PM API",
    description="Sagrada Familia Parts Manager API",
    version="0.1.0"
)

# Rate Limiter Configuration - OWASP A04:2021 Insecure Design
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Headers Middleware - OWASP A05:2021 Security Misconfiguration
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses.
    
    Implements OWASP security best practices:
    - Content Security Policy (CSP) to prevent XSS
    - X-Frame-Options to prevent clickjacking
    - X-Content-Type-Options to prevent MIME sniffing
    - Strict-Transport-Security (HSTS) for HTTPS enforcement
    
    References:
        - OWASP A05:2021 – Security Misconfiguration
        - OWASP A07:2021 – Cross-Site Scripting (XSS)
    """
    
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        
        # Content Security Policy - Three.js compatible
        # Note: 'unsafe-inline' and 'unsafe-eval' required for Three.js functionality
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  # Three.js workers
            "style-src 'self' 'unsafe-inline'",  # React inline styles
            "img-src 'self' data: https:",  # Base64 + CDN images
            "font-src 'self' data:",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co",  # API + Realtime
            "frame-ancestors 'none'",  # Prevent clickjacking
            "base-uri 'self'",
            "form-action 'self'",
            "media-src 'self' https://*.supabase.co",  # GLB/3DM files from Storage
            "object-src 'none'",  # Block Flash, Java applets
            "worker-src 'self' blob:",  # Three.js web workers
        ]
        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)
        
        # Additional security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # HSTS (only in production with HTTPS)
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        return response

# CORS Config - OWASP A05:2021 Security Misconfiguration
# Use environment variable for allowed origins, never wildcard with credentials
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [origin.strip() for origin in allowed_origins_env.split(",")]

# Validate: Ensure "*" is never used in production with credentials
if "*" in origins and os.getenv("ENVIRONMENT", "development") == "production":
    raise ValueError(
        "⛔ SECURITY ERROR: Wildcard CORS ('*') with allow_credentials=True is forbidden in production. "
        "Set ALLOWED_ORIGINS environment variable to specific domains."
    )

# Add CORS middleware FIRST (processes requests before SecurityHeaders)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Length", "X-Request-ID"],
    max_age=600,  # Cache preflight for 10 minutes
)

# Add Security Headers middleware AFTER CORS (processes responses after CORS)
app.add_middleware(SecurityHeadersMiddleware)

@app.get("/health")
async def health_check():
    return {"status": "ok", "phase": "sprint-0"}

@app.get("/ready")
async def readiness_check():
    """
    Readiness probe - checks if service can handle requests.
    
    Verifies:
    - Database connectivity (Supabase)
    - Redis connectivity (Celery broker)
    
    Returns 503 if any dependency is unavailable.
    """
    checks = {}
    all_ready = True
    
    # Check Supabase database connectivity
    try:
        from infra.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        # Simple query to verify connection
        result = supabase.table("blocks").select("id").limit(1).execute()
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {str(e)}"
        all_ready = False
    
    # Check Redis connectivity (Celery broker)
    try:
        celery_broker_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
        r = redis.from_url(celery_broker_url)
        r.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {str(e)}"
        all_ready = False
    
    if all_ready:
        return {
            "status": "ready",
            "checks": checks
        }
    else:
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "checks": checks
            }
        )

from api.upload import router as upload_router
from api.validation import router as validation_router
from api.parts import router as parts_router

app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])
app.include_router(validation_router)
app.include_router(parts_router, prefix="/api/parts", tags=["Parts"])

