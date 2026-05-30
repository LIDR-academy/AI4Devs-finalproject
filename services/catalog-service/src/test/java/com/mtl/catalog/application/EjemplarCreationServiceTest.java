package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.domain.Ejemplar;
import com.mtl.catalog.domain.Especie;
import com.mtl.catalog.domain.EstadoPublicacion;
import com.mtl.catalog.domain.Provincia;
import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.domain.VisibilidadMapaPublico;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EjemplarRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ProvinciaReadRepository;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EjemplarCreationServiceTest {

  @Mock private UsuarioAppMaterializationService usuarioAppMaterializationService;
  @Mock private EspecieRepository especieRepository;
  @Mock private ProvinciaReadRepository provinciaReadRepository;
  @Mock private EjemplarRepository ejemplarRepository;

  @InjectMocks private EjemplarCreationService service;

  @Test
  void create_persisteArbolConCreadorYMaestrosValidos() {
    stubMaestros(10L, 28L);
    UsuarioApp user = usuario(5L, "kc-sub-1");
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class))).thenReturn(user);
    when(ejemplarRepository.save(any(Ejemplar.class)))
        .thenAnswer(
            inv -> {
              Ejemplar a = inv.getArgument(0);
              mimicJpaAuditingOnSave(a);
              a.setId(100L);
              return a;
            });

    CreatedEjemplarResult result =
        service.create(
            new CreateEjemplarCommand(
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

    assertThat(result.treeId()).isEqualTo(100L);
    assertThat(result.actorUsuarioAppId()).isEqualTo(5L);
    assertThat(result.ocurridoEn()).isNotNull();
    ArgumentCaptor<Ejemplar> ejemplarCaptor = ArgumentCaptor.forClass(Ejemplar.class);
    verify(ejemplarRepository).save(ejemplarCaptor.capture());
    Ejemplar saved = ejemplarCaptor.getValue();
    assertThat(result.ocurridoEn()).isEqualTo(saved.getCreadoEn());
    assertThat(saved.getEspecieId()).isEqualTo(10L);
    assertThat(saved.getProvinciaId()).isEqualTo(28L);
    assertThat(saved.getUsuarioAppId()).isEqualTo(5L);
    assertThat(saved.getCreadoPorId()).isEqualTo(5L);
    assertThat(saved.getModificadoPorId()).isEqualTo(5L);
    assertThat(saved.getMunicipio()).isEqualTo("Madrid");
    assertThat(saved.getDescripcion()).isEqualTo("Nota");
    assertThat(saved.getAltitud()).isEqualTo(600);
    assertThat(saved.getVisibilidadMapaPublico()).isEqualTo(VisibilidadMapaPublico.PUBLICO);
    assertThat(saved.getEstadoPublicacion()).isEqualTo(EstadoPublicacion.PUBLICADO);
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
                    new CreateEjemplarCommand(
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
                    new CreateEjemplarCommand(
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
                    new CreateEjemplarCommand(
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
    stubMaestros(10L, 28L);
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuario(5L, "sub"));

    assertThatThrownBy(
            () ->
                service.create(
                    new CreateEjemplarCommand(
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
    stubMaestros(10L, 28L);
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuario(5L, "sub"));

    assertThatThrownBy(
            () ->
                service.create(
                    new CreateEjemplarCommand(
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

  private void stubMaestros(long especieId, long provinciaId) {
    when(especieRepository.existsById(especieId)).thenReturn(true);
    when(provinciaReadRepository.existsById(provinciaId)).thenReturn(true);
    when(especieRepository.getReferenceById(especieId)).thenReturn(especieRef(especieId));
    when(provinciaReadRepository.getReferenceById(provinciaId)).thenReturn(provinciaRef(provinciaId));
  }

  private static Especie especieRef(long id) {
    Especie e = new Especie();
    e.setId(id);
    return e;
  }

  private static Provincia provinciaRef(long id) {
    Provincia p = new Provincia();
    p.setId(id);
    return p;
  }

  /**
   * {@link EjemplarCreationServiceTest} usa repositorio mockeado: Spring Data JPA no ejecuta
   * {@link org.springframework.data.jpa.domain.support.AuditingEntityListener}; se simulan los
   * campos que rellenaría el listener en persistencia real.
   */
  private static void mimicJpaAuditingOnSave(Ejemplar a) {
    if (a.getCreadoEn() != null) {
      return;
    }
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    a.setCreadoEn(now);
    a.setModificadoEn(now);
    UsuarioApp actor = a.getUsuarioApp();
    a.setCreadoPor(actor);
    a.setModificadoPor(actor);
  }

  private CommandBuilder baseCommand() {
    return new CommandBuilder(service);
  }

  private static final class CommandBuilder {
    private final EjemplarCreationService service;
    private String subject = "sub";
    private Long especie = 10L;
    private Long provincia = 28L;

    CommandBuilder(EjemplarCreationService service) {
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

    CreatedEjemplarResult buildAndCreate() {
      return service.create(
          new CreateEjemplarCommand(
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
