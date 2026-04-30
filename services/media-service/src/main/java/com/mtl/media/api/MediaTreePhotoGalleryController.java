package com.mtl.media.api;

import com.mtl.media.api.dto.TreePhotoGalleryItemResponse;
import com.mtl.media.config.MediaPresignProperties;
import com.mtl.media.application.MediaTreePhotoGalleryService;
import com.mtl.media.domain.Fotografia;
import com.mtl.media.storage.ObjectStoragePresigner;
import java.util.List;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/media")
public class MediaTreePhotoGalleryController {

  private final MediaTreePhotoGalleryService galleryService;
  private final ObjectStoragePresigner objectStoragePresigner;
  private final MediaPresignProperties presignProperties;

  public MediaTreePhotoGalleryController(
      MediaTreePhotoGalleryService galleryService,
      ObjectStoragePresigner objectStoragePresigner,
      MediaPresignProperties presignProperties) {
    this.galleryService = galleryService;
    this.objectStoragePresigner = objectStoragePresigner;
    this.presignProperties = presignProperties;
  }

  @GetMapping("/trees/{treeId}/photos")
  public List<TreePhotoGalleryItemResponse> findByTreeId(
      @PathVariable long treeId, Authentication authentication) {
    Jwt jwt = resolveJwt(authentication);
    return galleryService.findVisiblePhotos(treeId, jwt).stream().map(this::toResponse).toList();
  }

  private TreePhotoGalleryItemResponse toResponse(Fotografia photo) {
    return new TreePhotoGalleryItemResponse(
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
