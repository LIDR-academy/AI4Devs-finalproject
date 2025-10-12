# ROLE
You are a senior software engineer with expertise in building scalable, maintainable, and secure backend systems.

# TASK
A java project was initialized using gradle wrapper inside the folder backend.
With that starting structure, your task is to complete the setup of the project according to the requirements describe in this prompt.
I think you mostly need to modify the build.gradle.kts file and the settings.gradle.kts file, apart from that, you will need to create the necessary folders and files for the project.

# CONSTRAINTS
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
- Maybe default springboot configuration is enough for this project, so take it as a good starting point.

# Set up for tests
For integration tests, #SpringBootTest will be used, launching the springboot application and a docker container with a postgresql database.
- Use springboot testcontainers to launch the postgresql database.

# OUTPUT
Folder structure of the project with
- The entire backend project must be inside a folder called backend. (finalproject-FRM/backend)
- A folther for integration tests at the root level of the backen folder related with a gradle task named "integrationTests" (finalproject-FRM/backend/src/integrationtest/java/ai4devs/frm/integrationtests)
- A folder for unit tests at the root level of the backen folder related with a gradle task named "tests" (finalproject-FRM/backend/src/test/java/ai4devs/frm/)
- When running the command `./gradlew clean build` both integrationTests and tests tasks must be executed.
- use sonarqube and sonarLint for code quality analysis
- use jacoco for code coverage analysis, generating a jacoco report each time the tests or integrationTests task is executed.
- setup all the necesary files and folders to the .gitignore file.

# EXAMPLE
backend/
    build.gradle.kts
    settings.gradle.kts
    src/
        integrationtest/
            java/
                ai4devs/
                    frm/
                        application/
                        domain/
                        infrastructure/
                        resources/
                            application-integrationtest.yml
        main/
            java/
                ai4devs/
                    frm/
                        application/
                        domain/
                        infrastructure/
                    resources/
                        db/migration/
                        application.yml
        test/
            java/
                ai4devs/
                    frm/
                        application/
                        domain/
                        infrastructure/
                    resources/
                        application-test.yml

