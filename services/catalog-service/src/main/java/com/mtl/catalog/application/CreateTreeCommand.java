package com.mtl.catalog.application;

import com.mtl.catalog.dto.CreateTreeRequest;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import java.math.BigDecimal;

/**
 * Comando de alta de ficha de árbol (capa aplicación). El {@code subjectOidc} y perfil ({@code
 * email}, {@code nombrePerfil}) proceden del JWT validado; el resto alinea con {@code catalog.arbol}.
 */
public record CreateTreeCommand(
    String subjectOidc,
    Long especieId,
    Long provinciaId,
    BigDecimal latitud,
    BigDecimal longitud,
    String email,
    String nombrePerfil,
    String municipio,
    String descripcion,
    Integer altitud,
    String visibilidadMapaPublico,
    String estadoPublicacion) {

  public static CreateTreeCommand fromRequest(CreateTreeRequest request, OidcUserProfile profile) {
    return new CreateTreeCommand(
        profile.subject(),
        request.speciesId(),
        request.provinceId(),
        request.latitude(),
        request.longitude(),
        profile.email(),
        profile.displayName(),
        request.municipality(),
        request.description(),
        request.altitude(),
        request.publicMapVisibility(),
        request.publicationState());
  }
}
