package com.mtl.media.api;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.media.application.MediaTreePhotoGalleryService;
import com.mtl.media.config.MediaPresignProperties;
import com.mtl.media.config.MediaJwtAuthenticationPrincipalTestMvcConfig;
import com.mtl.media.domain.CategoriaFotografia;
import com.mtl.media.domain.Fotografia;
import com.mtl.media.storage.ObjectStoragePresigner;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.oauth2.server.resource.autoconfigure.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@WebMvcTest(
    controllers = MediaTreePhotoGalleryController.class,
    excludeAutoConfiguration = OAuth2ResourceServerAutoConfiguration.class)
@Import(MediaJwtAuthenticationPrincipalTestMvcConfig.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class MediaTreePhotoGalleryControllerWebMvcTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private MediaTreePhotoGalleryService galleryService;
  @MockitoBean private ObjectStoragePresigner objectStoragePresigner;
  @MockitoBean private MediaPresignProperties presignProperties;

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
            .build();

    return new JwtAuthenticationToken(
        jwt, Collections.singleton(new SimpleGrantedAuthority("ROLE_COLABORADOR")));
  }

  @Test
  void findByTreeId_ok_returnsOrderedGallery() throws Exception {
    when(presignProperties.getExpiresIn()).thenReturn(Duration.ofMinutes(15));
    when(objectStoragePresigner.presignedGetUrl("mtl-photos", "trees/5/p1.jpg", Duration.ofMinutes(15)))
        .thenReturn("http://localhost:9000/mtl-photos/trees/5/p1.jpg?X-Amz-SignedHeaders=host");
    when(objectStoragePresigner.presignedGetUrl("mtl-photos", "trees/5/p2.jpg", Duration.ofMinutes(15)))
        .thenReturn("http://localhost:9000/mtl-photos/trees/5/p2.jpg?X-Amz-SignedHeaders=host");
    when(galleryService.findVisiblePhotos(eq(5L), org.mockito.ArgumentMatchers.any()))
        .thenReturn(List.of(buildPhoto(10L, true, 0), buildPhoto(11L, false, 1)));

    JwtAuthenticationToken authentication = collaboratorAuthentication();

    mockMvc
        .perform(withJwtPrincipal(get("/api/media/trees/5/photos"), authentication))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(10))
        .andExpect(
            jsonPath("$[0].url")
                .value("http://localhost:9000/mtl-photos/trees/5/p1.jpg?X-Amz-SignedHeaders=host"))
        .andExpect(jsonPath("$[0].esPrincipal").value(true))
        .andExpect(jsonPath("$[0].categoria").value("PUBLIC"))
        .andExpect(jsonPath("$[1].id").value(11))
        .andExpect(jsonPath("$[1].orden").value(1));
  }

  @Test
  void findByTreeId_withoutPhotos_returnsEmptyArray() throws Exception {
    when(galleryService.findVisiblePhotos(eq(7L), org.mockito.ArgumentMatchers.any()))
        .thenReturn(List.of());

    JwtAuthenticationToken authentication = collaboratorAuthentication();

    mockMvc
        .perform(withJwtPrincipal(get("/api/media/trees/7/photos"), authentication))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));
  }

  private static Fotografia buildPhoto(Long id, boolean principal, int orden) {
    Fotografia photo = new Fotografia();
    photo.setFotografiaId(id);
    photo.setBucketAlmacenamiento("mtl-photos");
    photo.setClaveObjeto("trees/5/p" + (orden + 1) + ".jpg");
    photo.setEsPrincipal(principal);
    photo.setOrden(orden);
    photo.setTipoMime("image/jpeg");
    photo.setAnchoPx(1200);
    photo.setAltoPx(800);
    photo.setCategoria(CategoriaFotografia.PUBLIC);
    return photo;
  }
}
