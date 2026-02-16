# Multi-stage Dockerfile for Meditation Builder
# Stage 1: Build with Maven
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /workspace/app

# Copy source code
COPY . /workspace/app

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Runtime with Java 21
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install curl for health checks and ffmpeg for audio/video processing
RUN apk add --no-cache curl ffmpeg

# Copy built JAR from builder stage
COPY --from=builder /workspace/app/target/meditation-builder-*.jar /app/meditation-builder.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "/app/meditation-builder.jar"]
