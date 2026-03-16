package com.hexagonal.meditationbuilder.infrastructure.out.service;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.model.MusicReference;
import org.junit.jupiter.api.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for MediaCatalogAdapter using WireMock.
 * 
 * Tests HTTP communication with external Media Catalog service.
 * No real external services are called.
 */
@DisplayName("MediaCatalogAdapter Integration Tests")
class MediaCatalogAdapterIntegrationTest {

    private static WireMockServer wireMockServer;
    private MediaCatalogAdapter adapter;

    @BeforeAll
    static void setupServer() {
        wireMockServer = new WireMockServer(0); // Random port
        wireMockServer.start();
        WireMock.configureFor("localhost", wireMockServer.port());
    }

    @AfterAll
    static void stopServer() {
        wireMockServer.stop();
    }

    @BeforeEach
    void setUp() {
        wireMockServer.resetAll();
        // Use SimpleClientHttpRequestFactory to avoid HTTP/2 issues with WireMock
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(5000);
        RestClient restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
        String baseUrl = "http://localhost:" + wireMockServer.port();
        adapter = new MediaCatalogAdapter(restClient, baseUrl);
    }

    @Nested
    @DisplayName("getAvailableMusic()")
    class GetAvailableMusicTests {

        @Test
        @DisplayName("should return list of music references")
        void shouldReturnListOfMusicReferences() {
            stubFor(get(urlEqualTo("/api/media/music"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""
                                    {
                                        "items": [
                                            {"id": "music-001", "name": "Peaceful Morning", "artist": "Nature Sounds", "durationSeconds": 180, "previewUrl": "http://example.com/preview/001"},
                                            {"id": "music-002", "name": "Ocean Waves", "artist": "Relaxation", "durationSeconds": 240, "previewUrl": "http://example.com/preview/002"}
                                        ]
                                    }
                                    """)));

            List<MusicReference> result = adapter.getAvailableMusic();

            assertThat(result).hasSize(2);
            assertThat(result.get(0).value()).isEqualTo("music-001");
            assertThat(result.get(1).value()).isEqualTo("music-002");
        }

        @Test
        @DisplayName("should return empty list when no music available")
        void shouldReturnEmptyListWhenNoMusicAvailable() {
            stubFor(get(urlEqualTo("/api/media/music"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""
                                    {"items": []}
                                    """)));

            List<MusicReference> result = adapter.getAvailableMusic();

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should throw exception on server error")
        void shouldThrowExceptionOnServerError() {
            stubFor(get(urlEqualTo("/api/media/music"))
                    .willReturn(aResponse()
                            .withStatus(500)));

            assertThatThrownBy(() -> adapter.getAvailableMusic())
                    .isInstanceOf(MediaCatalogAdapter.MediaCatalogServiceException.class)
                    .hasMessageContaining("Failed to fetch available music");
        }
    }

    @Nested
    @DisplayName("getAvailableImages()")
    class GetAvailableImagesTests {

        @Test
        @DisplayName("should return list of image references")
        void shouldReturnListOfImageReferences() {
            stubFor(get(urlEqualTo("/api/media/images"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""
                                    {
                                        "items": [
                                            {"id": "image-001", "name": "Sunset", "thumbnailUrl": "http://example.com/thumb/001", "fullUrl": "http://example.com/full/001", "width": 1920, "height": 1080},
                                            {"id": "image-002", "name": "Mountains", "thumbnailUrl": "http://example.com/thumb/002", "fullUrl": "http://example.com/full/002", "width": 1920, "height": 1080}
                                        ]
                                    }
                                    """)));

            List<ImageReference> result = adapter.getAvailableImages();

            assertThat(result).hasSize(2);
            assertThat(result.get(0).value()).isEqualTo("image-001");
            assertThat(result.get(1).value()).isEqualTo("image-002");
        }

        @Test
        @DisplayName("should return empty list when no images available")
        void shouldReturnEmptyListWhenNoImagesAvailable() {
            stubFor(get(urlEqualTo("/api/media/images"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""
                                    {"items": []}
                                    """)));

            List<ImageReference> result = adapter.getAvailableImages();

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("musicExists()")
    class MusicExistsTests {

        @Test
        @DisplayName("should return true when music exists")
        void shouldReturnTrueWhenMusicExists() {
            stubFor(head(urlEqualTo("/api/media/music/music-001"))
                    .willReturn(aResponse()
                            .withStatus(200)));

            boolean result = adapter.musicExists(new MusicReference("music-001"));

            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should return false when music does not exist")
        void shouldReturnFalseWhenMusicDoesNotExist() {
            stubFor(head(urlEqualTo("/api/media/music/music-999"))
                    .willReturn(aResponse()
                            .withStatus(404)));

            boolean result = adapter.musicExists(new MusicReference("music-999"));

            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("should throw exception when musicReference is null")
        void shouldThrowExceptionWhenMusicReferenceIsNull() {
            assertThatThrownBy(() -> adapter.musicExists(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("musicReference is required");
        }
    }

    @Nested
    @DisplayName("imageExists()")
    class ImageExistsTests {

        @Test
        @DisplayName("should return true when image exists")
        void shouldReturnTrueWhenImageExists() {
            stubFor(head(urlEqualTo("/api/media/images/image-001"))
                    .willReturn(aResponse()
                            .withStatus(200)));

            boolean result = adapter.imageExists(new ImageReference("image-001"));

            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should return false when image does not exist")
        void shouldReturnFalseWhenImageDoesNotExist() {
            stubFor(head(urlEqualTo("/api/media/images/image-999"))
                    .willReturn(aResponse()
                            .withStatus(404)));

            boolean result = adapter.imageExists(new ImageReference("image-999"));

            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("should throw exception when imageReference is null")
        void shouldThrowExceptionWhenImageReferenceIsNull() {
            assertThatThrownBy(() -> adapter.imageExists(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("imageReference is required");
        }
    }
}
