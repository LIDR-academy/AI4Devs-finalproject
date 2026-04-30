package com.mtl.media.application;

import com.mtl.media.api.dto.ConfirmPhotoUploadRequest;
import com.mtl.media.api.dto.PhotoMetadataResponse;
import com.mtl.media.api.dto.PresignUploadRequest;
import com.mtl.media.api.dto.PresignUploadResponse;
import com.mtl.media.config.MediaPresignProperties;
import com.mtl.media.config.MediaStorageProperties;
import com.mtl.media.domain.CategoriaFotografia;
import com.mtl.media.domain.Fotografia;
import com.mtl.media.domain.FotografiaRepository;
import com.mtl.media.integration.catalog.CatalogMediaPermissionClient;
import com.mtl.media.storage.ObjectStoragePresigner;
import com.mtl.media.validation.MediaUploadPolicyValidator;
import com.mtl.media.validation.MediaUploadValidationException;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MediaUploadService {

  private final FotografiaRepository fotografiaRepository;
  private final MediaUploadPolicyValidator uploadPolicyValidator;
  private final MediaStorageProperties storageProperties;
  private final MediaPresignProperties presignProperties;
  private final CatalogMediaPermissionClient catalogMediaPermissionClient;
  private final ObjectStoragePresigner objectStoragePresigner;

  public MediaUploadService(
      FotografiaRepository fotografiaRepository,
      MediaUploadPolicyValidator uploadPolicyValidator,
      MediaStorageProperties storageProperties,
      MediaPresignProperties presignProperties,
      CatalogMediaPermissionClient catalogMediaPermissionClient,
      ObjectStoragePresigner objectStoragePresigner) {
    this.fotografiaRepository = fotografiaRepository;
    this.uploadPolicyValidator = uploadPolicyValidator;
    this.storageProperties = storageProperties;
    this.presignProperties = presignProperties;
    this.catalogMediaPermissionClient = catalogMediaPermissionClient;
    this.objectStoragePresigner = objectStoragePresigner;
  }

  public PresignUploadResponse createPresignedUpload(PresignUploadRequest request, Jwt jwt) {
    catalogMediaPermissionClient.resolveActorUsuarioAppIdForTree(request.arbolId(), jwt);
    uploadPolicyValidator.validateMimeType(request.tipoMime());
    uploadPolicyValidator.validateFileSize(request.tamanoBytes());
    int currentPhotos = fotografiaRepository.countActiveForTree(request.arbolId());
    uploadPolicyValidator.validateMaxPhotosPerTree(currentPhotos, 1);

    String objectKey = generateObjectKey(request.arbolId(), request.nombreFicheroOriginal());
    OffsetDateTime expiresAt = OffsetDateTime.now().plus(presignProperties.getExpiresIn());
    String uploadUrl =
        objectStoragePresigner.presignedPutUrl(
            storageProperties.getBucket(), objectKey, presignProperties.getExpiresIn());
    return new PresignUploadResponse(uploadUrl, storageProperties.getBucket(), objectKey, expiresAt);
  }

  @Transactional
  public PhotoMetadataResponse confirmUpload(ConfirmPhotoUploadRequest request, Jwt jwt) {
    long actorUsuarioAppId =
        catalogMediaPermissionClient.resolveActorUsuarioAppIdForTree(request.arbolId(), jwt);
    uploadPolicyValidator.validateMimeType(request.tipoMime());
    uploadPolicyValidator.validateFileSize(request.tamanoBytes());
    if (!storageProperties.getBucket().equals(request.bucket())) {
      throw new MediaUploadValidationException(
          "El bucket indicado no coincide con el bucket configurado del servicio.");
    }
    int currentPhotos = fotografiaRepository.countActiveForTree(request.arbolId());
    uploadPolicyValidator.validateMaxPhotosPerTree(currentPhotos, 1);

    if (request.orden() != null && !request.orden().equals(currentPhotos)) {
      throw new MediaUploadValidationException(
          "El orden de la fotografía debe ser "
              + currentPhotos
              + " (siguiente posición esperada según fotos ya confirmadas para el árbol).");
    }
    int orden = request.orden() != null ? request.orden() : currentPhotos;

    // Primera foto confirmada del árbol: siempre principal (HU-006); el cliente no puede sustituir esa regla.
    boolean isFirstConfirmedPhoto = currentPhotos == 0;
    if (!isFirstConfirmedPhoto && Boolean.TRUE.equals(request.esPrincipal())) {
      throw new MediaUploadValidationException(
          "Solo la primera fotografía confirmada para el árbol puede ser principal.");
    }

    Fotografia fotografia = new Fotografia();
    fotografia.setArbolId(request.arbolId());
    fotografia.setBucketAlmacenamiento(request.bucket());
    fotografia.setClaveObjeto(request.objectKey());
    fotografia.setNombreFicheroOriginal(request.nombreFicheroOriginal());
    fotografia.setTipoMime(request.tipoMime());
    fotografia.setTamanoBytes(request.tamanoBytes());
    fotografia.setChecksumSha256(request.checksumSha256());
    fotografia.setAnchoPx(request.anchoPx());
    fotografia.setAltoPx(request.altoPx());
    fotografia.setOrden(orden);
    fotografia.setEsPrincipal(isFirstConfirmedPhoto);
    fotografia.setCategoria(CategoriaFotografia.PUBLIC);
    fotografia.setSubidaEn(OffsetDateTime.now());
    fotografia.setSubidaPor(actorUsuarioAppId);

    Fotografia saved = fotografiaRepository.save(fotografia);
    return toResponse(saved);
  }

  @Transactional(readOnly = true)
  public PhotoMetadataResponse getPhotoMetadata(Long photoId, Jwt jwt) {
    Fotografia photo =
        fotografiaRepository
            .findById(photoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fotografía no encontrada"));
    catalogMediaPermissionClient.resolveActorUsuarioAppIdForTree(photo.getArbolId(), jwt);
    return toResponse(photo);
  }

  private PhotoMetadataResponse toResponse(Fotografia photo) {
    return new PhotoMetadataResponse(
        photo.getFotografiaId(),
        photo.getArbolId(),
        photo.getBucketAlmacenamiento(),
        photo.getClaveObjeto(),
        photo.getNombreFicheroOriginal(),
        photo.getTipoMime(),
        photo.getTamanoBytes(),
        photo.getAnchoPx(),
        photo.getAltoPx(),
        photo.getOrden(),
        photo.isEsPrincipal(),
        photo.getSubidaEn());
  }

  private String generateObjectKey(Long arbolId, String originalFilename) {
    String cleanName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
    return "trees/" + arbolId + "/" + UUID.randomUUID() + "-" + cleanName;
  }
}
