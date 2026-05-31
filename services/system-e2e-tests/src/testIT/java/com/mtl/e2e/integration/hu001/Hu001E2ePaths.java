package com.mtl.e2e.integration.hu001;

/** Rutas HTTP usadas por los E2E de HU-001 vía gateway. */
final class Hu001E2ePaths {

  static final String SPECIES_PAGE = "/api/catalog/species?page=0&size=5";
  static final String FAMILIES_PAGE = "/api/catalog/families?page=0&size=5";
  static final String SPECIES_BY_ID_1 = "/api/catalog/species/1";

  private Hu001E2ePaths() {}
}
