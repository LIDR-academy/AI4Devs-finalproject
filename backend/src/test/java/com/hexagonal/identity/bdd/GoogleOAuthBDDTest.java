package com.hexagonal.identity.bdd;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

/**
 * Cucumber BDD Test Runner for the Identity BC (US1 – Google OAuth Login).
 *
 * <p>Executes all scenarios tagged {@code @identity} in
 * {@code features/identity/US1.feature}.</p>
 *
 * <p>Architecture: Phase 1 (BDD-First). Step definitions are created in PENDING state
 * and will be implemented in Phase 6 (Controllers).</p>
 */
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features/identity")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "com.hexagonal.identity.bdd")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME,
        value = "pretty, html:target/cucumber-reports/identity-cucumber.html, json:target/cucumber-reports/identity-cucumber.json")
public class GoogleOAuthBDDTest {
}
