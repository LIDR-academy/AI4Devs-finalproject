package com.mtl.catalog.dto;

/**
 * Respuesta de {@code GET /api/catalog/ejemplares/{ejemplarId}/media-submission-permission}: confirma que el
 * token puede asociar fotografías al árbol y devuelve el {@code usuario_app_id} del actor para auditoría
 * en {@code media-service}.
 */
public record MediaSubmissionPermissionResponse(long ejemplarId, long actorUsuarioAppId) {}
