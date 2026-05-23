package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.dto.MasterDataPageResponse;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class MasterDataQueryServiceTest {

  @Mock private EspecieReadRepository especieReadRepository;
  @Mock private ProvinciaReadRepository provinciaReadRepository;
  @Mock private FamiliaRepository familiaRepository;
  @Mock private GeneroRepository generoRepository;

  @InjectMocks private MasterDataQueryService service;

  @Test
  void listSpecies_unpaged_usaTotalElementsCoherenteConContenidoDevuelto() {
    List<SpeciesListItemDto> content =
        List.of(new SpeciesListItemDto(1L, "Encina"), new SpeciesListItemDto(2L, "Olivo"));
    when(especieReadRepository.search("a", PageRequest.of(0, EspecieRepository.MAX_UNPAGED)))
        .thenReturn(new PageImpl<>(content, PageRequest.of(0, 2), 10_000));

    MasterDataPageResponse<SpeciesListItemDto> response = service.listSpecies(0, 20, "a", true);

    assertThat(response.unpaged()).isTrue();
    assertThat(response.content()).hasSize(2);
    assertThat(response.totalElements()).isEqualTo(2);
    assertThat(response.size()).isEqualTo(2);
    verify(especieReadRepository).search("a", PageRequest.of(0, EspecieRepository.MAX_UNPAGED));
  }

  @Test
  void listPublicProvinceNames_delegaEnRepositorioOrdenado() {
    when(provinciaReadRepository.findAllProvinceNamesOrdered())
        .thenReturn(List.of("Burgos", "León"));

    PublicProvinceNamesResponse response = service.listPublicProvinceNames();

    assertThat(response.nombres()).containsExactly("Burgos", "León");
    verify(provinciaReadRepository).findAllProvinceNamesOrdered();
  }

  @Test
  void listFamilies_unpaged_usaTotalElementsCoherenteConContenidoDevuelto() {
    List<TaxonomyMasterListItemDto> content =
        List.of(new TaxonomyMasterListItemDto(1L, "Fagáceas (Fagaceae)"));
    when(familiaRepository.search("fa", PageRequest.of(0, FamiliaRepository.MAX_UNPAGED)))
        .thenReturn(new PageImpl<>(content, PageRequest.of(0, 1), 500));

    MasterDataPageResponse<TaxonomyMasterListItemDto> response =
        service.listFamilies(0, 20, "fa", true);

    assertThat(response.unpaged()).isTrue();
    assertThat(response.content()).hasSize(1);
    assertThat(response.totalElements()).isEqualTo(1);
    verify(familiaRepository).search("fa", PageRequest.of(0, FamiliaRepository.MAX_UNPAGED));
  }

  @Test
  void listGenera_unpaged_sinFiltroFamilia_delegaEnRepositorio() {
    List<TaxonomyGenusListItemDto> content =
        List.of(new TaxonomyGenusListItemDto(10L, "Quercus", 1L));
    when(generoRepository.search(null, "q", PageRequest.of(0, GeneroRepository.MAX_UNPAGED)))
        .thenReturn(new PageImpl<>(content, PageRequest.of(0, 1), 100));

    MasterDataPageResponse<TaxonomyGenusListItemDto> response =
        service.listGenera(0, 20, null, "q", true);

    assertThat(response.content()).containsExactlyElementsOf(content);
    assertThat(response.totalElements()).isEqualTo(1);
    verify(generoRepository).search(null, "q", PageRequest.of(0, GeneroRepository.MAX_UNPAGED));
  }

  @Test
  void listGenera_paginado_conFiltroFamilia_delegaEnRepositorio() {
    List<TaxonomyGenusListItemDto> content =
        List.of(new TaxonomyGenusListItemDto(10L, "Quercus", 5L));
    when(generoRepository.search(5L, null, PageRequest.of(0, 20)))
        .thenReturn(new PageImpl<>(content, PageRequest.of(0, 20), 1));

    MasterDataPageResponse<TaxonomyGenusListItemDto> response =
        service.listGenera(0, 20, 5L, null, false);

    assertThat(response.unpaged()).isFalse();
    assertThat(response.page()).isZero();
    assertThat(response.totalElements()).isEqualTo(1);
    verify(generoRepository).search(5L, null, PageRequest.of(0, 20));
  }
}
