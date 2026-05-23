package com.mtl.catalog.dto;

public record TaxonomyFamilyResponse(
    long familyId, String scientificName, String commonName, String label) {}
