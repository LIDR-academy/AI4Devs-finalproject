package com.mtl.catalog.util;

/** Etiqueta de especie para UI: {@code nombre común (nombre científico)}. */
public final class SpeciesLabelFormatter {

  private SpeciesLabelFormatter() {}

  public static String format(String nombreComun, String nombreCientifico) {
    String cient = nombreCientifico != null ? nombreCientifico.trim() : "";
    String comun = nombreComun != null ? nombreComun.trim() : "";
    if (cient.isEmpty()) {
      return comun;
    }
    if (comun.isEmpty()) {
      return "(" + cient + ")";
    }
    return comun + " (" + cient + ")";
  }
}
