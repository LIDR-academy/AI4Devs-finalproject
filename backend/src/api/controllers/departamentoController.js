const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Controlador para departamentos
 */

/**
 * Obtener todos los departamentos
 * GET /api/departamentos
 * 
 * Query parameters:
 * - activo: Filtro por estado activo (true/false)
 * - search: Búsqueda por nombre o descripción
 * - sort_by: Campo de ordenamiento (nombre, createdAt)
 * - sort_order: asc/desc
 * - offset: Desplazamiento para paginación
 * - limit: Límite de resultados
 */
const getDepartamentos = async (req, res) => {
  try {
    const {
      activo,
      search,
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
    
    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    // Filtro de búsqueda por nombre o descripción
    if (search) {
      where.OR = [
        {
          nombre: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          descripcion: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Validar campo de ordenamiento
    const validSortFields = ['nombre', 'createdAt'];
    const sortBy = validSortFields.includes(sort_by) ? sort_by : 'nombre';
    const sortOrder = sort_order === 'desc' ? 'desc' : 'asc';

    // Obtener departamentos
    const [departamentos, total] = await Promise.all([
      prisma.departamento.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: parsedOffset,
        take: parsedLimit,
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          activo: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.departamento.count({ where })
    ]);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedOffset / parsedLimit) + 1;

    return res.status(200).json({
      success: true,
      message: 'Departamentos obtenidos correctamente',
      data: {
        departamentos,
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
    console.error('Error en getDepartamentos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener departamentos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener un departamento específico por ID
 * GET /api/departamentos/:id
 */
const getDepartamentoById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    const departamentoId = parseInt(id);
    if (isNaN(departamentoId) || departamentoId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de departamento inválido'
      });
    }

    // Obtener departamento
    const departamento = await prisma.departamento.findUnique({
      where: { id: departamentoId },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
        // Incluir información adicional si es necesario
        _count: {
          select: {
            matrizAfinidades: true
          }
        }
      }
    });

    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Departamento obtenido correctamente',
      data: departamento
    });

  } catch (error) {
    console.error('Error en getDepartamentoById:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el departamento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener estadísticas de departamentos
 * GET /api/departamentos/stats
 */
const getDepartamentoStats = async (req, res) => {
  try {
    // Obtener estadísticas básicas
    const [totalDepartamentos, departamentosActivos] = await Promise.all([
      prisma.departamento.count(),
      prisma.departamento.count({ where: { activo: true } })
    ]);

    // Obtener departamentos con mayor cantidad de afinidades
    const departamentosConAfinidades = await prisma.departamento.findMany({
      select: {
        id: true,
        nombre: true,
        _count: {
          select: {
            matrizAfinidades: true
          }
        }
      },
      orderBy: {
        matrizAfinidades: {
          _count: 'desc'
        }
      },
      take: 5
    });

    const stats = {
      total_departamentos: totalDepartamentos,
      departamentos_activos: departamentosActivos,
      departamentos_inactivos: totalDepartamentos - departamentosActivos,
      top_departamentos_con_afinidades: departamentosConAfinidades.map(dept => ({
        id: dept.id,
        nombre: dept.nombre,
        total_afinidades: dept._count.matrizAfinidades
      }))
    };

    return res.status(200).json({
      success: true,
      message: 'Estadísticas de departamentos obtenidas correctamente',
      data: stats
    });

  } catch (error) {
    console.error('Error en getDepartamentoStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDepartamentos,
  getDepartamentoById,
  getDepartamentoStats
}; 