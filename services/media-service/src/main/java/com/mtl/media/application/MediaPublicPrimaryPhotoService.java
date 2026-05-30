package com.mtl.media.application;

import com.mtl.media.domain.CategoriaFotografia;
import com.mtl.media.domain.Fotografia;
import com.mtl.media.infrastructure.persistence.jpa.repository.FotografiaRepository;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.MinioException;
import java.io.InputStream;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MediaPublicPrimaryPhotoService {

  private final FotografiaRepository fotografiaRepository;
  private final RestClient catalogRestClient;
  private final MinioClient mediaMinioClient;

  public MediaPublicPrimaryPhotoService(
      FotografiaRepository fotografiaRepository,
      RestClient catalogRestClient,
      MinioClient mediaMinioClient) {
    this.fotografiaRepository = fotografiaRepository;
    this.catalogRestClient = catalogRestClient;
    this.mediaMinioClient = mediaMinioClient;
  }

  /**
   * Comprueba en catálogo que el ejemplar es visible en el mismo contexto que el listado/detalle público
   * (JWT opcional para colaboradores que ven borradores). Luego devuelve bytes desde el almacén si hay
   * foto principal no eliminada.
   */
  public ResponseEntity<byte[]> loadPrimaryPhotoBytes(long ejemplarId, Jwt jwt) {
    assertEjemplarVisibleInCatalog(ejemplarId, jwt);

    Fotografia foto =
        fotografiaRepository
            .findPrincipalForEjemplar(ejemplarId, CategoriaFotografia.PUBLIC)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sin fotografía principal"));

    byte[] body;
    try (InputStream stream =
        mediaMinioClient.getObject(
            GetObjectArgs.builder()
                .bucket(foto.getBucketAlmacenamiento())
                .object(foto.getClaveObjeto())
                .build())) {
      body = stream.readAllBytes();
    } catch (ErrorResponseException ex) {
      if ("NoSuchKey".equals(ex.errorResponse().code())
          || "NoSuchBucket".equals(ex.errorResponse().code())) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Objeto no encontrado en almacén");
      }
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY, "No se pudo leer la imagen desde el almacén de objetos");
    } catch (MinioException | java.io.IOException | java.security.InvalidKeyException | java.security.NoSuchAlgorithmException ex) {
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY, "No se pudo leer la imagen desde el almacén de objetos");
    }

    MediaType contentType = MediaType.parseMediaType(foto.getTipoMime());
    return ResponseEntity.ok().contentType(contentType).body(body);
  }

  private void assertEjemplarVisibleInCatalog(long ejemplarId, Jwt jwt) {
    try {
      catalogRestClient
          .get()
          .uri("/api/catalog/public/trees/{id}", ejemplarId)
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
