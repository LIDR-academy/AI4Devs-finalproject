package com.mtl.catalog.application;

import com.mtl.catalog.config.CatalogCacheConfig;
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
import com.mtl.catalog.util.OidcUserProfileExtractor;
import com.mtl.catalog.util.SpeciesLabelFormatter;
import java.time.Instant;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaxonomyAdminService {

  private final FamiliaRepository familiaRepository;
  private final GeneroRepository generoRepository;
  private final EspecieRepository especieRepository;
  private final ArbolRepository arbolRepository;
  private final UsuarioAppMaterializationService usuarioAppMaterializationService;
  private final CatalogAuditService catalogAuditService;

  public TaxonomyAdminService(
      FamiliaRepository familiaRepository,
      GeneroRepository generoRepository,
      EspecieRepository especieRepository,
      ArbolRepository arbolRepository,
      UsuarioAppMaterializationService usuarioAppMaterializationService,
      CatalogAuditService catalogAuditService) {
    this.familiaRepository = familiaRepository;
    this.generoRepository = generoRepository;
    this.especieRepository = especieRepository;
    this.arbolRepository = arbolRepository;
    this.usuarioAppMaterializationService = usuarioAppMaterializationService;
    this.catalogAuditService = catalogAuditService;
  }

  @Transactional(readOnly = true)
  public TaxonomySpeciesResponse getSpecies(long speciesId) {
    Especie especie =
        especieRepository
            .findById(speciesId)
            .orElseThrow(() -> new CatalogNotFoundException("No existe la especie indicada."));
    return toSpeciesResponse(especie);
  }

  @Transactional
  public TaxonomyFamilyResponse createFamily(CreateTaxonomyFamilyRequest request, Jwt jwt) {
    UsuarioApp actor = resolveActor(jwt);
    Instant now = Instant.now();
    Familia familia = new Familia();
    familia.setNombreCientifico(normalizeRequired(request.scientificName()));
    familia.setNombreComun(normalizeOptional(request.commonName()));
    familia.setCreadoEn(now);
    familia.setModificadoEn(now);
    familia.setCreadoPor(actor.getId());
    familia.setModificadoPor(actor.getId());
    Familia saved = familiaRepository.save(familia);
    String resumen =
        "familia_id=%d nombre_cientifico=%s"
            .formatted(saved.getId(), saved.getNombreCientifico());
    catalogAuditService.recordFamilyCreated(actor.getId(), resumen);
    return toFamilyResponse(saved);
  }

  @Transactional
  public TaxonomyGenusResponse createGenus(CreateTaxonomyGenusRequest request, Jwt jwt) {
    UsuarioApp actor = resolveActor(jwt);
    Familia familia =
        familiaRepository
            .findById(request.familyId())
            .orElseThrow(() -> new CatalogNotFoundException("No existe la familia indicada."));
    Instant now = Instant.now();
    Genero genero = new Genero();
    genero.setFamilia(familia);
    genero.setNombreCientifico(normalizeRequired(request.scientificName()));
    genero.setNombreComun(normalizeOptional(request.commonName()));
    genero.setCreadoEn(now);
    genero.setModificadoEn(now);
    genero.setCreadoPor(actor.getId());
    genero.setModificadoPor(actor.getId());
    Genero saved = generoRepository.save(genero);
    String resumen =
        "genero_id=%d familia_id=%d nombre_cientifico=%s"
            .formatted(saved.getId(), familia.getId(), saved.getNombreCientifico());
    catalogAuditService.recordGenusCreated(actor.getId(), resumen);
    return toGenusResponse(saved);
  }

  @Transactional
  @CacheEvict(cacheNames = CatalogCacheConfig.CACHE_SPECIES_UNPAGED, allEntries = true)
  public TaxonomySpeciesResponse createSpecies(CreateTaxonomySpeciesRequest request, Jwt jwt) {
    UsuarioApp actor = resolveActor(jwt);
    Genero genero =
        generoRepository
            .findById(request.genusId())
            .orElseThrow(() -> new CatalogNotFoundException("No existe el género indicado."));
    Especie saved = persistNewSpecies(request, genero, actor);
    catalogAuditService.recordSpeciesCreated(actor.getId(), speciesAuditSummary(saved));
    return toSpeciesResponse(saved);
  }

  @Transactional
  @CacheEvict(cacheNames = CatalogCacheConfig.CACHE_SPECIES_UNPAGED, allEntries = true)
  public TaxonomySpeciesResponse updateSpecies(
      long speciesId, UpdateTaxonomySpeciesRequest request, Jwt jwt) {
    UsuarioApp actor = resolveActor(jwt);
    Especie especie =
        especieRepository
            .findById(speciesId)
            .orElseThrow(() -> new CatalogNotFoundException("No existe la especie indicada."));
    String previo = speciesAuditSummary(especie);
    Genero genero =
        generoRepository
            .findById(request.genusId())
            .orElseThrow(() -> new CatalogNotFoundException("No existe el género indicado."));
    especie.setGenero(genero);
    especie.setNombreCientifico(normalizeRequired(request.scientificName()));
    especie.setNombreComun(normalizeOptional(request.commonName()));
    especie.setModificadoEn(Instant.now());
    especie.setModificadoPor(actor.getId());
    Especie saved = especieRepository.save(especie);
    catalogAuditService.recordSpeciesModified(
        actor.getId(), previo, speciesAuditSummary(saved));
    return toSpeciesResponse(saved);
  }

  @Transactional
  @CacheEvict(cacheNames = CatalogCacheConfig.CACHE_SPECIES_UNPAGED, allEntries = true)
  public void deleteSpecies(long speciesId, Jwt jwt) {
    UsuarioApp actor = resolveActor(jwt);
    Especie especie =
        especieRepository
            .findById(speciesId)
            .orElseThrow(() -> new CatalogNotFoundException("No existe la especie indicada."));
    if (arbolRepository.existsByEspecieId(speciesId)) {
      throw new CatalogConflictException(
          "No se puede eliminar la especie porque existen fichas de árbol que la referencian.");
    }
    String resumen = speciesAuditSummary(especie);
    especieRepository.delete(especie);
    catalogAuditService.recordSpeciesDeleted(actor.getId(), resumen);
  }

  private Especie persistNewSpecies(
      CreateTaxonomySpeciesRequest request, Genero genero, UsuarioApp actor) {
    Instant now = Instant.now();
    Especie especie = new Especie();
    especie.setGenero(genero);
    especie.setNombreCientifico(normalizeRequired(request.scientificName()));
    especie.setNombreComun(normalizeOptional(request.commonName()));
    especie.setCreadoEn(now);
    especie.setModificadoEn(now);
    especie.setCreadoPor(actor.getId());
    especie.setModificadoPor(actor.getId());
    return especieRepository.save(especie);
  }

  private UsuarioApp resolveActor(Jwt jwt) {
    return usuarioAppMaterializationService.materialize(OidcUserProfileExtractor.extract(jwt));
  }

  private static String normalizeRequired(String value) {
    if (value == null) {
      throw new CatalogValidationException("Se requiere el nombre científico.");
    }
    String trimmed = value.trim();
    if (trimmed.isEmpty()) {
      throw new CatalogValidationException("Se requiere el nombre científico.");
    }
    return trimmed;
  }

  private static String normalizeOptional(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }

  private static String speciesAuditSummary(Especie especie) {
    return "especie_id=%d genero_id=%d nombre_cientifico=%s"
        .formatted(
            especie.getId(), especie.getGenero().getId(), especie.getNombreCientifico());
  }

  private static TaxonomyFamilyResponse toFamilyResponse(Familia familia) {
    return new TaxonomyFamilyResponse(
        familia.getId(),
        familia.getNombreCientifico(),
        familia.getNombreComun(),
        SpeciesLabelFormatter.format(familia.getNombreComun(), familia.getNombreCientifico()));
  }

  private static TaxonomyGenusResponse toGenusResponse(Genero genero) {
    return new TaxonomyGenusResponse(
        genero.getId(),
        genero.getFamilia().getId(),
        genero.getNombreCientifico(),
        genero.getNombreComun(),
        SpeciesLabelFormatter.format(genero.getNombreComun(), genero.getNombreCientifico()));
  }

  private static TaxonomySpeciesResponse toSpeciesResponse(Especie especie) {
    return new TaxonomySpeciesResponse(
        especie.getId(),
        especie.getGenero().getId(),
        especie.getNombreCientifico(),
        especie.getNombreComun(),
        SpeciesLabelFormatter.format(especie.getNombreComun(), especie.getNombreCientifico()));
  }
}
