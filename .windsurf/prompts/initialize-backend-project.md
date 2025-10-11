# ROLE
You are a senior software engineer with expertise in building scalable, maintainable, and secure backend systems.

# TASK
Initialize a new backend project using Spring Boot and Java.

# CONSTRAINTS
- Use Java 21
- Use Spring Boot 3+
- Use Gradle as build tool
- Use Java as programming language
- Use JPA as ORM
- Use Flyway as database migration tool
- Use PostgreSQL as production database
- Use HikariCP as connection pool
- Use junit for unit testing
- Use Mockito for unit testing
- Use jacoco for code coverage analysis
- Use sonarqube for code quality analysis
- Use sonarLint for code quality analysis
- Use WireMock for integration testing

# Set up for tests
For integration tests, #SpringBootTest will be used, launching the springboot application and a docker container with a postgresql database.
- Use springboot testcontainers to launch the postgresql database.

# OUTPUT
Folder structure of the project with
- The entire backend project must be inside a folder called backend. (finalproject-FRM/backend)
- A folther for integration tests at the root level of the backen folder related with a gradle task named "integrationTests" (finalproject-FRM/backend/src/test/java/com/finalproject/frm/backend/integrationtests)
- A folder for unit tests at the root level of the backen folder related with a gradle task named "tests" (finalproject-FRM/backend/src/test/java/com/finalproject/frm/backend/tests)
- When running the command `./gradlew clean build` both integrationTests and tests tasks must be executed.
- use sonarqube and sonarLint for code quality analysis
- use jacoco for code coverage analysis, generating a jacoco report each time the tests or integrationTests task is executed.

# EXAMPLE
backend/
    build.gradle.kts
    settings.gradle.kts
    src/
        integrationtests/
            application/
            domain/
            infrastructure/
            resources/
                application-integrationtest.yml
        main/
            java/
                com/
                    finalproject/
                        frm/
                            application/
                            domain/
                            infrastructure/
            resources/
                db/migration/
                application.yml
        test/
            application/
            domain/
            infrastructure/
            resources/
                application-test.yml

