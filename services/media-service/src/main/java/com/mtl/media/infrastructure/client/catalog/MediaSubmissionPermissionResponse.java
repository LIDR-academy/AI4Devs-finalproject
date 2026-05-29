package com.mtl.media.infrastructure.client.catalog;

/** Cuerpo JSON de {@code GET /api/catalog/ejemplares/{id}/media-submission-permission} (alineado con catalog-service). */
public record MediaSubmissionPermissionResponse(long ejemplarId, long actorUsuarioAppId) {}
