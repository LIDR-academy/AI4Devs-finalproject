package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.dto.MasterDataPageResponse;
import com.mtl.catalog.dto.PublicProvinceNamesResponse;
import com.mtl.catalog.dto.SpeciesListItemDto;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieReadRepository;
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

  @InjectMocks private MasterDataQueryService service;

  @Test
  void listSpecies_unpaged_usaTotalElementsCoherenteConContenidoDevuelto() {
    List<SpeciesListItemDto> content =
        List.of(new SpeciesListItemDto(1L, "Encina"), new SpeciesListItemDto(2L, "Olivo"));
    when(especieReadRepository.search("a", PageRequest.of(0, EspecieReadRepository.MAX_UNPAGED)))
        .thenReturn(new PageImpl<>(content, PageRequest.of(0, 2), 10_000));

    MasterDataPageResponse<SpeciesListItemDto> response = service.listSpecies(0, 20, "a", true);

    assertThat(response.unpaged()).isTrue();
    assertThat(response.content()).hasSize(2);
    assertThat(response.totalElements()).isEqualTo(2);
    assertThat(response.size()).isEqualTo(2);
    verify(especieReadRepository).search("a", PageRequest.of(0, EspecieReadRepository.MAX_UNPAGED));
  }

  @Test
  void listPublicProvinceNames_delegaEnRepositorioOrdenado() {
    when(provinciaReadRepository.findAllProvinceNamesOrdered())
        .thenReturn(List.of("Burgos", "León"));

    PublicProvinceNamesResponse response = service.listPublicProvinceNames();

    assertThat(response.nombres()).containsExactly("Burgos", "León");
    verify(provinciaReadRepository).findAllProvinceNamesOrdered();
  }
}
