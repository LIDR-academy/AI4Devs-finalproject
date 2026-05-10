package com.mtl.catalog.util;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SpeciesLabelFormatterTest {

  @Test
  void format_comunYCientifico_entreParentesis() {
    assertThat(SpeciesLabelFormatter.format("Encina", "Quercus ilex"))
        .isEqualTo("Encina (Quercus ilex)");
  }

  @Test
  void format_soloComun() {
    assertThat(SpeciesLabelFormatter.format("Sin binomio", null)).isEqualTo("Sin binomio");
  }
}
