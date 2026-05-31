package com.mtl.catalog.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.catalog.config.JwtDecoderConfigTest;
import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.kafka.KafkaContainer;
import org.testcontainers.utility.DockerImageName;
import tools.jackson.databind.json.JsonMapper;

/**
 * Postgres + Kafka (Docker). POST Alta de ejemplar y un mensaje {@code EJEMPLAR_CREADO} en
 * {@code catalog.ejemplar.evento}.
 */
@Tag("integration")
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test-it-pg-kafka")
@Import(JwtDecoderConfigTest.class)
@EnabledIf("com.mtl.catalog.integration.support.DockerConditions#dockerDisponible")
class CatalogEjemplarPostKafkaIT {

  private static final DockerImageName KAFKA_IMAGE =
      DockerImageName.parse("apache/kafka-native:3.8.1");

  /** Primera especie sembrada (p. ej. Quercus ilex); ver V2__seed_maestros_inicial.sql */
  private static final long SPECIES_ID = 1L;

  /** Primera provincia sembrada (Álava); ver V2__seed_maestros_inicial.sql */
  private static final long PROVINCE_ID = 1L;

  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:16-alpine").withInitScript("postgres-init-test.sql");

  @Container static final KafkaContainer KAFKA = new KafkaContainer(KAFKA_IMAGE);

  @DynamicPropertySource
  static void registerProps(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
    registry.add("spring.kafka.bootstrap-servers", KAFKA::getBootstrapServers);
    registry.add("spring.main.web-application-type", () -> "servlet");
  }

  @Autowired private MockMvc mockMvc;

  private Consumer<String, String> consumer;

  private final JsonMapper jsonMapper = JsonMapper.builder().findAndAddModules().build();

  @BeforeEach
  void createConsumer() {
    Map<String, Object> props = new HashMap<>();
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, KAFKA.getBootstrapServers());
    props.put(ConsumerConfig.GROUP_ID_CONFIG, "catalog-tree-it-" + UUID.randomUUID());
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true");
    DefaultKafkaConsumerFactory<String, String> factory = new DefaultKafkaConsumerFactory<>(props);
    consumer = factory.createConsumer();
    consumer.subscribe(Collections.singletonList("catalog.ejemplar.evento"));
  }

  @AfterEach
  void closeConsumer() {
    if (consumer != null) {
      consumer.close();
    }
  }

  @Test
  void postEjemplar_persisteYEmiteEjemplarCreadoEnKafka() throws Exception {
    String body =
        """
        {
          "speciesId": %d,
          "provinceId": %d,
          "latitude": 40.4168,
          "longitude": -3.7038,
          "municipio": "Madrid",
          "description": "IT Kafka",
          "altitude": 600,
          "publicMapVisibility": "PUBLICO",
          "publicationState": "PUBLICADO"
        }
        """
            .formatted(SPECIES_ID, PROVINCE_ID);

    MvcResult result =
        mockMvc
            .perform(
                post("/api/catalog/trees")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + JwtDecoderConfigTest.TOKEN_COLABORADOR)
                    .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.treeId").exists())
            .andReturn();

    long ejemplarId =
        jsonMapper
            .readTree(result.getResponse().getContentAsString())
            .path("treeId")
            .longValue();

    String eventJson = pollUntilEjemplarCreado(ejemplarId);
    var node = jsonMapper.readTree(eventJson);
    assertThat(node.path("tipo_evento").toString().replace("\"", "")).isEqualTo("EJEMPLAR_CREADO");
    assertThat(node.path("ejemplar_id").asLong()).isEqualTo(ejemplarId);
    assertThat(node.path("evento_id").asLong()).isPositive();
    assertThat(node.hasNonNull("ocurrido_en")).isTrue();
  }

  private String pollUntilEjemplarCreado(long expectedEjemplarId) {
    Duration timeout = Duration.ofSeconds(30);
    long deadline = System.nanoTime() + timeout.toNanos();
    while (System.nanoTime() < deadline) {
      ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(400));
      for (var r : records) {
        if (r.value() == null) {
          continue;
        }
        try {
          var n = jsonMapper.readTree(r.value());
          if ("EJEMPLAR_CREADO".equals(n.path("tipo_evento").toString().replace("\"", ""))
              && n.path("ejemplar_id").asLong() == expectedEjemplarId) {
            return r.value();
          }
        } catch (Exception ignored) {
          // siguiente registro
        }
      }
    }
    throw new AssertionError("No se recibió EJEMPLAR_CREADO para ejemplar_id=" + expectedEjemplarId + " a tiempo");
  }
}
