export const ClbenEnum = {
  table: "rrfclben",
  title: "Beneficiario",
  msService: "msPerso",
  // Métodos NATS - PATRÓN ESTÁNDAR: incluir nombre del módulo para evitar duplicados
  smFindAll: "findAllClben",
  smFindById: "findByIdClben",
  smFindByClbncId: "findByClbncIdClben",
  smCreate: "createClben",
  smUpdate: "updateClben",
  smDelete: "deleteClben",
  REPOSITORY: "ClbenRepository",
};

