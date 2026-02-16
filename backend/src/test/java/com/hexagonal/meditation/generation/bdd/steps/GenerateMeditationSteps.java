package com.hexagonal.meditation.generation.bdd.steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import io.cucumber.java.Before;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Step definitions for Generate Meditation Content feature (BC: Generation).
 */
public class GenerateMeditationSteps {

    private Response lastResponse;
    private String currentText;
    private String currentMusicReference;
    private String currentImageReference;
    private final UUID userId = UUID.randomUUID();
    private final UUID compositionId = UUID.randomUUID();

    @Before
    public void setupTestFiles() throws IOException {
        createDummyFile("nature-sounds-01.mp3");
        createDummyFile("calm-piano-02.mp3");
        createDummyFile("meditation-music-03.mp3");
        createDummyFile("peaceful-landscape.jpg");
    }

    private void createDummyFile(String filename) throws IOException {
        Path path = Path.of(filename);
        if (!Files.exists(path)) {
            Files.writeString(path, "dummy content for " + filename);
        }
    }

    @Given("the user is authenticated")
    public void theUserIsAuthenticated() {
        // Simulado vía headers en RestAssured
    }

    @Given("sends meditation text {string}")
    public void sendsMeditationText(String text) {
        this.currentText = text;
    }

    @Given("sends meditation text with excessive length that would exceed processing time limits")
    public void sendsMeditationTextWithExcessiveLength() {
        this.currentText = "calm ".repeat(500); // 500 words > 30s limit
    }

    @Given("selects a valid music track {string}")
    public void selectsAValidMusicTrack(String musicReference) {
        this.currentMusicReference = musicReference;
    }

    @Given("selects a valid image {string}")
    public void selectsAValidImage(String imageReference) {
        this.currentImageReference = imageReference;
    }

    @Given("does not select an image")
    public void doesNotSelectAnImage() {
        this.currentImageReference = null;
    }

    @When("requests to generate the content")
    public void requestsToGenerateTheContent() {
        Map<String, Object> body = new HashMap<>();
        body.put("text", currentText);
        body.put("musicReference", currentMusicReference);
        if (currentImageReference != null) {
            body.put("imageReference", currentImageReference);
        }

        lastResponse = given()
                .header("X-User-ID", userId.toString())
                .header("X-Composition-ID", compositionId.toString())
                .contentType(ContentType.JSON)
                .body(body)
        .when()
                .post("/v1/generation/meditations");
    }

    @Then("the system produces high-quality narration from the text")
    public void theSystemProducesHighQualityNarrationFromTheText() {
        lastResponse.then().body("status", is("COMPLETED"));
    }

    @Then("generates comprehensible synchronized subtitles")
    public void generatesComprehensibleSynchronizedSubtitles() {
        lastResponse.then().body("subtitleUrl", notNullValue());
    }

    @Then("combines narration, music, and static image into a final video")
    public void combinesNarrationMusicAndStaticImageIntoAFinalVideo() {
        lastResponse.then().body("type", is("VIDEO"));
        lastResponse.then().body("mediaUrl", containsString(".mp4"));
    }

    @Then("the platform registers the meditation as type {string}")
    public void thePlatformRegistersTheMeditationAsType(String expectedType) {
        lastResponse.then().body("type", is(expectedType));
    }

    @Then("the user receives access to the video in an acceptable timeframe")
    public void theUserReceivesAccessToTheVideoInAnAcceptableTimeframe() {
        lastResponse.then().statusCode(200);
        lastResponse.then().body("mediaUrl", notNullValue());
    }

    @Then("combines the narration with music in a final audio output")
    public void combinesTheNarrationWithMusicInAFinalAudioOutput() {
        lastResponse.then().body("type", is("AUDIO"));
        lastResponse.then().body("mediaUrl", containsString(".mp3"));
    }

    @Then("generates synchronized subtitles for future use")
    public void generatesSynchronizedSubtitlesForFutureUse() {
        lastResponse.then().body("subtitleUrl", notNullValue());
    }

    @Then("the user receives access to the audio in an acceptable timeframe")
    public void theUserReceivesAccessToTheAudioInAnAcceptableTimeframe() {
        lastResponse.then().statusCode(200);
        lastResponse.then().body("mediaUrl", notNullValue());
    }

    @Then("the system rejects the request with a time exceeded message")
    public void theSystemRejectsTheRequestWithATimeExceededMessage() {
        lastResponse.then().statusCode(408);
    }

    @Then("recommends sending shorter text")
    public void recommendsSendingShorterText() {
        lastResponse.then().body("message", containsString("shorter text"));
    }
}
