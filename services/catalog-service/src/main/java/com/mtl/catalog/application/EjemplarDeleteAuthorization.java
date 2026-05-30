package com.mtl.catalog.application;

/** Contexto de una ficha autorizada para borrado físico (antes de invocar media). */
public record EjemplarDeleteAuthorization(long treeId, long especieId, long provinciaId) {}
