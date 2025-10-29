# Multi-stage Dockerfile para users-service
FROM maven:3.9.9-eclipse-temurin-17 AS builder

# Construir desde raíz de Backend
WORKDIR /backend
COPY . .

# Instalar shared y compilar users-service
RUN mvn -q -DskipTests -pl shared -am install
RUN mvn -q -DskipTests -pl users-service -am package

# Runtime stage
FROM payara/micro:6.2024.6-jdk17
COPY --from=builder /backend/users-service/target/users-service-0.1.0-SNAPSHOT.war /opt/payara/deployments/ROOT.war
EXPOSE 8080
