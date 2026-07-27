# Backend - Kotlin + Spring Boot 3 (Gradle)
# Espera un proyecto Gradle estándar (build.gradle.kts, gradlew, src/...) en este directorio.

# ---- Build stage ----
FROM gradle:8-jdk21 AS build
WORKDIR /app
COPY . .
RUN gradle bootJar --no-daemon

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
