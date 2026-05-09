export const es = {
  appShell: {
    brand: 'MyTreeLibrary',
    tagline: 'Catálogo colaborativo de árboles singulares',
  },
  navigation: {
    ariaLabel: 'Navegación principal',
    home: 'Inicio',
    trees: 'Árboles',
    subscribe: 'Suscripción',
    createTree: 'Alta de árbol',
    myTrees: 'Mis árboles',
    adminMasters: 'Maestros',
    adminSubscriptions: 'Suscripciones',
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
  },
  home: {
    panelNavAria: 'Accesos del panel',
    collaboratorTitle: 'Panel de colaborador',
    collaboratorDescription: 'Gestiona el catálogo y crea nuevas fichas de árboles.',
    adminTitle: 'Panel de administrador',
    adminDescription: 'Gestiona maestros, suscripciones y la operación del catálogo.',
    authInitializing: 'Inicializando la sesión...',
    publicSectionTitle: 'Bienvenido',
    visitorHeroDescription:
      'Explora el catálogo colaborativo de árboles singulares, recibe avisos por correo o inicia sesión para colaborar con la comunidad.',
    /** Texto alternativo del hero ilustrado; complementa el h2 visible */
    dashboardHeroIllustrationAlt: 'Ilustración decorativa junto al título de esta sección.',
    collaboratorSectionTitle: 'Acciones de colaborador',
    adminSectionTitle: 'Acciones de administración',
    login: 'Iniciar sesión con Keycloak',
    logout: 'Cerrar sesión',
    tiles: {
      createTree: {
        title: 'Alta de ficha',
        desc: 'Registrar un árbol singular con fotos, ubicación y datos de la ficha.',
      },
      myTrees: {
        title: 'Mis árboles',
        desc: 'Revisar y gestionar las fichas que has dado de alta como colaborador.',
      },
      masters: {
        title: 'Maestros',
        desc: 'Mantener provincias, especies y demás datos de referencia del catálogo.',
      },
      subscriptions: {
        title: 'Suscripciones',
        desc: 'Gestionar altas, bajas y estado de las notificaciones por correo.',
      },
    },
    publicTiles: {
      trees: {
        title: 'Catálogo público',
        desc: 'Explorar árboles publicados en listado y mapa.',
      },
      subscribe: {
        title: 'Suscripción por correo',
        desc: 'Recibir avisos sobre novedades sin cuenta de colaborador.',
      },
      login: {
        title: 'Iniciar sesión',
        desc: 'Accede con Keycloak para colaborar o administrar.',
      },
    },
  },
  login: {
    title: 'Redirigiendo a Keycloak...',
    description: 'Te estamos enviando al inicio de sesión seguro.',
  },
  authCallback: {
    title: 'Completando autenticación...',
    validating: 'Estamos validando tu sesión.',
    error: 'No se pudo completar el inicio de sesión.',
  },
  authGuardError: {
    title: 'No se pudo validar la sesión',
    descriptionSession: 'No hemos podido contactar con el proveedor de identidad o renovar tu sesión.',
    descriptionForbidden: 'Tu usuario no tiene permisos para acceder a esta pantalla.',
    retryCta: 'Reintentar autenticación',
    backHomeCta: 'Volver al inicio',
    retryError: 'No se pudo iniciar la autenticación. Inténtalo de nuevo en unos segundos.',
  },
  subscriptionNew: {
    title: 'Suscripción por correo',
    intro:
      'Recibirás avisos sobre el catálogo público. No sustituye una cuenta de colaborador; es solo notificaciones por correo.',
    fields: {
      email: {
        label: 'Correo electrónico',
        // En vue-i18n 9+, `@` en el literal inicia sintaxis "linked"; usar token literal.
        placeholder: "tu.correo{'@'}ejemplo.org",
      },
    },
    submit: 'Suscribirme',
    submitting: 'Enviando…',
    cancel: 'Volver al inicio',
    success: 'Te has suscrito correctamente con {email}.',
    subscribeAnother: 'Suscribir otro correo',
    errors: {
      emailRequired: 'Indica un correo electrónico.',
      conflictAlreadyActive: 'Este correo ya está suscrito a las notificaciones.',
      conflictCancelled:
        'Esta suscripción está cancelada. Solo un administrador puede reactivarla desde la gestión de suscripciones.',
      conflictGeneric: 'No se pudo completar el alta por un conflicto con el correo indicado.',
      badRequest: 'Los datos enviados no son válidos. Revisa el correo.',
      network: 'No se pudo conectar con el servicio. Comprueba tu conexión o que el API Gateway esté en marcha.',
      serviceError: 'Error en el servicio (código {status}).',
      unexpected: 'No se pudo completar la suscripción por un error inesperado.',
    },
  },
  pendingViews: {
    default: {
      title: 'Pantalla pendiente',
      description: 'Esta sección está preparada como placeholder y se completará en su historia funcional.',
      backHome: 'Volver al inicio',
    },
    treesList: {
      title: 'Listado de árboles publicados',
    },
    treesDetail: {
      title: 'Detalle de árbol',
    },
    treesEdit: {
      title: 'Edición de árbol',
    },
    myTrees: {
      title: 'Mis árboles',
    },
    adminMasters: {
      title: 'Administración de maestros',
    },
    adminSubscriptions: {
      title: 'Gestión de suscripciones',
    },
  },
  treesList: {
    title: 'Árboles de MyTreeLibrary',
    loading: 'Cargando árboles publicados...',
    empty: 'No hay resultados para los filtros seleccionados.',
    imageUnavailable: 'Imagen no disponible',
    viewDetail: 'Ver detalle',
    resultsCount: '{count} resultado(s)',
    fields: {
      province: 'Provincia',
      municipality: 'Municipio',
      state: 'Estado',
      visibility: 'Visibilidad',
    },
    filters: {
      species: {
        label: 'Especie',
        placeholder: 'Ej.: Encina o Quercus ilex',
      },
      municipality: {
        label: 'Municipio',
        placeholder: 'Ej.: Madrid',
      },
      province: {
        label: 'Provincia',
        all: 'Todas las provincias',
      },
      state: {
        label: 'Estado',
        all: 'Todos los estados',
        borrador: 'Borrador',
        publicado: 'Publicado',
      },
      visibility: {
        label: 'Visibilidad en mapa',
        all: 'Todas las visibilidades',
        privado: 'Privado',
        publico: 'Público',
      },
      moreFilters: 'Más filtros',
      fewerFilters: 'Menos filtros',
      apply: 'Aplicar filtros',
      clear: 'Limpiar',
    },
    pagination: {
      navLabel: 'Paginación del listado de árboles',
      previous: 'Anterior',
      next: 'Siguiente',
      pageStatus: 'Página {current} de {total}',
    },
    messages: {
      badRequest: 'Los filtros indicados no son válidos.',
      networkError: 'No se pudo conectar con el servicio. Verifica el entorno local.',
      badGateway:
        'El catálogo no está disponible: el API Gateway no alcanza catalog-service (p. ej. puerto 8081). Arranca el microservicio o revisa la URL del gateway.',
      serviceError: 'Error en el servicio ({status}).',
      unexpectedError: 'No se pudo cargar el listado por un error inesperado.',
    },
  },
  treesDetail: {
    title: 'Detalle de árbol publicado',
    backToList: 'Volver al listado',
    loading: 'Cargando detalle del árbol...',
    treeId: 'Ficha #{id}',
    fields: {
      species: 'Especie',
      province: 'Provincia',
      municipality: 'Municipio',
      state: 'Estado',
      visibility: 'Visibilidad',
      latitude: 'Latitud',
      longitude: 'Longitud',
      altitude: 'Altitud (m)',
      description: 'Descripción',
    },
    map: {
      title: 'Ubicación en mapa',
      noLocation: 'No hay coordenadas válidas para mostrar la localización en el mapa.',
      ariaReadOnly: 'Mapa de localización del árbol (solo lectura)',
    },
    gallery: {
      title: 'Fotografías',
      noPhotos: 'No hay fotografías disponibles para este árbol.',
      openViewer: 'Abrir visor ampliado de fotografías',
      previous: 'Anterior',
      next: 'Siguiente',
      position: 'Imagen {current} de {total}',
      fullscreenTitle: 'Vista ampliada de fotografías',
      close: 'Cerrar',
      zoomReset: 'Restablecer',
      zoomLevel: 'Zoom {percent}%',
      help: 'Usa la rueda del ratón para ampliar, arrastra para mover y teclas Esc / ← / → / 0.',
    },
    messages: {
      notFound: 'No se ha encontrado una ficha pública con ese identificador.',
      networkError: 'No se pudo conectar con el servicio. Verifica el entorno local.',
      serviceError: 'Error en el servicio ({status}).',
      unexpectedError: 'No se pudo cargar el detalle por un error inesperado.',
    },
    notFoundHint: 'Comprueba el enlace o vuelve al listado de fichas publicadas.',
  },
  treeForm: {
    title: 'Alta de árbol',
    description: 'Completa los campos obligatorios para registrar una nueva ficha en el catálogo.',
    loadingMasters: 'Cargando especies y provincias...',
    backHome: 'Volver al inicio',
    submit: 'Crear ficha',
    submitting: 'Guardando...',
    fields: {
      species: {
        label: 'Especie *',
        placeholder: 'Selecciona una especie',
      },
      province: {
        label: 'Provincia *',
        placeholder: 'Selecciona una provincia',
      },
      municipality: {
        label: 'Municipio',
        placeholder: 'Ej.: Madrid, Alcobendas, San Lorenzo de El Escorial',
      },
      description: {
        label: 'Descripción',
        placeholder: 'Opcional. Describe el árbol y el contexto de la observación (máximo 5000 caracteres)',
      },
      latitude: {
        label: 'Latitud *',
        placeholder: 'Ej.: 40.4168 (rango -90 a 90)',
      },
      longitude: {
        label: 'Longitud *',
        placeholder: 'Ej.: -3.7038 (rango -180 a 180)',
      },
      altitude: {
        label: 'Altitud (m)',
        placeholder: 'Opcional. Ej.: 650',
      },
      publicationState: {
        label: 'Estado de publicación',
        options: {
          BORRADOR: 'Borrador',
          PUBLICADO: 'Publicado',
        },
      },
      publicMapVisibility: {
        label: 'Visibilidad en mapa',
        options: {
          PRIVADO: 'Privado (no visible en mapa público)',
          PUBLICO: 'Público (visible en mapa público)',
        },
      },
    },
    validation: {
      speciesRequired: 'Selecciona una especie.',
      provinceRequired: 'Selecciona una provincia.',
      latitudeRequired: 'La latitud es obligatoria.',
      latitudeRange: 'La latitud debe estar entre -90 y 90.',
      longitudeRequired: 'La longitud es obligatoria.',
      longitudeRange: 'La longitud debe estar entre -180 y 180.',
      descriptionMaxLength: 'La descripción no puede superar 5000 caracteres.',
    },
    map: {
      ariaLabel: 'Mapa de vista previa: doble clic para elegir coordenadas',
      attributionPrefix: 'Datos del mapa © ',
      openStreetMapLabel: 'OpenStreetMap',
      attributionSuffix: ' y colaboradores. Uso de teselas sujeto a la política de OpenStreetMap.',
    },
    photos: {
      title: 'Fotografías',
      help: 'Selecciona hasta {maxPhotos} imágenes ({allowed}), máximo {maxMb} MB por archivo.',
      chooseFiles: 'Elegir archivos…',
      selectedCount: '{count} de {max} seleccionada(s)',
      inputAriaLabel: 'Seleccionar fotografías del árbol',
      empty: 'Todavía no has seleccionado fotografías.',
      mainBadge: 'Foto principal',
      exifApplied: 'Coordenadas actualizadas desde la primera fotografía (EXIF/GPS).',
      remove: 'Quitar',
      validation: {
        maxPhotos: 'Solo se permiten {max} fotografías por árbol.',
        invalidMime: '{fileName}: formato no permitido. Tipos válidos: {allowed}.',
        maxFileSize: '{fileName}: supera el tamaño máximo de {maxMb} MB.',
      },
    },
    messages: {
      mastersEmpty: 'No hay datos maestros disponibles para completar el formulario.',
      created: 'Ficha creada correctamente con id {treeId}.',
      createdWithPhotos: 'Ficha creada con id {treeId}. Las fotografías se han asociado correctamente.',
      photoStorageUploadFailed:
        'La ficha se creó, pero la subida al almacén de objetos falló (código {status}). Comprueba MinIO/CORS o inténtalo de nuevo.',
      forbidden: 'No tiene permiso para realizar esta operación.',
      unexpectedError: 'No se pudo completar el alta por un error inesperado.',
      networkError: 'No se pudo conectar con el servicio. Verifica tu conexión o el entorno local.',
      unauthorized: 'Tu sesión no es válida o ha caducado. Inicia sesión de nuevo para continuar.',
      badRequest: 'Revisa los datos del formulario; hay campos no válidos.',
      serviceError: 'Error en el servicio ({status}).',
    },
  },
} as const

export type MessageSchema = typeof es
