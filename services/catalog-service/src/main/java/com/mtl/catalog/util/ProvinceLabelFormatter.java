package com.mtl.catalog.util;

/** Etiqueta de provincia para UI: {@code nombre (código)}. */
public final class ProvinceLabelFormatter {

  private ProvinceLabelFormatter() {}

  public static String format(String nombre, String codigo) {
    String nom = nombre != null ? nombre.trim() : "";
    String cod = codigo != null ? codigo.trim() : "";
    if (nom.isEmpty()) {
      return cod;
    }
    if (cod.isEmpty()) {
      return nom;
    }
    return nom + " (" + cod + ")";
  }
}
