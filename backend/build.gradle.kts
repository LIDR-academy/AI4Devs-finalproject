plugins {
	java
	id("org.springframework.boot") version "3.5.6"
	id("io.spring.dependency-management") version "1.1.7"
	id("jacoco")
	id("org.sonarqube") version "5.1.0.4882"
}

group = "ai4devs.frm"
version = "0.0.1-SNAPSHOT"
description = "backend"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.flywaydb:flyway-core")
	implementation("org.flywaydb:flyway-database-postgresql")
	developmentOnly("org.springframework.boot:spring-boot-devtools")
	developmentOnly("org.springframework.boot:spring-boot-docker-compose")
	runtimeOnly("org.postgresql:postgresql")
	annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
	
	// Unit Testing
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.springframework.boot:spring-boot-testcontainers")
	testImplementation("org.springframework.security:spring-security-test")
	testImplementation("org.testcontainers:junit-jupiter")
	testImplementation("org.testcontainers:postgresql")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

// Create integration test source set
val integrationTest = sourceSets.create("integrationTest") {
	java {
		srcDir("src/integrationTest/java")
	}
	resources {
		srcDir("src/integrationTest/resources")
	}
	compileClasspath += sourceSets.main.get().output + configurations.testRuntimeClasspath.get()
	runtimeClasspath += output + compileClasspath
}

// Configure duplicate handling for integration test resources
tasks.named<ProcessResources>("processIntegrationTestResources") {
	duplicatesStrategy = DuplicatesStrategy.INCLUDE
}

// Add integration test dependencies
dependencies {
	"integrationTestImplementation"("org.springframework.boot:spring-boot-starter-test")
	"integrationTestImplementation"("org.springframework.boot:spring-boot-testcontainers")
	"integrationTestImplementation"("org.springframework.security:spring-security-test")
	"integrationTestImplementation"("org.testcontainers:junit-jupiter")
	"integrationTestImplementation"("org.testcontainers:postgresql")
	"integrationTestImplementation"("org.wiremock:wiremock-standalone:3.9.1")
	"integrationTestRuntimeOnly"("org.junit.platform:junit-platform-launcher")
}

// Configure unit test task
tasks.named<Test>("test") {
	useJUnitPlatform()
	description = "Runs unit tests"
	group = "verification"
	
	testLogging {
		events("passed", "skipped", "failed")
	}
	
	finalizedBy(tasks.jacocoTestReport)
}

// Create integration test task
val integrationTestTask = tasks.register<Test>("integrationTest") {
	description = "Runs integration tests"
	group = "verification"
	testClassesDirs = integrationTest.output.classesDirs
	classpath = integrationTest.runtimeClasspath
	
	useJUnitPlatform()
	
	// Run integration tests after unit tests
	shouldRunAfter(tasks.test)
	
	testLogging {
		events("passed", "skipped", "failed")
	}
	
	finalizedBy(tasks.jacocoTestReport)
}

// Configure JaCoCo
tasks.jacocoTestReport {
	dependsOn(tasks.test, integrationTestTask)
	
	executionData.setFrom(fileTree(layout.buildDirectory).include("/jacoco/*.exec"))
	
	reports {
		xml.required.set(true)
		html.required.set(true)
		csv.required.set(false)
	}
}

tasks.jacocoTestCoverageVerification {
	dependsOn(tasks.jacocoTestReport)
	
	violationRules {
		rule {
			limit {
				minimum = "0.70".toBigDecimal()
			}
		}
	}
}

// Configure SonarQube
sonar {
	properties {
		property("sonar.projectKey", "ai4devs-frm-backend")
		property("sonar.projectName", "AI4Devs FRM Backend")
		property("sonar.sources", "src/main/java")
		property("sonar.tests", "src/test/java,src/integrationTest/java")
		property("sonar.java.binaries", "build/classes")
		property("sonar.coverage.jacoco.xmlReportPaths", "build/reports/jacoco/test/jacocoTestReport.xml")
	}
}

// Make build depend on both test tasks
tasks.build {
	dependsOn(tasks.test, integrationTestTask)
}
