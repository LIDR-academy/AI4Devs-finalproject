package com.mtl.media.api;

import com.mtl.media.application.MediaPublicPrimaryPhotoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/media/public")
public class MediaPublicPrimaryPhotoController {

  private final MediaPublicPrimaryPhotoService primaryPhotoService;

  public MediaPublicPrimaryPhotoController(MediaPublicPrimaryPhotoService primaryPhotoService) {
    this.primaryPhotoService = primaryPhotoService;
  }

  @GetMapping("/trees/{treeId}/primary-photo")
  public ResponseEntity<byte[]> getPrimaryPhoto(
      @PathVariable long treeId, Authentication authentication) {
    Jwt jwt = resolveJwt(authentication);
    return primaryPhotoService.loadPrimaryPhotoBytes(treeId, jwt);
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
