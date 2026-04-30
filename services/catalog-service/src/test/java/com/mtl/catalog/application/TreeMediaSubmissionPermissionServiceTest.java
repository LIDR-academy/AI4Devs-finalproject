package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.mtl.catalog.domain.Arbol;
import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.dto.MediaSubmissionPermissionResponse;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ArbolRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.UsuarioAppRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class TreeMediaSubmissionPermissionServiceTest {

  @Mock private ArbolRepository arbolRepository;
  @Mock private UsuarioAppRepository usuarioAppRepository;

  @InjectMocks private TreeMediaSubmissionPermissionService service;

  @Test
  void arbolInexistente_lanza404() {
    when(arbolRepository.findById(9L)).thenReturn(Optional.empty());
    Jwt jwt = jwt("sub-x", "COLABORADOR");
    assertThrows(CatalogNotFoundException.class, () -> service.resolve(9L, jwt));
  }

  @Test
  void colaboradorSinUsuarioApp_lanza403() {
    Arbol arbol = new Arbol();
    arbol.setId(1L);
    arbol.setUsuarioAppId(5L);
    when(arbolRepository.findById(1L)).thenReturn(Optional.of(arbol));
    when(usuarioAppRepository.findBySubjectOidc("sub-1")).thenReturn(Optional.empty());
    Jwt jwt = jwt("sub-1", "COLABORADOR");
    assertThrows(CatalogForbiddenException.class, () -> service.resolve(1L, jwt));
  }

  @Test
  void adminConUsuarioApp_permiteConActor() {
    Arbol arbol = new Arbol();
    arbol.setId(2L);
    arbol.setUsuarioAppId(99L);
    when(arbolRepository.findById(2L)).thenReturn(Optional.of(arbol));
    UsuarioApp admin = usuario(7L, "admin-sub");
    when(usuarioAppRepository.findBySubjectOidc("admin-sub")).thenReturn(Optional.of(admin));
    Jwt jwt = jwt("admin-sub", "ADMIN");

    MediaSubmissionPermissionResponse res = service.resolve(2L, jwt);
    assertThat(res.treeId()).isEqualTo(2L);
    assertThat(res.actorUsuarioAppId()).isEqualTo(7L);
  }

  @Test
  void colaboradorPropietario_permite() {
    Arbol arbol = new Arbol();
    arbol.setId(3L);
    arbol.setUsuarioAppId(10L);
    when(arbolRepository.findById(3L)).thenReturn(Optional.of(arbol));
    UsuarioApp actor = usuario(10L, "kc-sub");
    when(usuarioAppRepository.findBySubjectOidc("kc-sub")).thenReturn(Optional.of(actor));
    Jwt jwt = jwt("kc-sub", "COLABORADOR");

    MediaSubmissionPermissionResponse res = service.resolve(3L, jwt);
    assertThat(res.actorUsuarioAppId()).isEqualTo(10L);
  }

  @Test
  void colaboradorNoPropietario_lanza403() {
    Arbol arbol = new Arbol();
    arbol.setId(4L);
    arbol.setUsuarioAppId(10L);
    when(arbolRepository.findById(4L)).thenReturn(Optional.of(arbol));
    UsuarioApp actor = usuario(11L, "otro-sub");
    when(usuarioAppRepository.findBySubjectOidc("otro-sub")).thenReturn(Optional.of(actor));
    Jwt jwt = jwt("otro-sub", "COLABORADOR");

    assertThrows(CatalogForbiddenException.class, () -> service.resolve(4L, jwt));
  }

  @Test
  void visitanteSinRolesRelevantes_lanza403() {
    Arbol arbol = new Arbol();
    arbol.setId(5L);
    arbol.setUsuarioAppId(10L);
    when(arbolRepository.findById(5L)).thenReturn(Optional.of(arbol));
    UsuarioApp actor = usuario(10L, "visit-sub");
    when(usuarioAppRepository.findBySubjectOidc("visit-sub")).thenReturn(Optional.of(actor));
    Jwt jwt = jwt("visit-sub", "VISITANTE");

    assertThrows(CatalogForbiddenException.class, () -> service.resolve(5L, jwt));
  }

  private static UsuarioApp usuario(long id, String subject) {
    UsuarioApp u = new UsuarioApp();
    u.setId(id);
    u.setSubjectOidc(subject);
    u.setCreadoEn(Instant.parse("2024-01-01T00:00:00Z"));
    return u;
  }

  private static Jwt jwt(String subject, String... roles) {
    return Jwt.withTokenValue("t")
        .header("alg", "none")
        .issuer("http://localhost:8180/realms/mtl")
        .subject(subject)
        .issuedAt(Instant.now())
        .expiresAt(Instant.now().plusSeconds(3600))
        .claim("realm_access", Map.of("roles", List.of(roles)))
        .build();
  }
}
