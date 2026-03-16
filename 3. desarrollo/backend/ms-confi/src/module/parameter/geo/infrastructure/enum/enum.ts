export const GeoEnum = {
  table: {
    provi: "rrfprovi",
    canto: "rrfcanto",
    parro: "rrfparro",
  },
  title: {
    provi: "Provincias",
    canto: "Cantones",
    parro: "Parroquias",
  },
  msService: "msGeo",
  // Métodos NATS - Provincias
  smFindAllProvincias: "findAllProvincias",
  smCreateProvincia: "createProvincia",
  smUpdateProvincia: "updateProvincia",
  smDeleteProvincia: "deleteProvincia",
  // Métodos NATS - Cantones
  smFindCantonesByProvincia: "findCantonesByProvincia",
  smCreateCanton: "createCanton",
  smUpdateCanton: "updateCanton",
  smDeleteCanton: "deleteCanton",
  // Métodos NATS - Parroquias
  smFindParroquiasByCanton: "findParroquiasByCanton",
  smSearchParroquias: "searchParroquias",
  smCreateParroquia: "createParroquia",
  smUpdateParroquia: "updateParroquia",
  smDeleteParroquia: "deleteParroquia",
}

