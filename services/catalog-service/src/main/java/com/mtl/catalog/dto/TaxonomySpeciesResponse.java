package com.mtl.catalog.dto;

public record TaxonomySpeciesResponse(
    long speciesId, long genusId, String scientificName, String commonName, String label) {}
