# Multi-stage Dockerfile para notification-service
FROM maven:3.9.9-eclipse-temurin-17 AS builder

# Trabajar desde la raíz de Backend para que Maven resuelva parent y módulos
WORKDIR /backend
COPY . .

# Instalar shared y compilar el servicio con dependencias necesarias
RUN mvn -q -DskipTests -pl shared -am install
RUN mvn -q -DskipTests -pl notification-service -am package

# Runtime stage
FROM payara/micro:6.2024.6-jdk17
COPY --from=builder /backend/notification-service/target/notification-service-0.1.0-SNAPSHOT.war /opt/payara/deployments/ROOT.war
EXPOSE 8080