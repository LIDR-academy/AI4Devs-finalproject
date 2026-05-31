package com.mtl.media.application;

import com.mtl.media.domain.CategoriaFotografia;
import com.mtl.media.domain.Fotografia;
import com.mtl.media.infrastructure.client.catalog.CatalogPublicTreeVisibilityGuard;
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
import org.springframework.web.server.ResponseStatusException;

@Service
public class MediaPublicPrimaryPhotoService {

  private final FotografiaRepository fotografiaRepository;
  private final CatalogPublicTreeVisibilityGuard catalogPublicTreeVisibilityGuard;
  private final MinioClient mediaMinioClient;

  public MediaPublicPrimaryPhotoService(
      FotografiaRepository fotografiaRepository,
      CatalogPublicTreeVisibilityGuard catalogPublicTreeVisibilityGuard,
      MinioClient mediaMinioClient) {
    this.fotografiaRepository = fotografiaRepository;
    this.catalogPublicTreeVisibilityGuard = catalogPublicTreeVisibilityGuard;
    this.mediaMinioClient = mediaMinioClient;
  }

  /**
   * Comprueba en catálogo que el ejemplar es visible en el mismo contexto que el listado/detalle público
   * (JWT opcional para colaboradores que ven borradores). Luego devuelve bytes desde el almacén si hay
   * foto principal no eliminada.
   */
  public ResponseEntity<byte[]> loadPrimaryPhotoBytes(long treeId, Jwt jwt) {
    catalogPublicTreeVisibilityGuard.assertVisibleInPublicCatalog(treeId, jwt);

    Fotografia foto =
        fotografiaRepository
            .findPrincipalForEjemplar(treeId, CategoriaFotografia.PUBLIC)
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
}
