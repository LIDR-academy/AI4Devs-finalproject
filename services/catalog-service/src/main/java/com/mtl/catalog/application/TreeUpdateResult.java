package com.mtl.catalog.application;

/** Resultado interno de persistencia de edición (ids para auditoría R3). */
public record TreeUpdateResult(
    long arbolId, long especieIdPrev, long provinciaIdPrev, long especieIdNew, long provinciaIdNew) {}
