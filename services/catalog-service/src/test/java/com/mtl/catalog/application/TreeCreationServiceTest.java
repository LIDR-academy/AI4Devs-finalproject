package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.domain.Arbol;
import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ArbolRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ProvinciaReadRepository;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import java.math.BigDecimal;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TreeCreationServiceTest {

  @Mock private UsuarioAppMaterializationService usuarioAppMaterializationService;
  @Mock private EspecieRepository especieRepository;
  @Mock private ProvinciaReadRepository provinciaReadRepository;
  @Mock private ArbolRepository arbolRepository;

  @InjectMocks private TreeCreationService service;

  @Test
  void create_persisteArbolConCreadorYMaestrosValidos() {
    when(especieRepository.existsById(10L)).thenReturn(true);
    when(provinciaReadRepository.existsById(28L)).thenReturn(true);
    UsuarioApp user = usuario(5L, "kc-sub-1");
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class))).thenReturn(user);
    when(arbolRepository.save(any(Arbol.class)))
        .thenAnswer(
            inv -> {
              Arbol a = inv.getArgument(0);
              mimicJpaAuditingOnSave(a);
              a.setId(100L);
              return a;
            });

    CreatedTreeResult result =
        service.create(
            new CreateTreeCommand(
                "kc-sub-1",
                10L,
                28L,
                new BigDecimal("40.4168"),
                new BigDecimal("-3.7038"),
                "a@b.co",
                "Dev User",
                " Madrid ",
                "Nota",
                600,
                "publico",
                "publicado"));

    assertThat(result.arbolId()).isEqualTo(100L);
    assertThat(result.actorUsuarioAppId()).isEqualTo(5L);
    assertThat(result.ocurridoEn()).isNotNull();
    ArgumentCaptor<Arbol> arbolCaptor = ArgumentCaptor.forClass(Arbol.class);
    verify(arbolRepository).save(arbolCaptor.capture());
    Arbol saved = arbolCaptor.getValue();
    assertThat(result.ocurridoEn()).isEqualTo(saved.getCreadoEn());
    assertThat(saved.getEspecieId()).isEqualTo(10L);
    assertThat(saved.getProvinciaId()).isEqualTo(28L);
    assertThat(saved.getUsuarioAppId()).isEqualTo(5L);
    assertThat(saved.getCreadoPor()).isEqualTo(5L);
    assertThat(saved.getModificadoPor()).isEqualTo(5L);
    assertThat(saved.getMunicipio()).isEqualTo("Madrid");
    assertThat(saved.getDescripcion()).isEqualTo("Nota");
    assertThat(saved.getAltitud()).isEqualTo(600);
    assertThat(saved.getVisibilidadMapaPublico()).isEqualTo("PUBLICO");
    assertThat(saved.getEstadoPublicacion()).isEqualTo("PUBLICADO");
  }

  @Test
  void create_sinEspecie_rechaza() {
    when(especieRepository.existsById(1L)).thenReturn(false);

    assertThatThrownBy(() -> baseCommand().withEspecie(1L).buildAndCreate())
        .isInstanceOf(CatalogValidationException.class)
        .hasMessageContaining("especie");
  }

  @Test
  void create_sinProvincia_rechaza() {
    when(especieRepository.existsById(10L)).thenReturn(true);
    when(provinciaReadRepository.existsById(99L)).thenReturn(false);

    assertThatThrownBy(() -> baseCommand().withProvincia(99L).buildAndCreate())
        .isInstanceOf(CatalogValidationException.class)
        .hasMessageContaining("provincia");
  }

  @Test
  void create_sinEmail_rechaza() {
    when(especieRepository.existsById(10L)).thenReturn(true);
    when(provinciaReadRepository.existsById(28L)).thenReturn(true);
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenThrow(
            new CatalogValidationException(
                "Se requiere correo electrónico en el token para crear el usuario de aplicación."));

    assertThatThrownBy(
            () ->
                service.create(
                    new CreateTreeCommand(
                        "sub",
                        10L,
                        28L,
                        new BigDecimal("40.0"),
                        new BigDecimal("-3.0"),
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null)))
        .isInstanceOf(CatalogValidationException.class)
        .hasMessageContaining("correo");
  }

  @Test
  void create_latitudFueraDeRango_rechaza() {
    assertThatThrownBy(
            () ->
                service.create(
                    new CreateTreeCommand(
                        "sub",
                        1L,
                        1L,
                        new BigDecimal("91"),
                        BigDecimal.ZERO,
                        "a@b.co",
                        null,
                        null,
                        null,
                        null,
                        null,
                        null)))
        .isInstanceOf(CatalogValidationException.class)
        .hasMessageContaining("latitud");
  }

  @Test
  void create_longitudFueraDeRango_rechaza() {
    assertThatThrownBy(
            () ->
                service.create(
                    new CreateTreeCommand(
                        "sub",
                        1L,
                        1L,
                        BigDecimal.ZERO,
                        new BigDecimal("-181"),
                        "a@b.co",
                        null,
                        null,
                        null,
                        null,
                        null,
                        null)))
        .isInstanceOf(CatalogValidationException.class)
        .hasMessageContaining("longitud");
  }

  @Test
  void create_visibilidadMapaInvalida_rechaza() {
    when(especieRepository.existsById(10L)).thenReturn(true);
    when(provinciaReadRepository.existsById(28L)).thenReturn(true);
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuario(5L, "sub"));

    assertThatThrownBy(
            () ->
                service.create(
                    new CreateTreeCommand(
                        "sub",
                        10L,
                        28L,
                        new BigDecimal("40.0"),
                        new BigDecimal("-3.0"),
                        "e@test.com",
                        null,
                        null,
                        null,
                        null,
                        "VISIBLE",
                        "BORRADOR")))
        .isInstanceOf(CatalogValidationException.class)
        .hasMessageContaining("publicMapVisibility");
  }

  @Test
  void create_estadoPublicacionInvalido_rechaza() {
    when(especieRepository.existsById(10L)).thenReturn(true);
    when(provinciaReadRepository.existsById(28L)).thenReturn(true);
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuario(5L, "sub"));

    assertThatThrownBy(
            () ->
                service.create(
                    new CreateTreeCommand(
                        "sub",
                        10L,
                        28L,
                        new BigDecimal("40.0"),
                        new BigDecimal("-3.0"),
                        "e@test.com",
                        null,
                        null,
                        null,
                        null,
                        "PRIVADO",
                        "EN_REVISION")))
        .isInstanceOf(CatalogValidationException.class)
        .hasMessageContaining("publicationState");
  }

  @Test
  void create_subjectVacio_rechaza() {
    assertThatThrownBy(() -> baseCommand().withSubject("  ").buildAndCreate())
        .isInstanceOf(CatalogValidationException.class)
        .hasMessageContaining("subject");
  }

  private static UsuarioApp usuario(Long id, String subject) {
    UsuarioApp u = new UsuarioApp();
    u.setId(id);
    u.setSubjectOidc(subject);
    return u;
  }

  /**
   * {@link TreeCreationServiceTest} usa repositorio mockeado: Spring Data JPA no ejecuta
   * {@link org.springframework.data.jpa.domain.support.AuditingEntityListener}; se simulan los
   * campos que rellenaría el listener en persistencia real.
   */
  private static void mimicJpaAuditingOnSave(Arbol a) {
    if (a.getCreadoEn() != null) {
      return;
    }
    Instant now = Instant.now();
    a.setCreadoEn(now);
    a.setModificadoEn(now);
    Long actor = a.getUsuarioAppId();
    a.setCreadoPor(actor);
    a.setModificadoPor(actor);
  }

  private CommandBuilder baseCommand() {
    return new CommandBuilder(service);
  }

  private static final class CommandBuilder {
    private final TreeCreationService service;
    private String subject = "sub";
    private Long especie = 10L;
    private Long provincia = 28L;

    CommandBuilder(TreeCreationService service) {
      this.service = service;
    }

    CommandBuilder withEspecie(Long id) {
      this.especie = id;
      return this;
    }

    CommandBuilder withProvincia(Long id) {
      this.provincia = id;
      return this;
    }

    CommandBuilder withSubject(String s) {
      this.subject = s;
      return this;
    }

    CreatedTreeResult buildAndCreate() {
      return service.create(
          new CreateTreeCommand(
              subject,
              especie,
              provincia,
              new BigDecimal("40.0"),
              new BigDecimal("-3.0"),
              "e@test.com",
              null,
              null,
              null,
              null,
              null,
              null));
    }
  }
}
