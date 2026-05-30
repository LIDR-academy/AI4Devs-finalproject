package com.mtl.catalog.config;

import java.util.Optional;

/**
 * Identificador del actor ({@code usuario_app_id}) en el hilo de la petición, fijado tras
 * {@code UsuarioAppMaterializationService#materialize} para que la auditoría JPA no dispare consultas
 * que provoquen auto-flush recursivo durante {@code save}.
 */
public final class CatalogAuditorContext {

  private static final ThreadLocal<Long> CURRENT_USUARIO_APP_ID = new ThreadLocal<>();

  private CatalogAuditorContext() {}

  public static void bindUsuarioAppId(long usuarioAppId) {
    CURRENT_USUARIO_APP_ID.set(usuarioAppId);
  }

  public static Optional<Long> currentUsuarioAppId() {
    return Optional.ofNullable(CURRENT_USUARIO_APP_ID.get());
  }

  public static void clear() {
    CURRENT_USUARIO_APP_ID.remove();
  }
}
