export const ClienEnum = {
  table: "rrfclien",
  title: "Cliente",
  msService: "msPerso",
  // Métodos NATS - CLIENTE (PATRÓN ESTÁNDAR: incluir nombre del módulo)
  smFindAll: "findAllClien",
  smFindById: "findByIdClien",
  smFindByPersonaId: "findByPersonaIdClien",
  smFindClienteCompletoById: "findClienteCompletoByIdClien",
  smCreate: "createClien",
  smUpdate: "updateClien",
  smDelete: "deleteClien",
  // Métodos NATS - PERSONA (PATRÓN ESTÁNDAR: incluir nombre del módulo)
  smFindAllPersonas: "findAllPersonasClien",
  smFindPersonaById: "findPersonaByIdClien",
  smFindPersonaByIdentificacion: "findPersonaByIdentificacionClien",
  smCreatePersona: "createPersonaClien",
  smUpdatePersona: "updatePersonaClien",
  smDeletePersona: "deletePersonaClien",
  // Métodos NATS - TRANSACCIONES UNIFICADAS
  smRegistrarClienteCompleto: "registrarClienteCompletoClien",
  smActualizarClienteCompleto: "actualizarClienteCompletoClien",
};

