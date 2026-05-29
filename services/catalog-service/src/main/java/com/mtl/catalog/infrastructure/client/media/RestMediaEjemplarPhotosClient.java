package com.mtl.catalog.infrastructure.client.media;

import com.mtl.catalog.exception.CatalogBadGatewayException;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

@Service
public class RestMediaEjemplarPhotosClient implements MediaEjemplarPhotosClient {

  private final RestClient mediaRestClient;

  public RestMediaEjemplarPhotosClient(RestClient mediaRestClient) {
    this.mediaRestClient = mediaRestClient;
  }

  @Override
  public void deleteAllPhotosForEjemplar(long ejemplarId, Jwt jwt) {
    try {
      mediaRestClient
          .delete()
          .uri("/api/media/ejemplares/{ejemplarId}/photos", ejemplarId)
          .headers(h -> h.setBearerAuth(jwt.getTokenValue()))
          .retrieve()
          .toBodilessEntity();
    } catch (RestClientResponseException ex) {
      if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
        throw new CatalogNotFoundException("No se encontró un árbol con el identificador indicado.");
      }
      if (ex.getStatusCode() == HttpStatus.FORBIDDEN) {
        throw new CatalogForbiddenException("No tiene permiso para eliminar las fotografías de este árbol.");
      }
      if (ex.getStatusCode() == HttpStatus.BAD_GATEWAY) {
        throw new CatalogBadGatewayException(
            "No se pudieron eliminar las fotografías del árbol en el servicio de medios.");
      }
      throw new CatalogBadGatewayException(
          "Error al eliminar las fotografías del árbol en el servicio de medios.");
    } catch (RestClientException ex) {
      throw new CatalogBadGatewayException(
          "No se pudo contactar con el servicio de medios para eliminar las fotografías.");
    }
  }
}
