package com.mtl.catalog.dto;

import java.util.List;

/** Respuesta pública de nombres de provincia (sin id ni código). */
public record PublicProvinceNamesResponse(List<String> names) {}
