# === Base: production dependencies ===
FROM python:3.11-slim AS base
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code (overridden by volume in dev, but needed for prod build)
COPY . .
EXPOSE 8000

# === Dev: hot-reload + test dependencies ===
FROM base AS dev
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# === Prod: non-root user, multi-worker ===
FROM base AS prod
RUN useradd -m appuser
USER appuser
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
