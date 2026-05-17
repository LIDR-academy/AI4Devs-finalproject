package com.mtl.media.controller;

import com.mtl.media.application.MediaPhotoDeleteService;
import com.mtl.media.application.MediaUploadService;
import com.mtl.media.dto.ConfirmPhotoUploadRequest;
import com.mtl.media.dto.PhotoMetadataResponse;
import com.mtl.media.dto.PresignUploadRequest;
import com.mtl.media.dto.PresignUploadResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
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
  private final MediaPhotoDeleteService mediaPhotoDeleteService;

  public MediaUploadController(
      MediaUploadService mediaUploadService, MediaPhotoDeleteService mediaPhotoDeleteService) {
    this.mediaUploadService = mediaUploadService;
    this.mediaPhotoDeleteService = mediaPhotoDeleteService;
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

  @DeleteMapping("/photos/{photoId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deletePhoto(@PathVariable long photoId, @AuthenticationPrincipal Jwt jwt) {
    mediaPhotoDeleteService.deletePhoto(photoId, jwt);
  }
}
