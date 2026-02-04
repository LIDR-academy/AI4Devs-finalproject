FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if needed
# RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code (will be overridden by volume in dev, but good for build)
COPY . .

# Expose port
EXPOSE 8000

# Run command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
