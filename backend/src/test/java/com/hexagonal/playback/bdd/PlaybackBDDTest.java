package com.hexagonal.playback.bdd;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

/**
 * Cucumber BDD Test Runner for Playback BC
 */
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features/playback")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "com.hexagonal.playback.bdd")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty, html:target/cucumber-reports/playback.html, json:target/cucumber-reports/playback.json")
public class PlaybackBDDTest {
}
