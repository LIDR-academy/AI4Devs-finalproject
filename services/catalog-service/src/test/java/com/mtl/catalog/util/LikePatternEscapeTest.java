package com.mtl.catalog.util;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class LikePatternEscapeTest {

  @Test
  void escapaMetacaracteresDeLike() {
    assertThat(LikePatternEscape.escapeForSqlLike("100%")).isEqualTo("100\\%");
    assertThat(LikePatternEscape.escapeForSqlLike("a_b")).isEqualTo("a\\_b");
    assertThat(LikePatternEscape.escapeForSqlLike("a\\b")).isEqualTo("a\\\\b");
  }
}
