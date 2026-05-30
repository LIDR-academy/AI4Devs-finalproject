package com.mtl.media.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.media.application.MediaPhotoDeleteService;
import com.mtl.media.application.MediaUploadService;
import com.mtl.media.config.MediaJwtAuthenticationPrincipalTestMvcConfig;
import com.mtl.media.dto.PhotoMetadataResponse;
import com.mtl.media.dto.PresignUploadResponse;
import com.mtl.media.exception.MediaUploadValidationException;
import com.mtl.media.web.error.MediaExceptionHandler;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Collections;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.oauth2.server.resource.autoconfigure.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(
    controllers = MediaUploadController.class,
    excludeAutoConfiguration = OAuth2ResourceServerAutoConfiguration.class)
@Import({MediaExceptionHandler.class, MediaJwtAuthenticationPrincipalTestMvcConfig.class})
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class MediaUploadControllerWebMvcTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private MediaUploadService mediaUploadService;
  @MockitoBean private MediaPhotoDeleteService mediaPhotoDeleteService;

  @AfterEach
  void clearSecurityContext() {
    SecurityContextHolder.clearContext();
  }

  private static MockHttpServletRequestBuilder withJwtPrincipal(
      MockHttpServletRequestBuilder builder, Authentication authentication) {
    return builder.with(
        request -> {
          SecurityContextHolder.getContext().setAuthentication(authentication);
          return request;
        });
  }

  private static JwtAuthenticationToken collaboratorAuthentication() {
    Jwt jwt =
        Jwt.withTokenValue("dummy.jwt.value")
            .headers(h -> h.put("alg", "none"))
            .issuer("http://localhost:8180/realms/mtl")
            .subject("kc-sub")
            .audience(Collections.singletonList("account"))
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .claim("email", "u@example.invalid")
            .build();

    return new JwtAuthenticationToken(
        jwt, Collections.singleton(new SimpleGrantedAuthority("ROLE_COLABORADOR")));
  }

  @Test
  void presign_cuerpoInvalido_devuelve400() throws Exception {
    JwtAuthenticationToken authentication = collaboratorAuthentication();

    mockMvc
        .perform(
            withJwtPrincipal(
                post("/api/media/uploads/presign")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "ejemplarId": 1,
                          "nombreFicheroOriginal": "a.jpg",
                          "tipoMime": "image/jpeg",
                          "tamanoBytes": 0
                        }
                        """),
                authentication))
        .andExpect(status().isBadRequest());
  }

  @Test
  void presign_validacionNegocio_devuelve400ProblemJson() throws Exception {
    when(mediaUploadService.createPresignedUpload(any(), any()))
        .thenThrow(new MediaUploadValidationException("Tipo MIME no permitido."));

    JwtAuthenticationToken authentication = collaboratorAuthentication();

    mockMvc
        .perform(
            withJwtPrincipal(
                post("/api/media/uploads/presign")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "ejemplarId": 1,
                          "nombreFicheroOriginal": "a.jpg",
                          "tipoMime": "image/jpeg",
                          "tamanoBytes": 1024
                        }
                        """),
                authentication))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.title").value("Solicitud inválida para subida de fotografía"))
        .andExpect(jsonPath("$.detail").value("Tipo MIME no permitido."))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.instance").value("/api/media/uploads/presign"));
  }

  @Test
  void presign_sinPermisoCatalogo_devuelve403ProblemJson() throws Exception {
    when(mediaUploadService.createPresignedUpload(any(), any()))
        .thenThrow(
            new ResponseStatusException(HttpStatus.FORBIDDEN, "No tiene permiso para asociar fotografías a este ejemplar."));

    JwtAuthenticationToken authentication = collaboratorAuthentication();

    mockMvc
        .perform(
            withJwtPrincipal(
                post("/api/media/uploads/presign")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "ejemplarId": 99,
                          "nombreFicheroOriginal": "a.jpg",
                          "tipoMime": "image/jpeg",
                          "tamanoBytes": 1024
                        }
                        """),
                authentication))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.status").value(403))
        .andExpect(jsonPath("$.detail").value("No tiene permiso para asociar fotografías a este ejemplar."));
  }

  @Test
  void confirm_validacionNegocio_devuelve400ProblemJson() throws Exception {
    when(mediaUploadService.confirmUpload(any(), any()))
        .thenThrow(
            new MediaUploadValidationException(
                "El bucket indicado no coincide con el bucket configurado del servicio."));

    JwtAuthenticationToken authentication = collaboratorAuthentication();

    mockMvc
        .perform(
            withJwtPrincipal(
                post("/api/media/photos/confirm")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "ejemplarId": 1,
                          "bucket": "otro",
                          "objectKey": "k",
                          "nombreFicheroOriginal": "a.jpg",
                          "tipoMime": "image/jpeg",
                          "tamanoBytes": 100
                        }
                        """),
                authentication))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.title").value("Solicitud inválida para subida de fotografía"))
        .andExpect(jsonPath("$.instance").value("/api/media/photos/confirm"));
  }

  @Test
  void deletePhoto_devuelve204() throws Exception {
    JwtAuthenticationToken authentication = collaboratorAuthentication();

    mockMvc
        .perform(withJwtPrincipal(delete("/api/media/photos/10"), authentication))
        .andExpect(status().isNoContent());

    org.mockito.Mockito.verify(mediaPhotoDeleteService).deletePhoto(10L, authentication.getToken());
  }

  @Test
  void getPhotoMetadata_noEncontrada_devuelve404ProblemJson() throws Exception {
    when(mediaUploadService.getPhotoMetadata(any(), any()))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Fotografía no encontrada"));

    JwtAuthenticationToken authentication = collaboratorAuthentication();

    mockMvc
        .perform(withJwtPrincipal(get("/api/media/photos/404"), authentication))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.detail").value("Fotografía no encontrada"));
  }

  @Test
  void presign_ok_devuelve200Ycuerpo() throws Exception {
    OffsetDateTime expires = OffsetDateTime.parse("2026-01-02T12:00:00Z");
    when(mediaUploadService.createPresignedUpload(any(), any()))
        .thenReturn(
            new PresignUploadResponse(
                "http://minio/mtl/a.jpg?x=1", "mtl-photos", "ejemplares/1/uuid-a.jpg", expires));

    JwtAuthenticationToken authentication = collaboratorAuthentication();

    mockMvc
        .perform(
            withJwtPrincipal(
                post("/api/media/uploads/presign")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "ejemplarId": 1,
                          "nombreFicheroOriginal": "a.jpg",
                          "tipoMime": "image/jpeg",
                          "tamanoBytes": 1024
                        }
                        """),
                authentication))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.bucket").value("mtl-photos"))
        .andExpect(jsonPath("$.objectKey").value("ejemplares/1/uuid-a.jpg"));
  }

  @Test
  void confirm_ok_devuelve201() throws Exception {
    when(mediaUploadService.confirmUpload(any(), any()))
        .thenReturn(
            new PhotoMetadataResponse(
                10L,
                1L,
                "mtl-photos",
                "ejemplares/1/k.jpg",
                "k.jpg",
                "image/jpeg",
                500L,
                null,
                null,
                0,
                true,
                OffsetDateTime.parse("2026-01-03T10:00:00Z")));

    JwtAuthenticationToken authentication = collaboratorAuthentication();

    mockMvc
        .perform(
            withJwtPrincipal(
                post("/api/media/photos/confirm")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "ejemplarId": 1,
                          "bucket": "mtl-photos",
                          "objectKey": "ejemplares/1/k.jpg",
                          "nombreFicheroOriginal": "k.jpg",
                          "tipoMime": "image/jpeg",
                          "tamanoBytes": 500
                        }
                        """),
                authentication))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.photoId").value(10))
        .andExpect(jsonPath("$.esPrincipal").value(true));
  }
}
