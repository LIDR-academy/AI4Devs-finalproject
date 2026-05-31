package com.mtl.catalog.dto;

public record TaxonomyGenusResponse(
    long genusId, long familyId, String scientificName, String commonName, String label) {}
