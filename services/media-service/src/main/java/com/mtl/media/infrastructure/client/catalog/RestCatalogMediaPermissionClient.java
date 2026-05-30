package com.mtl.media.infrastructure.client.catalog;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RestCatalogMediaPermissionClient implements CatalogMediaPermissionClient {

  private final RestClient catalogRestClient;

  public RestCatalogMediaPermissionClient(RestClient catalogRestClient) {
    this.catalogRestClient = catalogRestClient;
  }

  @Override
  public long resolveActorUsuarioAppIdForEjemplar(long treeId, Jwt jwt) {
    try {
      MediaSubmissionPermissionResponse body =
          catalogRestClient
              .get()
              .uri("/api/catalog/trees/{treeId}/media-submission-permission", treeId)
              .headers(h -> h.setBearerAuth(jwt.getTokenValue()))
              .retrieve()
              .body(MediaSubmissionPermissionResponse.class);
      if (body == null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_GATEWAY, "Respuesta vacía del catálogo al verificar permiso.");
      }
      return body.actorUsuarioAppId();
    } catch (RestClientResponseException ex) {
      if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
        throw new ResponseStatusException(
            HttpStatus.NOT_FOUND, "No existe el ejemplar indicado en el catálogo.");
      }
      if (ex.getStatusCode() == HttpStatus.FORBIDDEN) {
        throw new ResponseStatusException(
            HttpStatus.FORBIDDEN, "No tiene permiso para asociar fotografías a este ejemplar.");
      }
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY, "Error al consultar permisos en el catálogo.");
    } catch (RestClientException ex) {
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY, "No se pudo contactar con el catálogo para verificar permiso.");
    }
  }

  @Override
  public boolean hasPhotoManagementPermission(long treeId, Jwt jwt) {
    try {
      resolveActorUsuarioAppIdForEjemplar(treeId, jwt);
      return true;
    } catch (ResponseStatusException ex) {
      if (ex.getStatusCode() == HttpStatus.FORBIDDEN) {
        return false;
      }
      throw ex;
    }
  }
}
