# === Base: production dependencies ===
FROM python:3.11-slim AS base
WORKDIR /app

# Install system dependencies for rhino3dm (T-024-AGENT)
# CMake required for rhino3dm compilation (C++ bindings)
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# === Dev: hot-reload + test dependencies ===
# Source code provided via volume mount in docker-compose (no COPY needed)
FROM base AS dev
CMD ["celery", "-A", "celery_app", "worker", "--loglevel=info", "--concurrency=2"]

# === Prod: copy source, non-root user, production concurrency ===
FROM base AS prod
COPY . .
RUN useradd -m agentuser
USER agentuser
CMD ["celery", "-A", "celery_app", "worker", "--loglevel=warning", "--concurrency=4"]
