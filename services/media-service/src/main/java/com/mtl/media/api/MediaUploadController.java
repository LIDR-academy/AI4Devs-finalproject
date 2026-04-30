package com.mtl.media.api;

import com.mtl.media.api.dto.ConfirmPhotoUploadRequest;
import com.mtl.media.api.dto.PhotoMetadataResponse;
import com.mtl.media.api.dto.PresignUploadRequest;
import com.mtl.media.api.dto.PresignUploadResponse;
import com.mtl.media.application.MediaUploadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/media")
public class MediaUploadController {

  private final MediaUploadService mediaUploadService;

  public MediaUploadController(MediaUploadService mediaUploadService) {
    this.mediaUploadService = mediaUploadService;
  }

  @PostMapping("/uploads/presign")
  public PresignUploadResponse presign(
      @Valid @RequestBody PresignUploadRequest request, @AuthenticationPrincipal Jwt jwt) {
    return mediaUploadService.createPresignedUpload(request, jwt);
  }

  @PostMapping("/photos/confirm")
  @ResponseStatus(HttpStatus.CREATED)
  public PhotoMetadataResponse confirm(
      @Valid @RequestBody ConfirmPhotoUploadRequest request, @AuthenticationPrincipal Jwt jwt) {
    return mediaUploadService.confirmUpload(request, jwt);
  }

  @GetMapping("/photos/{photoId}")
  public PhotoMetadataResponse findById(
      @PathVariable Long photoId, @AuthenticationPrincipal Jwt jwt) {
    return mediaUploadService.getPhotoMetadata(photoId, jwt);
  }
}
