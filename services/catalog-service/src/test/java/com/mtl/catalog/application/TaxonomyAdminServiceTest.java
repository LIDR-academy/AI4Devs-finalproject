package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.domain.Especie;
import com.mtl.catalog.domain.Familia;
import com.mtl.catalog.domain.Genero;
import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.dto.CreateTaxonomyFamilyRequest;
import com.mtl.catalog.dto.CreateTaxonomyGenusRequest;
import com.mtl.catalog.dto.CreateTaxonomySpeciesRequest;
import com.mtl.catalog.dto.TaxonomyFamilyResponse;
import com.mtl.catalog.dto.TaxonomyGenusResponse;
import com.mtl.catalog.dto.TaxonomySpeciesResponse;
import com.mtl.catalog.dto.UpdateTaxonomySpeciesRequest;
import com.mtl.catalog.exception.CatalogConflictException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ArbolRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.FamiliaRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.GeneroRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class TaxonomyAdminServiceTest {

  @Mock private FamiliaRepository familiaRepository;
  @Mock private GeneroRepository generoRepository;
  @Mock private EspecieRepository especieRepository;
  @Mock private ArbolRepository arbolRepository;
  @Mock private UsuarioAppMaterializationService usuarioAppMaterializationService;
  @Mock private CatalogAuditService catalogAuditService;

  @InjectMocks private TaxonomyAdminService service;

  private Jwt jwt;
  private UsuarioApp actor;

  @BeforeEach
  void setUp() {
    jwt = Jwt.withTokenValue("t").header("alg", "none").subject("admin").build();
    actor = actor(1L);
    lenient().when(usuarioAppMaterializationService.materialize(any())).thenReturn(actor);
  }

  @Test
  void createFamily_persisteYRegistraAuditoria() {
    when(familiaRepository.save(any(Familia.class)))
        .thenAnswer(
            inv -> {
              Familia f = inv.getArgument(0);
              f.setId(11L);
              return f;
            });

    TaxonomyFamilyResponse response =
        service.createFamily(new CreateTaxonomyFamilyRequest("Pinaceae", "Pinos"), jwt);

    assertThat(response.familyId()).isEqualTo(11L);
    assertThat(response.scientificName()).isEqualTo("Pinaceae");
    assertThat(response.commonName()).isEqualTo("Pinos");
    assertThat(response.label()).isEqualTo("Pinos (Pinaceae)");

    ArgumentCaptor<Familia> captor = ArgumentCaptor.forClass(Familia.class);
    verify(familiaRepository).save(captor.capture());
    assertThat(captor.getValue().getCreadoPor()).isEqualTo(1L);
    verify(catalogAuditService)
        .recordFamilyCreated(eq(1L), startsWith("familia_id=11 nombre_cientifico=Pinaceae"));
  }

  @Test
  void createGenus_persisteYRegistraAuditoria() {
    Familia familia = family(5L);
    when(familiaRepository.findById(5L)).thenReturn(Optional.of(familia));
    when(generoRepository.save(any(Genero.class)))
        .thenAnswer(
            inv -> {
              Genero g = inv.getArgument(0);
              g.setId(22L);
              return g;
            });

    TaxonomyGenusResponse response =
        service.createGenus(new CreateTaxonomyGenusRequest(5L, "Pinus", "Pino"), jwt);

    assertThat(response.genusId()).isEqualTo(22L);
    assertThat(response.familyId()).isEqualTo(5L);
    assertThat(response.label()).isEqualTo("Pino (Pinus)");

    verify(catalogAuditService)
        .recordGenusCreated(
            eq(1L), startsWith("genero_id=22 familia_id=5 nombre_cientifico=Pinus"));
  }

  @Test
  void createFamily_nombreCientificoNuloOEnBlanco_lanzaValidation() {
    assertThatThrownBy(() -> service.createFamily(new CreateTaxonomyFamilyRequest(null, null), jwt))
        .isInstanceOf(CatalogValidationException.class)
        .hasMessageContaining("nombre científico");

    assertThatThrownBy(
            () -> service.createFamily(new CreateTaxonomyFamilyRequest("   ", null), jwt))
        .isInstanceOf(CatalogValidationException.class)
        .hasMessageContaining("nombre científico");

    verify(familiaRepository, never()).save(any());
  }

  @Test
  void createGenus_familiaInexistente_lanzaNotFound() {
    when(familiaRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(
            () -> service.createGenus(new CreateTaxonomyGenusRequest(99L, "Pinus", null), jwt))
        .isInstanceOf(CatalogNotFoundException.class);

    verify(generoRepository, never()).save(any());
  }

  @Test
  void createSpecies_persisteYRegistraAuditoria() {
    Genero genero = genus(2L, family(1L));
    when(generoRepository.findById(2L)).thenReturn(Optional.of(genero));
    when(especieRepository.save(any(Especie.class)))
        .thenAnswer(
            inv -> {
              Especie e = inv.getArgument(0);
              e.setId(33L);
              return e;
            });

    TaxonomySpeciesResponse response =
        service.createSpecies(
            new CreateTaxonomySpeciesRequest(2L, "Quercus ilex", "Encina"), jwt);

    assertThat(response.speciesId()).isEqualTo(33L);
    assertThat(response.genusId()).isEqualTo(2L);
    assertThat(response.label()).isEqualTo("Encina (Quercus ilex)");

    verify(catalogAuditService)
        .recordSpeciesCreated(
            eq(1L), eq("especie_id=33 genero_id=2 nombre_cientifico=Quercus ilex"));
  }

  @Test
  void createSpecies_generoInexistente_lanzaNotFound() {
    when(generoRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(
            () ->
                service.createSpecies(
                    new CreateTaxonomySpeciesRequest(99L, "Quercus ilex", "Encina"), jwt))
        .isInstanceOf(CatalogNotFoundException.class);
  }

  @Test
  void updateSpecies_modificaYRegistraAuditoria() {
    Familia familia = family(1L);
    Genero generoPrevio = genus(2L, familia);
    Genero generoNuevo = genus(3L, familia);
    Especie especie = species(9L, generoPrevio);
    when(especieRepository.findById(9L)).thenReturn(Optional.of(especie));
    when(generoRepository.findById(3L)).thenReturn(Optional.of(generoNuevo));
    when(especieRepository.save(any(Especie.class))).thenAnswer(inv -> inv.getArgument(0));

    TaxonomySpeciesResponse response =
        service.updateSpecies(
            9L, new UpdateTaxonomySpeciesRequest(3L, "Quercus robur", "Roble común"), jwt);

    assertThat(response.genusId()).isEqualTo(3L);
    assertThat(response.scientificName()).isEqualTo("Quercus robur");
    assertThat(response.commonName()).isEqualTo("Roble común");

    verify(catalogAuditService)
        .recordSpeciesModified(
            eq(1L),
            eq("especie_id=9 genero_id=2 nombre_cientifico=Quercus ilex"),
            eq("especie_id=9 genero_id=3 nombre_cientifico=Quercus robur"));
  }

  @Test
  void deleteSpecies_sinArbolesReferenciados_eliminaYRegistraAuditoria() {
    Especie especie = species(9L, genus(2L, family(1L)));
    when(especieRepository.findById(9L)).thenReturn(Optional.of(especie));
    when(arbolRepository.existsByEspecieId(9L)).thenReturn(false);

    service.deleteSpecies(9L, jwt);

    verify(especieRepository).delete(especie);
    verify(catalogAuditService)
        .recordSpeciesDeleted(
            eq(1L), eq("especie_id=9 genero_id=2 nombre_cientifico=Quercus ilex"));
  }

  @Test
  void deleteSpecies_conArbolReferenciado_lanzaConflict() {
    Especie especie = species(9L, genus(2L, family(1L)));
    when(especieRepository.findById(9L)).thenReturn(Optional.of(especie));
    when(arbolRepository.existsByEspecieId(9L)).thenReturn(true);

    assertThatThrownBy(() -> service.deleteSpecies(9L, jwt))
        .isInstanceOf(CatalogConflictException.class);

    verify(especieRepository, never()).delete(any());
    verify(catalogAuditService, never()).recordSpeciesDeleted(anyLong(), any());
  }

  @Test
  void getSpecies_existente_devuelveDetalle() {
    Especie especie = species(9L, genus(2L, family(1L)));
    when(especieRepository.findById(9L)).thenReturn(Optional.of(especie));

    TaxonomySpeciesResponse response = service.getSpecies(9L);

    assertThat(response.speciesId()).isEqualTo(9L);
    assertThat(response.label()).isEqualTo("Encina (Quercus ilex)");
  }

  private static UsuarioApp actor(long id) {
    UsuarioApp u = new UsuarioApp();
    u.setId(id);
    return u;
  }

  private static Familia family(long id) {
    Familia f = new Familia();
    f.setId(id);
    f.setNombreCientifico("Fagaceae");
    return f;
  }

  private static Genero genus(long id, Familia familia) {
    Genero g = new Genero();
    g.setId(id);
    g.setFamilia(familia);
    g.setNombreCientifico("Quercus");
    return g;
  }

  private static Especie species(long id, Genero genero) {
    Especie e = new Especie();
    e.setId(id);
    e.setGenero(genero);
    e.setNombreCientifico("Quercus ilex");
    e.setNombreComun("Encina");
    return e;
  }
}
