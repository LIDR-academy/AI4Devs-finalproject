package com.mtl.catalog.util;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ProvinceLabelFormatterTest {

  @Test
  void format_nombreYcodigo() {
    assertThat(ProvinceLabelFormatter.format("Madrid", "28")).isEqualTo("Madrid (28)");
  }
}
