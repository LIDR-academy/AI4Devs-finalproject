# Use the official OpenJDK 21 image
FROM openjdk:21-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the Maven build files
# COPY pom.xml .
COPY ../target/enrique-finalproject-0.0.1-SNAPSHOT.jar .


# Package the application
#RUN ./mvnw package

# Expose the port the app runs on
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "demo-0.0.1-SNAPSHOT.jar"]
