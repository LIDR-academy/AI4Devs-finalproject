package com.mtl.media.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.media.application.MediaPublicPrimaryPhotoService;
import com.mtl.media.config.MediaJwtAuthenticationPrincipalTestMvcConfig;
import java.time.Instant;
import java.util.Collections;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.oauth2.server.resource.autoconfigure.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    controllers = MediaPublicPrimaryPhotoController.class,
    excludeAutoConfiguration = OAuth2ResourceServerAutoConfiguration.class)
@Import(MediaJwtAuthenticationPrincipalTestMvcConfig.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class MediaPublicPrimaryPhotoControllerWebMvcTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private MediaPublicPrimaryPhotoService primaryPhotoService;

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
  void getPrimaryPhoto_ok_returnsBytes() throws Exception {
    when(primaryPhotoService.loadPrimaryPhotoBytes(eq(5L), any()))
        .thenReturn(
            ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(new byte[] {(byte) 0xff, (byte) 0xd8}));

    JwtAuthenticationToken authentication = collaboratorAuthentication();

    mockMvc
        .perform(
            withJwtPrincipal(get("/api/media/public/ejemplares/5/primary-photo"), authentication))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.IMAGE_JPEG))
        .andExpect(content().bytes(new byte[] {(byte) 0xff, (byte) 0xd8}));
  }
}
