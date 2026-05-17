package com.mtl.catalog.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.UsuarioAppRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.FlushModeType;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@ExtendWith(MockitoExtension.class)
class CatalogUsuarioAppAuditorAwareTest {

  @Mock private UsuarioAppRepository usuarioAppRepository;
  @Mock private EntityManager entityManager;

  @InjectMocks private CatalogUsuarioAppAuditorAware auditorAware;

  @BeforeEach
  @AfterEach
  void resetAuditorAndSecurityContext() {
    CatalogAuditorContext.clear();
    org.springframework.security.core.context.SecurityContextHolder.clearContext();
  }

  @Test
  void getCurrentAuditor_returnsBoundIdWithoutQueryingRepository() {
    CatalogAuditorContext.bindUsuarioAppId(99L);

    Optional<Long> auditor = auditorAware.getCurrentAuditor();

    assertThat(auditor).contains(99L);
    verify(usuarioAppRepository, never()).findBySubjectOidc(org.mockito.ArgumentMatchers.any());
  }

  @Test
  void getCurrentAuditor_resolvesSubjectFromJwtAuthenticationToken() {
    assertThat(CatalogAuditorContext.currentUsuarioAppId()).isEmpty();
    when(entityManager.getFlushMode()).thenReturn(FlushModeType.AUTO);
    UsuarioApp usuario = new UsuarioApp();
    usuario.setId(7L);
    when(usuarioAppRepository.findBySubjectOidc("sub-1")).thenReturn(Optional.of(usuario));

    Jwt jwt =
        Jwt.withTokenValue("t")
            .header("alg", "none")
            .subject("sub-1")
            .build();
    org.springframework.security.core.context.SecurityContextHolder.getContext()
        .setAuthentication(
            new JwtAuthenticationToken(
                jwt, List.of(new SimpleGrantedAuthority("ROLE_COLABORADOR"))));

    Optional<Long> auditor = auditorAware.getCurrentAuditor();

    assertThat(auditor).contains(7L);
    verify(usuarioAppRepository).findBySubjectOidc("sub-1");
  }
}
