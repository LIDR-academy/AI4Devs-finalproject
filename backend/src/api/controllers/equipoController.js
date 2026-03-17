const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Controlador para equipos
 */

/**
 * Obtener todos los equipos
 * GET /api/equipos
 * 
 * Query parameters:
 * - tipo: Filtro por tipo (INTERNO, EXTERNO)
 * - activo: Filtro por estado activo (true/false)
 * - sort_by: Campo de ordenamiento (nombre, tipo, capacidad, createdAt)
 * - sort_order: asc/desc
 * - offset: Desplazamiento para paginación
 * - limit: Límite de resultados
 */
const getEquipos = async (req, res) => {
  try {
    const {
      tipo,
      activo,
      sort_by = 'nombre',
      sort_order = 'asc',
      offset = 0,
      limit = 100
    } = req.query;

    // Validar parámetros de paginación
    const parsedOffset = Math.max(0, parseInt(offset) || 0);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 100));

    // Construir filtros
    const where = {};
    
    if (tipo && ['INTERNO', 'EXTERNO'].includes(tipo)) {
      where.tipo = tipo;
    }
    
    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    // Validar campo de ordenamiento
    const validSortFields = ['nombre', 'tipo', 'capacidad', 'createdAt'];
    const sortBy = validSortFields.includes(sort_by) ? sort_by : 'nombre';
    const sortOrder = sort_order === 'desc' ? 'desc' : 'asc';

    // Obtener equipos
    const [equipos, total] = await Promise.all([
      prisma.equipo.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: parsedOffset,
        take: parsedLimit,
        select: {
          id: true,
          nombre: true,
          tipo: true,
          capacidad: true,
          activo: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.equipo.count({ where })
    ]);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedOffset / parsedLimit) + 1;

    return res.status(200).json({
      success: true,
      message: 'Equipos obtenidos correctamente',
      data: {
        equipos,
        pagination: {
          total,
          totalPages,
          currentPage,
          limit: parsedLimit,
          offset: parsedOffset,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1
        }
      }
    });

  } catch (error) {
    console.error('Error en getEquipos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener equipos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener un equipo específico por ID
 * GET /api/equipos/:id
 */
const getEquipoById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    const equipoId = parseInt(id);
    if (isNaN(equipoId) || equipoId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de equipo inválido'
      });
    }

    // Obtener equipo
    const equipo = await prisma.equipo.findUnique({
      where: { id: equipoId },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        capacidad: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
        // Incluir información adicional si es necesario
        _count: {
          select: {
            asignaciones: true
          }
        }
      }
    });

    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Equipo obtenido correctamente',
      data: equipo
    });

  } catch (error) {
    console.error('Error en getEquipoById:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el equipo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener estadísticas de equipos
 * GET /api/equipos/stats
 */
const getEquipoStats = async (req, res) => {
  try {
    // Obtener estadísticas básicas
    const [totalEquipos, equiposInternos, equiposExternos, equiposActivos] = await Promise.all([
      prisma.equipo.count(),
      prisma.equipo.count({ where: { tipo: 'INTERNO' } }),
      prisma.equipo.count({ where: { tipo: 'EXTERNO' } }),
      prisma.equipo.count({ where: { activo: true } })
    ]);

    // Calcular capacidad total por tipo
    const capacidadStats = await prisma.equipo.groupBy({
      by: ['tipo'],
      _sum: {
        capacidad: true
      },
      _avg: {
        capacidad: true
      },
      where: {
        activo: true
      }
    });

    const stats = {
      total_equipos: totalEquipos,
      equipos_internos: equiposInternos,
      equipos_externos: equiposExternos,
      equipos_activos: equiposActivos,
      equipos_inactivos: totalEquipos - equiposActivos,
      por_tipo: capacidadStats.reduce((acc, stat) => {
        acc[stat.tipo] = {
          capacidad_total: stat._sum.capacidad || 0,
          capacidad_promedio: stat._avg.capacidad || 0
        };
        return acc;
      }, {})
    };

    return res.status(200).json({
      success: true,
      message: 'Estadísticas de equipos obtenidas correctamente',
      data: stats
    });

  } catch (error) {
    console.error('Error en getEquipoStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener capacidad de equipos con carga actual y disponibilidad futura
 * GET /api/equipos/capacidad
 */
const getCapacidadEquipos = async (req, res) => {
  try {
    // Obtener todos los equipos activos
    const equipos = await prisma.equipo.findMany({
      where: { activo: true },
      include: {
        asignaciones: {
          include: {
            tarea: {
              select: {
                id: true,
                redmineTaskId: true,
                factorCarga: true,
                estimacionSprints: true,
                fechaInicioPlanificada: true,
                fechaFinPlanificada: true
              }
            }
          }
        }
      }
    });

    // Fecha actual y límite de 3 meses hacia el futuro
    const now = new Date();
    const futureLimit = new Date();
    futureLimit.setMonth(futureLimit.getMonth() + 3);

    const capacidadEquipos = equipos.map(equipo => {
      // Filtrar asignaciones activas (tareas en curso o futuras)
      const asignacionesActivas = equipo.asignaciones.filter(asignacion => {
        const tarea = asignacion.tarea;
        // Solo considerar tareas con fechas planificadas
        if (!tarea.fechaFinPlanificada) return false;
        
        // Filtrar tareas que no han terminado aún
        return new Date(tarea.fechaFinPlanificada) >= now;
      });

      // Calcular carga actual total
      const cargaActual = asignacionesActivas.reduce((total, asignacion) => {
        return total + (asignacion.tarea.factorCarga || 0);
      }, 0);

      // Calcular disponibilidad como porcentaje
      const porcentajeOcupacion = equipo.capacidad > 0 ? 
        Math.round((cargaActual / equipo.capacidad) * 100) : 0;

      // Determinar estado de sobrecarga
      let estadoSobrecarga = 'normal';
      if (porcentajeOcupacion > 100) {
        estadoSobrecarga = 'critico';
      } else if (porcentajeOcupacion > 90) {
        estadoSobrecarga = 'advertencia';
      }

      // Calcular próxima fecha disponible
      let proximaFechaDisponible = now;
      if (asignacionesActivas.length > 0) {
        const fechasFinalizacion = asignacionesActivas
          .map(a => new Date(a.tarea.fechaFinPlanificada))
          .filter(fecha => fecha > now)
          .sort((a, b) => a - b);
        
        if (fechasFinalizacion.length > 0) {
          proximaFechaDisponible = fechasFinalizacion[fechasFinalizacion.length - 1];
        }
      }

      // Obtener tareas actuales con información relevante
      const tareasActuales = asignacionesActivas.map(asignacion => ({
        id: asignacion.tarea.id,
        redmineTaskId: asignacion.tarea.redmineTaskId,
        factorCarga: asignacion.tarea.factorCarga,
        estimacionSprints: asignacion.tarea.estimacionSprints,
        fechaInicio: asignacion.tarea.fechaInicioPlanificada,
        fechaFin: asignacion.tarea.fechaFinPlanificada,
        fechaAsignacion: asignacion.fechaAsignacion
      }));

      return {
        id: equipo.id,
        nombre: equipo.nombre,
        tipo: equipo.tipo,
        capacidadTotal: equipo.capacidad,
        cargaActual: cargaActual,
        disponibilidad: Math.max(0, equipo.capacidad - cargaActual),
        porcentajeOcupacion: porcentajeOcupacion,
        estadoSobrecarga: estadoSobrecarga,
        proximaFechaDisponible: proximaFechaDisponible,
        totalTareasAsignadas: asignacionesActivas.length,
        tareasActuales: tareasActuales
      };
    });

    // Ordenar por porcentaje de ocupación descendente
    capacidadEquipos.sort((a, b) => b.porcentajeOcupacion - a.porcentajeOcupacion);

    // Calcular estadísticas generales
    const stats = {
      totalEquipos: capacidadEquipos.length,
      equiposSobrecargados: capacidadEquipos.filter(e => e.estadoSobrecarga === 'critico').length,
      equiposEnAdvertencia: capacidadEquipos.filter(e => e.estadoSobrecarga === 'advertencia').length,
      equiposDisponibles: capacidadEquipos.filter(e => e.estadoSobrecarga === 'normal' && e.disponibilidad > 0).length,
      capacidadTotalSistema: capacidadEquipos.reduce((total, equipo) => total + equipo.capacidadTotal, 0),
      cargaTotalSistema: capacidadEquipos.reduce((total, equipo) => total + equipo.cargaActual, 0)
    };

    return res.status(200).json({
      success: true,
      message: 'Capacidad de equipos obtenida correctamente',
      data: {
        equipos: capacidadEquipos,
        estadisticas: stats,
        fechaConsulta: now,
        periodoAnalisis: {
          desde: now,
          hasta: futureLimit
        }
      }
    });

  } catch (error) {
    console.error('Error en getCapacidadEquipos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener capacidad de equipos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getEquipos,
  getEquipoById,
  getEquipoStats,
  getCapacidadEquipos
}; 