package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.mtl.catalog.config.CatalogAuditorContext;
import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.UsuarioAppRepository;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

@ExtendWith(MockitoExtension.class)
class UsuarioAppMaterializationServiceTest {

  @Mock private UsuarioAppRepository usuarioAppRepository;
  @InjectMocks private UsuarioAppMaterializationService service;

  @AfterEach
  void clearAuditorContext() {
    CatalogAuditorContext.clear();
  }

  @Test
  void materialize_usuarioConcurrente_recuperaTrasDataIntegrityViolation() {
    UsuarioApp existing = usuario(7L, "kc-sub-race");
    when(usuarioAppRepository.findBySubjectOidc("kc-sub-race"))
        .thenReturn(Optional.empty())
        .thenReturn(Optional.of(existing));
    AtomicInteger usuarioSaves = new AtomicInteger();
    when(usuarioAppRepository.save(any(UsuarioApp.class)))
        .thenAnswer(
            inv -> {
              if (usuarioSaves.getAndIncrement() == 0) {
                throw new DataIntegrityViolationException("duplicate key");
              }
              return inv.getArgument(0);
            });

    UsuarioApp result =
        service.materialize(new OidcUserProfile("kc-sub-race", "e@test.com", "Dev"));

    assertThat(result.getId()).isEqualTo(7L);
  }

  private static UsuarioApp usuario(Long id, String subject) {
    UsuarioApp u = new UsuarioApp();
    u.setId(id);
    u.setSubjectOidc(subject);
    return u;
  }
}
