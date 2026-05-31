package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.dto.CreateEjemplarRequest;
import com.mtl.catalog.exception.CatalogValidationException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Collections;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class EjemplarRegistrationServiceTest {

  @Mock private EjemplarCreationService treeCreationService;
  @Mock private CatalogAuditService catalogAuditService;
  @Mock private AfterCommitTaskRegistrar afterCommitTaskRegistrar;
  @Mock private EjemplarCreadoEventPublisher ejemplarCreadoEventPublisher;

  @InjectMocks private EjemplarRegistrationService service;

  @BeforeEach
  void ejecutaTareaTrasCommitDeInmediatoEnTests() {
    lenient()
        .doAnswer(
            inv -> {
              inv.getArgument(0, Runnable.class).run();
              return null;
            })
        .when(afterCommitTaskRegistrar)
        .runAfterCommit(any(Runnable.class));
  }

  @Test
  void register_sinEmailEnToken_rechazaSinAuditoria() {
    Jwt jwt =
        Jwt.withTokenValue("dummy.jwt.value")
            .headers(h -> h.put("alg", "none"))
            .issuer("http://localhost:8180/realms/mtl")
            .subject("s1")
            .audience(Collections.singletonList("account"))
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .claim("name", "Sin Mail")
            .build();

    CreateEjemplarRequest req =
        new CreateEjemplarRequest(1L, 2L, BigDecimal.ONE, BigDecimal.ONE, null, null, null, null, null);

    assertThatThrownBy(() -> service.register(req, jwt))
        .isInstanceOf(CatalogValidationException.class)
        .hasMessageContaining("correo");
  }

  @Test
  void register_exito_llamaAuditoria() {
    Jwt jwt =
        Jwt.withTokenValue("dummy.jwt.value")
            .headers(h -> h.put("alg", "none"))
            .issuer("http://localhost:8180/realms/mtl")
            .subject("s1")
            .audience(Collections.singletonList("account"))
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .claim("email", "a@b.co")
            .claim("name", "User")
            .build();

    CreateEjemplarRequest req =
        new CreateEjemplarRequest(10L, 28L, new BigDecimal("1"), new BigDecimal("2"), null, null, null, null, null);

    OffsetDateTime ocurrido = OffsetDateTime.parse("2024-06-01T10:15:30Z");
    when(treeCreationService.create(any(CreateEjemplarCommand.class)))
        .thenReturn(new CreatedEjemplarResult(100L, 5L, ocurrido));

    CreatedEjemplarResult out = service.register(req, jwt);

    org.assertj.core.api.Assertions.assertThat(out.treeId()).isEqualTo(100L);
    verify(catalogAuditService).recordEjemplarCreated(eq(5L), eq(100L), eq(10L), eq(28L));
    verify(ejemplarCreadoEventPublisher).publishEjemplarCreado(eq(100L), eq(ocurrido));
  }
}
