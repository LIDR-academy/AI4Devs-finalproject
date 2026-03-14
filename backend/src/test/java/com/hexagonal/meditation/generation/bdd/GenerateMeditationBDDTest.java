package com.hexagonal.meditation.generation.bdd;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

/**
 * Cucumber BDD Test Suite for Meditation Generation.
 * 
 * Runs all features in src/test/resources/features/generation/
 * Glue code in com.hexagonal.meditation.generation.bdd (steps)
 */
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features/generation")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "com.hexagonal.meditation.generation.bdd")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty, html:target/cucumber-reports/generation.html")
public class GenerateMeditationBDDTest {
}
