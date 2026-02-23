# === Base: production dependencies ===
FROM python:3.11-slim AS base
WORKDIR /app

# Install system dependencies for rhino3dm + open3d (required for agent test execution)
# CMake required for rhino3dm compilation (C++ bindings)
# libx11-6, libgl1, libgomp1, libglib2.0-0 required for open3d (decimation backend)
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libx11-6 \
    libgl1 \
    libgomp1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

# === Dev: hot-reload + test dependencies ===
# Source code provided via volume mount in docker-compose (no COPY needed)
FROM base AS dev

COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# === Prod: copy source, non-root user, multi-worker ===
FROM base AS prod
COPY . .
RUN useradd -m appuser
USER appuser
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
