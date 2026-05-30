package com.mtl.media.infrastructure.client.catalog;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

/**
 * Comprueba en catálogo que el árbol es visible en el mismo contexto que listado/detalle público
 * ({@code GET /api/catalog/public/trees/{id}}). JWT opcional (p. ej. colaborador que ve borradores).
 */
@Component
public class CatalogPublicTreeVisibilityGuard {

  private final RestClient catalogRestClient;

  public CatalogPublicTreeVisibilityGuard(RestClient catalogRestClient) {
    this.catalogRestClient = catalogRestClient;
  }

  public void assertVisibleInPublicCatalog(long treeId, Jwt jwt) {
    try {
      catalogRestClient
          .get()
          .uri("/api/catalog/public/trees/{id}", treeId)
          .headers(
              h -> {
                if (jwt != null
                    && jwt.getTokenValue() != null
                    && !jwt.getTokenValue().isBlank()) {
                  h.setBearerAuth(jwt.getTokenValue());
                }
              })
          .retrieve()
          .toBodilessEntity();
    } catch (RestClientResponseException ex) {
      if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
        throw new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Ejemplar no disponible en consulta pública");
      }
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY, "No se pudo validar la visibilidad del ejemplar en catálogo");
    } catch (RestClientException ex) {
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY, "No se pudo validar la visibilidad del ejemplar en catálogo");
    }
  }
}
