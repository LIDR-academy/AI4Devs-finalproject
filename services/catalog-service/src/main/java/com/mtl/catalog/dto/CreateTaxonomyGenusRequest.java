package com.mtl.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTaxonomyGenusRequest(
    @NotNull Long familyId,
    @NotBlank @Size(max = 255) String scientificName,
    @Size(max = 255) String commonName) {}
