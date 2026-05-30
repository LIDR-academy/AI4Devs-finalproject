package com.mtl.media.controller;

import com.mtl.media.application.MediaEjemplarPhotoGalleryService;
import com.mtl.media.application.MediaEjemplarPhotosDeleteService;
import com.mtl.media.config.MediaPresignProperties;
import com.mtl.media.domain.Fotografia;
import com.mtl.media.dto.EjemplarPhotoGalleryItemResponse;
import com.mtl.media.infrastructure.storage.ObjectStoragePresigner;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/media")
public class MediaEjemplarPhotoGalleryController {

  private final MediaEjemplarPhotoGalleryService galleryService;
  private final MediaEjemplarPhotosDeleteService photosDeleteService;
  private final ObjectStoragePresigner objectStoragePresigner;
  private final MediaPresignProperties presignProperties;

  public MediaEjemplarPhotoGalleryController(
      MediaEjemplarPhotoGalleryService galleryService,
      MediaEjemplarPhotosDeleteService photosDeleteService,
      ObjectStoragePresigner objectStoragePresigner,
      MediaPresignProperties presignProperties) {
    this.galleryService = galleryService;
    this.photosDeleteService = photosDeleteService;
    this.objectStoragePresigner = objectStoragePresigner;
    this.presignProperties = presignProperties;
  }

  @GetMapping("/trees/{treeId}/photos")
  public List<EjemplarPhotoGalleryItemResponse> findByEjemplarId(
      @PathVariable long treeId, Authentication authentication) {
    Jwt jwt = resolveJwt(authentication);
    return galleryService.findVisiblePhotos(treeId, jwt).stream().map(this::toResponse).toList();
  }

  @DeleteMapping("/trees/{treeId}/photos")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteAllForEjemplar(@PathVariable long treeId, @AuthenticationPrincipal Jwt jwt) {
    photosDeleteService.deleteAllPhotosForEjemplar(treeId, jwt);
  }

  private EjemplarPhotoGalleryItemResponse toResponse(Fotografia photo) {
    return new EjemplarPhotoGalleryItemResponse(
        photo.getFotografiaId(),
        buildReadUrl(photo),
        photo.isEsPrincipal(),
        photo.getOrden(),
        photo.getTipoMime(),
        photo.getAnchoPx(),
        photo.getAltoPx(),
        photo.getCategoria());
  }

  private String buildReadUrl(Fotografia photo) {
    return objectStoragePresigner.presignedGetUrl(
        photo.getBucketAlmacenamiento(), photo.getClaveObjeto(), presignProperties.getExpiresIn());
  }

  private static Jwt resolveJwt(Authentication authentication) {
    if (authentication == null
        || !authentication.isAuthenticated()
        || authentication instanceof AnonymousAuthenticationToken) {
      return null;
    }
    Object principal = authentication.getPrincipal();
    if (principal instanceof Jwt jwt) {
      return jwt;
    }
    return null;
  }
}
