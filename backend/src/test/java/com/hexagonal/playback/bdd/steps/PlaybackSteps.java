package com.hexagonal.playback.bdd.steps;

import com.hexagonal.playback.domain.model.ProcessingState;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Entonces;
import io.cucumber.java.es.Y;
import io.restassured.response.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import java.time.Instant;
import java.util.UUID;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class PlaybackSteps {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Response lastResponse;
    private final UUID userId = UUID.randomUUID();
    private UUID meditationId;

    @Dado("el usuario está autenticado")
    public void elUsuarioEstaAutenticado() {
        // En un futuro se autenticará vía JWT
        // Se limpia la DB o se usa un userId aleatorio para evitar colisiones entre tests
    }

    @Cuando("solicita ver el listado de sus meditaciones")
    public void solicitaVerElListadoDeSusMeditaciones() {
        lastResponse = given()
                .header("X-User-Id", userId.toString())
        .when()
                .get("/v1/playback/meditations"); // Base path is /api, so it calls /api/v1/playback/meditations
    }

    @Entonces("ve todas sus meditaciones")
    public void veTodasSusMeditaciones() {
        lastResponse.then().statusCode(200).body("meditations", is(notNullValue()));
    }

    @Y("para cada una ve su estado actual")
    public void paraCadaUnaVeSuEstadoActual() {
        // En este paso podemos comprobar que hay al menos una meditación si se sembró previamente
        // o simplemente que la estructura es correcta.
        lastResponse.then().body("meditations.state", everyItem(is(oneOf("PENDING", "PROCESSING", "COMPLETED", "FAILED"))));
        lastResponse.then().body("meditations.stateLabel", everyItem(is(oneOf("En cola", "Generando", "Completada", "Fallida"))));
    }

    @Dado("existe una meditación con estado {string} en su lista")
    public void existeUnaMeditacionConEstadoEnSuLista(String estado) {
        ProcessingState state = mapSpanishToDomainState(estado);
        meditationId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();
        String idempotencyKey = UUID.randomUUID().toString();
        
        // El nombre de la tabla real es generation.meditation_output según la entidad MeditationEntity
        // Se incluyen campos obligatorios de la tabla aunque no se usen en el BC de Playback
        jdbcTemplate.update(
            "INSERT INTO generation.meditation_output (meditation_id, composition_id, user_id, idempotency_key, narration_script_text, created_at, status, media_type, output_media_url, background_image_url, subtitle_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            meditationId,
            compositionId,
            userId,
            idempotencyKey,
            "Meditation title for BDD (" + estado + ")",
            Instant.now(),
            state.name(),
            "AUDIO",
            state == ProcessingState.COMPLETED ? "http://s3.aws.com/audio.mp3" : null,
            null,
            null
        );
    }

    @Cuando("selecciona reproducir esa meditación")
    public void seleccionaReproducirEsaMeditacion() {
        lastResponse = given()
                .header("X-User-Id", userId.toString())
        .when()
                .get("/v1/playback/meditations/{id}", meditationId);
    }

    @Entonces("comienza la reproducción del contenido")
    public void comienzaLaReproduccionDelContenido() {
        lastResponse.then()
                .statusCode(200)
                .body("id", equalTo(meditationId.toString()))
                .body("mediaUrls.audioUrl", notNullValue());
    }

    private ProcessingState mapSpanishToDomainState(String spanishEstado) {
        return switch (spanishEstado) {
            case "En cola" -> ProcessingState.PENDING;
            case "Generando" -> ProcessingState.PROCESSING;
            case "Completada" -> ProcessingState.COMPLETED;
            case "Fallida" -> ProcessingState.FAILED;
            default -> throw new IllegalArgumentException("Unknown Spanish state: " + spanishEstado);
        };
    }
}
