package com.mtl.catalog.application;

import com.mtl.catalog.config.CatalogCacheConfig;
import com.mtl.catalog.dto.MasterDataPageResponse;
import com.mtl.catalog.dto.ProvinceListItemDto;
import com.mtl.catalog.dto.PublicProvinceNamesResponse;
import com.mtl.catalog.dto.SpeciesListItemDto;
import com.mtl.catalog.dto.TaxonomyGenusListItemDto;
import com.mtl.catalog.dto.TaxonomyMasterListItemDto;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.FamiliaRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.GeneroRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ProvinciaReadRepository;
import java.util.List;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MasterDataQueryService {

  private final EspecieReadRepository especieReadRepository;
  private final ProvinciaReadRepository provinciaReadRepository;
  private final FamiliaRepository familiaRepository;
  private final GeneroRepository generoRepository;

  public MasterDataQueryService(
      EspecieReadRepository especieReadRepository,
      ProvinciaReadRepository provinciaReadRepository,
      FamiliaRepository familiaRepository,
      GeneroRepository generoRepository) {
    this.especieReadRepository = especieReadRepository;
    this.provinciaReadRepository = provinciaReadRepository;
    this.familiaRepository = familiaRepository;
    this.generoRepository = generoRepository;
  }

  @Transactional(readOnly = true)
  @Cacheable(
      cacheNames = CatalogCacheConfig.CACHE_SPECIES_UNPAGED,
      key = "'all'",
      condition = "#unpaged && (#q == null || #q.isBlank())")
  public MasterDataPageResponse<SpeciesListItemDto> listSpecies(
      int page, int size, String q, boolean unpaged) {
    Pageable pageable =
        unpaged
            ? PageRequest.of(0, EspecieRepository.MAX_UNPAGED)
            : PageRequest.of(page, size);
    Page<SpeciesListItemDto> result = especieReadRepository.search(q, pageable);
    return toResponse(result, page, size, unpaged);
  }

  @Transactional(readOnly = true)
  public MasterDataPageResponse<TaxonomyMasterListItemDto> listFamilies(
      int page, int size, String q, boolean unpaged) {
    Pageable pageable =
        unpaged
            ? PageRequest.of(0, FamiliaRepository.MAX_UNPAGED)
            : PageRequest.of(page, size);
    Page<TaxonomyMasterListItemDto> result = familiaRepository.search(q, pageable);
    return toResponse(result, page, size, unpaged);
  }

  @Transactional(readOnly = true)
  public MasterDataPageResponse<TaxonomyGenusListItemDto> listGenera(
      int page, int size, Long familyId, String q, boolean unpaged) {
    Pageable pageable =
        unpaged ? PageRequest.of(0, GeneroRepository.MAX_UNPAGED) : PageRequest.of(page, size);
    Page<TaxonomyGenusListItemDto> result = generoRepository.search(familyId, q, pageable);
    return toResponse(result, page, size, unpaged);
  }

  @Transactional(readOnly = true)
  @Cacheable(cacheNames = CatalogCacheConfig.CACHE_PUBLIC_PROVINCE_NAMES, key = "'all'")
  public PublicProvinceNamesResponse listPublicProvinceNames() {
    List<String> names = provinciaReadRepository.findAllProvinceNamesOrdered();
    return new PublicProvinceNamesResponse(names);
  }

  @Transactional(readOnly = true)
  @Cacheable(
      cacheNames = CatalogCacheConfig.CACHE_PROVINCES_UNPAGED,
      key = "'all'",
      condition = "#unpaged && (#q == null || #q.isBlank())")
  public MasterDataPageResponse<ProvinceListItemDto> listProvinces(
      int page, int size, String q, boolean unpaged) {
    Pageable pageable =
        unpaged
            ? PageRequest.of(0, ProvinciaReadRepository.MAX_UNPAGED)
            : PageRequest.of(page, size);
    Page<ProvinceListItemDto> result = provinciaReadRepository.search(q, pageable);
    return toResponse(result, page, size, unpaged);
  }

  private static <T> MasterDataPageResponse<T> toResponse(
      Page<T> result, int requestedPage, int requestedSize, boolean unpaged) {
    if (unpaged) {
      long returnedElements = result.getContent().size();
      return MasterDataPageResponse.of(
          result.getContent(),
          returnedElements,
          0,
          result.getContent().size(),
          true);
    }
    return MasterDataPageResponse.of(
        result.getContent(),
        result.getTotalElements(),
        requestedPage,
        requestedSize,
        false);
  }
}
