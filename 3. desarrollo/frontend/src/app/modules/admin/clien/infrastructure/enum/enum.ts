/**
 * Constantes del módulo de Gestión de Clientes
 */
export const ClienEnum = {
  /** Nombre del módulo */
  title: 'Clientes',
  
  /** Rutas de API */
  apiBase: '/clientes',
  apiPersonas: '/clientes/personas',
  apiClientes: '/clientes',
  apiCompleto: '/clientes/completo',
  
  /** Rutas de la aplicación */
  routeBase: '/confi/management/clientes',
  routeList: '/confi/management/clientes',
  routeCreate: '/confi/management/clientes/nuevo',
  routeEdit: '/confi/management/clientes/:id/editar',
  routeView: '/confi/management/clientes/:id',
  
  /** Títulos de páginas */
  pageTitleList: 'Gestión de Clientes',
  pageTitleCreate: 'Registrar Cliente',
  pageTitleEdit: 'Editar Cliente',
  pageTitleView: 'Detalle del Cliente',
  
  /** Mensajes */
  messages: {
    createSuccess: 'Cliente registrado exitosamente',
    updateSuccess: 'Cliente actualizado exitosamente',
    deleteSuccess: 'Cliente eliminado exitosamente',
    createError: 'Error al registrar el cliente',
    updateError: 'Error al actualizar el cliente',
    deleteError: 'Error al eliminar el cliente',
    loadError: 'Error al cargar los datos',
    notFound: 'Cliente no encontrado',
  },
} as const;

