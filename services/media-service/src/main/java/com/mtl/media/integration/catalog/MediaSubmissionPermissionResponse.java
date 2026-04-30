package com.mtl.media.integration.catalog;

/** Cuerpo JSON de {@code GET /api/catalog/trees/{id}/media-submission-permission} (alineado con catalog-service). */
public record MediaSubmissionPermissionResponse(long treeId, long actorUsuarioAppId) {}
