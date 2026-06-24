package com.stayhub.architecture

import com.tngtech.archunit.core.importer.ClassFileImporter
import com.tngtech.archunit.core.importer.ImportOption
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses
import org.junit.jupiter.api.Test

/**
 * Enforces Clean Architecture / Hexagonal layering for the backend.
 *
 * Layers and dependency direction (only inward dependencies allowed):
 *
 *     presentation  ──►  application  ──►  domain
 *     infrastructure ──►  application  ──►  domain
 *
 * Violation history (do not repeat):
 *  - Phase 3: use cases imported `presentation.error.ApiException` —
 *    application layer was reaching into presentation. Fixed by moving
 *    exception classes to `application/error/`.
 *  - Phase 4: same pattern leaked again before this guard was added.
 *
 * If you find yourself wanting to import something into the wrong layer,
 * the fix is almost always to move the *type* down to a lower layer, not
 * to relax this rule. Ask before adding ignores.
 */
class CleanArchitectureTest {

    private val importedClasses = ClassFileImporter()
        .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
        .importPackages("com.stayhub")

    @Test
    fun `domain must not depend on any other layer or framework`() {
        noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                "..application..",
                "..infrastructure..",
                "..presentation..",
            )
            .because("domain is the innermost layer — it has no inbound dependencies on outer layers")
            .check(importedClasses)
    }

    @Test
    fun `application must not depend on infrastructure or presentation`() {
        noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAnyPackage(
                "..infrastructure..",
                "..presentation..",
            )
            .because(
                "application orchestrates domain logic and may use domain types only. " +
                    "Errors thrown by use cases must live in `application/error/`, not in `presentation/error/`. " +
                    "External services (Mapbox, DBs) must be referenced via domain ports, not infrastructure adapters.",
            )
            .check(importedClasses)
    }

    @Test
    fun `infrastructure may depend on application and domain but not on presentation`() {
        noClasses()
            .that().resideInAPackage("..infrastructure..")
            .should().dependOnClassesThat().resideInAPackage("..presentation..")
            .because("infrastructure adapters implement domain ports; HTTP-shaped types live in presentation")
            .check(importedClasses)
    }

    @Test
    fun `domain interfaces should not be annotated with Spring stereotypes`() {
        noClasses()
            .that().resideInAPackage("..domain..")
            .should().beAnnotatedWith("org.springframework.stereotype.Service")
            .orShould().beAnnotatedWith("org.springframework.stereotype.Repository")
            .orShould().beAnnotatedWith("org.springframework.stereotype.Component")
            .orShould().beAnnotatedWith("org.springframework.web.bind.annotation.RestController")
            .because("domain is framework-free; Spring stereotypes belong on adapters in infrastructure or presentation")
            .check(importedClasses)
    }

    @Test
    fun `controllers must live in presentation layer`() {
        classes()
            .that().areAnnotatedWith("org.springframework.web.bind.annotation.RestController")
            .should().resideInAPackage("..presentation..")
            .because("REST controllers are presentation-layer adapters")
            .check(importedClasses)
    }

    @Test
    fun `repository adapters must live in infrastructure layer`() {
        classes()
            .that().areAnnotatedWith("org.springframework.stereotype.Repository")
            .should().resideInAPackage("..infrastructure..")
            .because("repository implementations are outbound adapters in infrastructure")
            .check(importedClasses)
    }
}
