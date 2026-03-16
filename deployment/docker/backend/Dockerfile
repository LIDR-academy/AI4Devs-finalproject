# =============================================================================
# Stage 1: Builder — install dependencies in a virtualenv
# =============================================================================
FROM python:3.11-slim AS builder

WORKDIR /build

# Install system packages needed to compile Python C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create an isolated virtual environment for runtime deps
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install dependency manifest first for better layer caching
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# =============================================================================
# Stage 2: Runtime — lean image with only what is needed to run
# =============================================================================
FROM python:3.11-slim AS runtime

# Install runtime-only C library for PostgreSQL (no compiler needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy the venv produced in the builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# -----------------------------------------------------------------------
# Security: run as a non-root user
# -----------------------------------------------------------------------
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --no-create-home --shell /bin/false appuser

WORKDIR /app

# Copy application source (only runtime artefacts — build tools stay out)
COPY --chown=appuser:appgroup . .

# Ensure the logs directory is writable by the application user
RUN mkdir -p logs && chown appuser:appgroup logs

USER appuser

# Flask/Gunicorn listens on this port
EXPOSE 5000

# Environment variables expected at runtime (overridden by compose/k8s)
ENV APP_SETTINGS_MODULE=config.production.ProductionConfig \
    HOST=0.0.0.0 \
    PORT=5000 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Health-check: hit the /health endpoint every 30 s, allow 3 retries
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

# Default start — gunicorn for production; override in dev compose
CMD ["gunicorn", \
     "--bind", "0.0.0.0:5000", \
     "--workers", "3", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "application:app"]
