package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.mtl.catalog.dto.PublicEjemplarListQuery;
import org.junit.jupiter.api.Test;

class PublicEjemplarQueryMapperTest {

  @Test
  void toCriteria_mapsApiSortToPersistenceField() {
    PublicEjemplarQueryCriteria criteria =
        PublicEjemplarQueryMapper.toCriteria(
            new PublicEjemplarListQuery(null, null, null, null, null, "species,desc"));

    assertThat(criteria.sortFieldApi()).isEqualTo("species");
    assertThat(criteria.sortFieldPersistence()).isEqualTo("especie");
    assertThat(criteria.sortDirection()).isEqualTo("desc");
  }

  @Test
  void toCriteria_mapsPublicationStateSortToEstado() {
    PublicEjemplarQueryCriteria criteria =
        PublicEjemplarQueryMapper.toCriteria(
            new PublicEjemplarListQuery(null, null, null, null, null, "publicationState,asc"));

    assertThat(criteria.sortFieldPersistence()).isEqualTo("estado");
  }

  @Test
  void toCriteria_invalidSortFallsBackToDefaultApiAndPersistence() {
    PublicEjemplarQueryCriteria criteria =
        PublicEjemplarQueryMapper.toCriteria(
            new PublicEjemplarListQuery(null, null, null, null, null, "invalid,asc"));

    assertThat(criteria.sortFieldApi()).isEqualTo("species");
    assertThat(criteria.sortFieldPersistence()).isEqualTo("especie");
    assertThat(criteria.sortDirection()).isEqualTo("asc");
  }
}
