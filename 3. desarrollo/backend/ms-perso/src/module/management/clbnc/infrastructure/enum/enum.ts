export const ClbncEnum = {
  table: "rrfclbnc",
  title: "Usuario Banca Digital",
  msService: "msPerso",
  // Métodos NATS - PATRÓN ESTÁNDAR: incluir nombre del módulo para evitar duplicados
  smFindAll: "findAllClbnc",
  smFindById: "findByIdClbnc",
  smFindByClienId: "findByClienIdClbnc",
  smFindByUsername: "findByUsernameClbnc",
  smCreate: "createClbnc",
  smUpdate: "updateClbnc",
  smDelete: "deleteClbnc",
  smLogin: "loginClbnc",
  smChangePassword: "changePasswordClbnc",
  smRecoverPassword: "recoverPasswordClbnc",
  REPOSITORY: "ClbncRepository",
};

