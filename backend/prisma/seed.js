/**
 * Script de semillas para poblar la base de datos con datos iniciales
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando proceso de sembrado (seeding)...');

  // Crear departamentos
  const departamentos = await Promise.all([
    prisma.departamento.upsert({
      where: { nombre: 'Tecnología' },
      update: {},
      create: {
        nombre: 'Tecnología',
        descripcion: 'Departamento de Tecnología e Innovación',
        activo: true
      }
    }),
    prisma.departamento.upsert({
      where: { nombre: 'Marketing' },
      update: {},
      create: {
        nombre: 'Marketing',
        descripcion: 'Departamento de Marketing y Comunicación',
        activo: true
      }
    }),
    prisma.departamento.upsert({
      where: { nombre: 'Ventas' },
      update: {},
      create: {
        nombre: 'Ventas',
        descripcion: 'Departamento de Ventas y Desarrollo de Negocio',
        activo: true
      }
    }),
    prisma.departamento.upsert({
      where: { nombre: 'Recursos Humanos' },
      update: {},
      create: {
        nombre: 'Recursos Humanos',
        descripcion: 'Departamento de Recursos Humanos',
        activo: true
      }
    }),
    prisma.departamento.upsert({
      where: { nombre: 'Finanzas' },
      update: {},
      create: {
        nombre: 'Finanzas',
        descripcion: 'Departamento de Finanzas y Contabilidad',
        activo: true
      }
    }),
    prisma.departamento.upsert({
      where: { nombre: 'Operaciones' },
      update: {},
      create: {
        nombre: 'Operaciones',
        descripcion: 'Departamento de Operaciones',
        activo: true
      }
    }),
    prisma.departamento.upsert({
      where: { nombre: 'Atención al Cliente' },
      update: {},
      create: {
        nombre: 'Atención al Cliente',
        descripcion: 'Departamento de Atención al Cliente',
        activo: true
      }
    }),
    prisma.departamento.upsert({
      where: { nombre: 'Producto' },
      update: {},
      create: {
        nombre: 'Producto',
        descripcion: 'Departamento de Gestión de Producto',
        activo: true
      }
    }),
  ]);

  console.log(`${departamentos.length} departamentos creados o actualizados`);

  // Crear equipos
  const equipos = await Promise.all([
    prisma.equipo.upsert({
      where: { nombre: 'Dev 01' },
      update: {},
      create: {
        nombre: 'Dev 01',
        tipo: 'INTERNO',
        capacidad: 2.0,
        activo: true
      }
    }),
    prisma.equipo.upsert({
      where: { nombre: 'Dev 03' },
      update: {},
      create: {
        nombre: 'Dev 03',
        tipo: 'INTERNO',
        capacidad: 2.0,
        activo: true
      }
    }),
    prisma.equipo.upsert({
      where: { nombre: 'Dev 05' },
      update: {},
      create: {
        nombre: 'Dev 05',
        tipo: 'INTERNO',
        capacidad: 2.0,
        activo: true
      }
    }),
    prisma.equipo.upsert({
      where: { nombre: 'Equipo Externo 1' },
      update: {},
      create: {
        nombre: 'Equipo Externo 1',
        tipo: 'EXTERNO',
        capacidad: 2.0,
        activo: true
      }
    }),
    prisma.equipo.upsert({
      where: { nombre: 'Equipo Externo 2' },
      update: {},
      create: {
        nombre: 'Equipo Externo 2',
        tipo: 'EXTERNO',
        capacidad: 2.0,
        activo: true
      }
    }),
  ]);

  console.log(`${equipos.length} equipos creados o actualizados`);

  // Crear matriz de afinidad
  const afinidades = [];
  for (const departamento of departamentos) {
    for (const equipo of equipos) {
      // Generar un nivel de afinidad aleatorio entre 1 y 5
      const nivelAfinidad = Math.floor(Math.random() * 5) + 1;
      
      afinidades.push(
        prisma.matrizAfinidad.upsert({
          where: {
            equipoId_departamentoId: {
              equipoId: equipo.id,
              departamentoId: departamento.id
            }
          },
          update: {
            nivelAfinidad
          },
          create: {
            equipoId: equipo.id,
            departamentoId: departamento.id,
            nivelAfinidad
          }
        })
      );
    }
  }

  await Promise.all(afinidades);
  console.log(`${afinidades.length} afinidades creadas o actualizadas`);

  // Hash para las contraseñas
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // Crear usuarios
  const usuarios = await Promise.all([
    prisma.user.upsert({
      where: { email: 'negocio@taskdistributor.com' },
      update: {},
      create: {
        name: 'Usuario Negocio',
        email: 'negocio@taskdistributor.com',
        password: defaultPasswordHash,
        role: 'NEGOCIO'
      }
    }),
    prisma.user.upsert({
      where: { email: 'tecnologia@taskdistributor.com' },
      update: {},
      create: {
        name: 'Usuario Tecnología',
        email: 'tecnologia@taskdistributor.com',
        password: defaultPasswordHash,
        role: 'TECNOLOGIA'
      }
    }),
    prisma.user.upsert({
      where: { email: 'admin@taskdistributor.com' },
      update: {},
      create: {
        name: 'Administrador',
        email: 'admin@taskdistributor.com',
        password: defaultPasswordHash,
        role: 'ADMIN'
      }
    }),
  ]);

  console.log(`${usuarios.length} usuarios creados o actualizados`);

  // Crear algunas tareas ejemplo
  // Nota: En un caso real, estas tareas estarían sincronizadas con Redmine
  const tareas = await Promise.all([
    prisma.tareaExtended.upsert({
      where: { redmineTaskId: 10001 },
      update: {},
      create: {
        redmineTaskId: 10001,
        ordenPrioridad: 1,
        factorCarga: 1.2,
        estimacionSprints: 2,
        fechaInicioPlanificada: new Date('2025-01-15'),
        fechaFinPlanificada: new Date('2025-02-15')
      }
    }),
    prisma.tareaExtended.upsert({
      where: { redmineTaskId: 10002 },
      update: {},
      create: {
        redmineTaskId: 10002,
        ordenPrioridad: 2,
        factorCarga: 0.8,
        estimacionSprints: 1,
        fechaInicioPlanificada: new Date('2025-02-01'),
        fechaFinPlanificada: new Date('2025-02-20')
      }
    }),
    prisma.tareaExtended.upsert({
      where: { redmineTaskId: 10003 },
      update: {},
      create: {
        redmineTaskId: 10003,
        ordenPrioridad: 3,
        factorCarga: 1.5,
        estimacionSprints: 3,
        fechaInicioPlanificada: new Date('2025-02-15'),
        fechaFinPlanificada: new Date('2025-04-05')
      }
    }),
    prisma.tareaExtended.upsert({
      where: { redmineTaskId: 10004 },
      update: {},
      create: {
        redmineTaskId: 10004,
        ordenPrioridad: null,
        factorCarga: 1.0,
        estimacionSprints: null,
        fechaInicioPlanificada: null,
        fechaFinPlanificada: null
      }
    }),
    prisma.tareaExtended.upsert({
      where: { redmineTaskId: 10005 },
      update: {},
      create: {
        redmineTaskId: 10005,
        ordenPrioridad: null,
        factorCarga: 2.0,
        estimacionSprints: null,
        fechaInicioPlanificada: null,
        fechaFinPlanificada: null
      }
    }),
  ]);

  console.log(`${tareas.length} tareas creadas o actualizadas`);

  // Asignar tareas a equipos (solo las que están planificadas)
  const asignaciones = await Promise.all([
    prisma.asignacion.create({
      data: {
        tareaId: tareas[0].id,
        equipoId: equipos[0].id,
        fechaAsignacion: new Date()
      }
    }),
    prisma.asignacion.create({
      data: {
        tareaId: tareas[1].id,
        equipoId: equipos[1].id,
        fechaAsignacion: new Date()
      }
    }),
    prisma.asignacion.create({
      data: {
        tareaId: tareas[2].id,
        equipoId: equipos[2].id,
        fechaAsignacion: new Date()
      }
    }),
  ]);

  console.log(`${asignaciones.length} asignaciones creadas`);

  // Crear registros de historial de estimación
  // Nota: Estos registros serán particionados por la fecha_cambio
  const historiales = await Promise.all([
    prisma.historialEstimacion.create({
      data: {
        tareaId: tareas[0].id,
        estimacionAnterior: null,
        estimacionNueva: 2,
        factorCargaAnterior: null,
        factorCargaNueva: 1.2,
        usuarioId: usuarios[1].id,
        fechaCambio: new Date('2024-12-25')
      }
    }),
    prisma.historialEstimacion.create({
      data: {
        tareaId: tareas[1].id,
        estimacionAnterior: null,
        estimacionNueva: 1,
        factorCargaAnterior: null,
        factorCargaNueva: 0.8,
        usuarioId: usuarios[1].id,
        fechaCambio: new Date('2024-12-26')
      }
    }),
    prisma.historialEstimacion.create({
      data: {
        tareaId: tareas[2].id,
        estimacionAnterior: 2,
        estimacionNueva: 3,
        factorCargaAnterior: 1.0,
        factorCargaNueva: 1.5,
        usuarioId: usuarios[1].id,
        fechaCambio: new Date('2024-12-27')
      }
    }),
  ]);

  console.log(`${historiales.length} registros de historial creados`);
  
  console.log('Proceso de sembrado completado con éxito.');
  console.log('\nUsuarios creados:');
  console.log('- Admin: admin@taskdistributor.com / password123');
  console.log('- Negocio: negocio@taskdistributor.com / password123');
  console.log('- Tecnología: tecnologia@taskdistributor.com / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error durante el proceso de sembrado:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 