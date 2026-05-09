package com.mtl.catalog.util;

/** Escapa metacaracteres para patrones {@code LIKE}/{@code ILIKE} con {@code ESCAPE '\\'} en PostgreSQL. */
public final class LikePatternEscape {

  private LikePatternEscape() {}

  public static String escapeForSqlLike(String value) {
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
  }
}
