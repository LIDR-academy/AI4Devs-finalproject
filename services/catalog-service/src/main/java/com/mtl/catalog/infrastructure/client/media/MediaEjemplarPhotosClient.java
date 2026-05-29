package com.mtl.catalog.infrastructure.client.media;

import org.springframework.security.oauth2.jwt.Jwt;

/** Cliente HTTP hacia media-service (TASK-HU-008-06). */
public interface MediaEjemplarPhotosClient {

  /**
   * Invoca {@code DELETE /api/media/ejemplares/{ejemplarId}/photos} con relay del JWT del actor. Media
   * responde 204 aunque no haya fotografías.
   */
  void deleteAllPhotosForEjemplar(long ejemplarId, Jwt jwt);
}
