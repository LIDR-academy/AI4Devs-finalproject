---
trigger: always_on
---

Of course. Here is a more concise set of rules updated to reflect a Domain-Driven Design (DDD) approach.

-----

## 1\. Project Setup & Dependencies 🏗️

  * **Build & Versions:** Use **Gradle**. Target **Java 21 LTS** and the latest stable **Spring Boot 3+**.
  * **Database Migrations:** Use **Flyway** for database schema version control. Place SQL migration scripts in `src/main/resources/db/migration`.
  * **Dependencies:** Use the official **Spring Boot Starter POMs** (`web`, `data-jpa`, `validation`, `flyway-mysql`, etc.).
  * **Concurrency:** Enable **Virtual Threads** in `application.properties` for scalable I/O operations (`spring.threads.virtual.enabled=true`).

-----

## 2\. Architecture: Domain-Driven Design (DDD) 🏛️

  * **Core Principle:** Use a **DDD** approach with a **Hexagonal (Clean) Architecture**. Your business logic is the core, and frameworks are implementation details.

  * **Top-Level Packages:** The root packages must be `domain`, `application`, and `infrastructure`.

  * **Package Structure:** Within each layer, continue to group code by **feature/aggregate**.

    ```
    /com/example/app
      /domain
        /user
          - User.java                   // Aggregate Root with rich business logic
          - Email.java                  // Value Object with validation
          - UserRepository.java         // Interface ("Port")
      /application
        /user
          - UserApplicationService.java // Thin coordinator
      /infrastructure
        /user
          - UserController.java         // REST Adapter
          - JpaUserRepository.java      // JPA Adapter
          - UserDto.java                // DTO for the web
    ```

-----

## 3\. The Domain Layer 🧠

  * **Rich Domain Model:** All business logic, rules, and state-changing methods **must** be inside your domain **Aggregates** and **Entities**. The domain layer is framework-agnostic.

  * **Validation via Value Objects:** Do not rely on framework validation in the domain. Encapsulate validation logic inside the **constructors or factory methods of Value Objects**.

    ```java
    public record Email(String value) {
        public Email { // Compact constructor for validation
            if (value == null || !value.matches("...")) {
                throw new IllegalArgumentException("Invalid email format");
            }
        }
    }
    ```

-----

## 4\. Application & Infrastructure Layers 🌐

  * **Application Services:** Services in the `/application` layer are **thin coordinators**. Their job is to:
    1.  Load an aggregate from a repository.
    2.  Execute a single method on that aggregate.
    3.  Save the aggregate's new state back to the repository.
  * **Infrastructure's Role:** The `/infrastructure` layer provides concrete implementations for the interfaces ("ports") defined in the `domain` layer. This includes:
      * **JPA Repositories:** Use Spring Data JPA (`JpaRepository`) to implement basic CRUD operations for your repository interfaces.
      * **REST Controllers:** Handle HTTP requests, map to DTOs, and call the application service.

-----

## 5\. Testing 🧪

  * **Domain First:** Prioritize **unit testing the domain layer** with plain JUnit. These tests should be extremely fast as they require no Spring context.
  * **Infrastructure:** Use slice tests (`@DataJpaTest`) to verify your JPA repository implementations.
  * **End-to-End:** Use **Testcontainers** with `@SpringBootTest` for integration tests that validate the entire application flow against a real database.