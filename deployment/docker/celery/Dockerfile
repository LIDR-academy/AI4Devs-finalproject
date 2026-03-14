# =============================================================================
# Stage 1: Builder — install Python deps into venv
# =============================================================================
FROM python:3.11-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# =============================================================================
# Stage 2: Runtime — run Celery worker as non-root user
# =============================================================================
FROM python:3.11-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --no-create-home --shell /bin/false appuser

WORKDIR /app
COPY --chown=appuser:appgroup . .
RUN mkdir -p logs && chown appuser:appgroup logs

USER appuser

ENV APP_SETTINGS_MODULE=config.production.ProductionConfig \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

HEALTHCHECK --interval=60s --timeout=15s --start-period=30s --retries=3 \
    CMD celery -A celery_worker.celery inspect ping -d celery@$HOSTNAME || exit 1

CMD ["celery", "-A", "celery_worker.celery", "worker", "--loglevel=info", "--concurrency=4"]
