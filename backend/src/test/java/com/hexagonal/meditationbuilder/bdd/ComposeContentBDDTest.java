package com.hexagonal.meditationbuilder.bdd;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

/**
 * Cucumber BDD Test Runner
 *
 * This runner executes all BDD scenarios in the compose-content.feature file.
 * Now includes Spring Boot context for integration testing.
 */
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("meditationbuilder")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "com.hexagonal.meditationbuilder.bdd")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty, html:target/cucumber-reports/cucumber.html, json:target/cucumber-reports/cucumber.json")
public class ComposeContentBDDTest {
}
