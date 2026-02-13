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

COPY . .

# === Dev: hot-reload + test dependencies ===
FROM base AS dev
# No additional dependencies yet (tests in T-024+)
CMD ["celery", "-A", "agent.celery_app", "worker", "--loglevel=info", "--concurrency=2"]

# === Prod: non-root user, production concurrency ===
FROM base AS prod
RUN useradd -m agentuser
USER agentuser
CMD ["celery", "-A", "agent.celery_app", "worker", "--loglevel=warning", "--concurrency=4"]
