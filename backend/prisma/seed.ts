import "dotenv/config";
import { PrismaClient, EjeVertical, EstadoAcceso } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://latearte_user:latearte_pass@localhost:5433/latearte_db?schema=public';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando Seeding del Catálogo Cultural...');

  // 1. Crear Plataformas
  const youtube = await prisma.plataformaOrigen.upsert({
    where: { nombre: 'YouTube' },
    update: {},
    create: {
      nombre: 'YouTube',
      url_base: 'https://youtube.com',
      permite_iframe: true,
      logo_url: 'https://cdn.pixabay.com/photo/2016/07/03/18/48/youtube-1495277_960_720.png',
    },
  });

  const mubi = await prisma.plataformaOrigen.upsert({
    where: { nombre: 'MUBI' },
    update: {},
    create: {
      nombre: 'MUBI',
      url_base: 'https://mubi.com',
      permite_iframe: false,
      logo_url: 'https://images.mubi.com/favicon.ico',
    },
  });

  const vimeo = await prisma.plataformaOrigen.upsert({
    where: { nombre: 'Vimeo' },
    update: {},
    create: {
      nombre: 'Vimeo',
      url_base: 'https://vimeo.com',
      permite_iframe: true,
      logo_url: 'https://vimeo.com/favicon.ico',
    },
  });

  // 2. Crear Obras (MVP - Requisito US1: Dial de Tiempo y Moods)
  const obras = [
    // --- SHORT LIST (8+ obras <= 15 min) ---
    {
      titulo: 'Spring - Blender Open Movie',
      director: 'Blender Studio',
      duracion_min: 10,
      vibe_mood: 'Inspirador',
      eje_vertical: EjeVertical.SHORT_LIST,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=WhWc3b3KhnY',
    },
    {
      titulo: 'Caminandes 3: Llamigos',
      director: 'Pablo Vazquez',
      duracion_min: 3,
      vibe_mood: 'Dinámico',
      eje_vertical: EjeVertical.SHORT_LIST,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=SkVqJ1SGeL0',
    },
    {
      titulo: 'Sintel',
      director: 'Colin Levy',
      duracion_min: 15,
      vibe_mood: 'Melancólico',
      eje_vertical: EjeVertical.SHORT_LIST,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=eRsGyueVLvQ',
    },
    {
      titulo: 'Big Buck Bunny',
      director: 'Sacha Goedegebure',
      duracion_min: 10,
      vibe_mood: 'Dinámico',
      eje_vertical: EjeVertical.SHORT_LIST,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    },
    {
      titulo: 'Los Domingos No Se Trabaja',
      director: 'Gato Andino Films',
      duracion_min: 12,
      vibe_mood: 'Inspirador',
      eje_vertical: EjeVertical.SHORT_LIST,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=6jYlzu3RG5Y',
    },
    {
      titulo: 'Elephants Dream (2006)',
      director: 'Cinema Movie On',
      duracion_min: 11,
      vibe_mood: 'Contemplativo',
      eje_vertical: EjeVertical.SHORT_LIST,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=ro5ly5US1cY',
    },
    {
      titulo: '舌 Tongue',
      director: 'Kaho Yoshida',
      duracion_min: 2,
      vibe_mood: 'Dinámico',
      eje_vertical: EjeVertical.SHORT_LIST,
      estado_acceso: EstadoAcceso.SUSCRIPCION,
      plataforma_id: vimeo.id,
      url_contenido: 'https://vimeo.com/771846252',
    },
    {
      titulo: 'Butterfly Kiss',
      director: 'Fabian&Fred',
      duracion_min: 10,
      vibe_mood: 'Dinámico',
      eje_vertical: EjeVertical.SHORT_LIST,
      estado_acceso: EstadoAcceso.SUSCRIPCION,
      plataforma_id: vimeo.id,
      url_contenido: 'https://vimeo.com/1134227674',
    },
    {
      titulo: 'Turkish makam meets carnatic',
      director: 'Makam New York',
      duracion_min: 9,
      vibe_mood: 'Contemplativo',
      eje_vertical: EjeVertical.SHORT_LIST,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: vimeo.id,
      url_contenido: 'https://vimeo.com/979182568',
    },
    {
      titulo: 'La Jetée',
      director: 'Chris Marker',
      duracion_min: 28,
      vibe_mood: 'Melancólico',
      eje_vertical: EjeVertical.SHORT_LIST,
      estado_acceso: EstadoAcceso.SUSCRIPCION,
      plataforma_id: mubi.id,
      url_contenido: 'https://mubi.com/films/la-jetee',
    },

    // --- STAGE (Conciertos, Jazz, Escénicas) ---
    {
      titulo: 'Snarky Puppy: Lingus',
      director: 'Michael League',
      duracion_min: 10,
      vibe_mood: 'Dinámico',
      eje_vertical: EjeVertical.STAGE,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=L_XJ_s5IsQc',
    },
    {
      titulo: 'Bolero de Ravel',
      director: 'Opera de Paris',
      duracion_min: 17,
      vibe_mood: 'Inspirador',
      eje_vertical: EjeVertical.STAGE,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=r30D3SW4OVw',
    },
    {
      titulo: 'Miles Davis: So What',
      director: 'Miles Davis Group',
      duracion_min: 9,
      vibe_mood: 'Dinámico',
      eje_vertical: EjeVertical.STAGE,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=zqNTltOGh5c',
    },
    {
      titulo: 'Entre dos Aguas (Homenaje a Paco de Lucía)',
      director: 'Barcelona Guitar Trio',
      duracion_min: 6,
      vibe_mood: 'Dinámico',
      eje_vertical: EjeVertical.STAGE,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=xsTNn_oyToM',
    },
    {
      titulo: 'Vivaldi: The Four Seasons',
      director: 'I Musici de Montreal',
      duracion_min: 42,
      vibe_mood: 'Inspirador',
      eje_vertical: EjeVertical.STAGE,
      estado_acceso: EstadoAcceso.VOD,
      plataforma_id: mubi.id,
      url_contenido: 'https://mubi.com/es/co/films/four-seasons-1996',
    },

    // --- CINEMA (Indie, Clásicos, Festivals) ---
    {
      titulo: 'Metropolis (1927) Colorized & Remastered 4K',
      director: 'Mr MW',
      duracion_min: 148,
      vibe_mood: 'Contemplativo',
      eje_vertical: EjeVertical.CINEMA,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=JgKDeTzrNqM',
    },
    {
      titulo: 'The Cabinet of Dr. Caligari (1920) Robert Wiene',
      director: 'Storia del Cinema',
      duracion_min: 72,
      vibe_mood: 'Contemplativo',
      eje_vertical: EjeVertical.CINEMA,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=Ug_4693nsjM',
    },
    {
      titulo: 'Nosferatu (1922)',
      director: 'F.W. Murnau',
      duracion_min: 94,
      vibe_mood: 'Melancólico',
      eje_vertical: EjeVertical.CINEMA,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=LVV7UutK0Xk',
    },
    {
      titulo: 'A Trip to the Moon (1902)',
      director: 'Georges Méliès',
      duracion_min: 13,
      vibe_mood: 'Dinámico',
      eje_vertical: EjeVertical.CINEMA,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=ZNAHcMMOHE8',
    },
    {
      titulo: 'Sherlock Jr. (Keaton)',
      director: 'Buster Keaton',
      duracion_min: 45,
      vibe_mood: 'Dinámico',
      eje_vertical: EjeVertical.CINEMA,
      estado_acceso: EstadoAcceso.SUSCRIPCION,
      plataforma_id: mubi.id,
      url_contenido: 'https://mubi.com/films/sherlock-jr',
    },
    {
      titulo: 'The General (Restored)',
      director: 'Buster Keaton',
      duracion_min: 78,
      vibe_mood: 'Dinámico',
      eje_vertical: EjeVertical.CINEMA,
      estado_acceso: EstadoAcceso.VOD,
      plataforma_id: mubi.id,
      url_contenido: 'https://mubi.com/films/the-general',
    },
    {
      titulo: 'Cinema Paradiso',
      director: 'Giuseppe Tornatore',
      duracion_min: 124,
      vibe_mood: 'Melancólico',
      eje_vertical: EjeVertical.CINEMA,
      estado_acceso: EstadoAcceso.SUSCRIPCION,
      plataforma_id: mubi.id,
      url_contenido: 'https://mubi.com/films/cinema-paradiso',
    },
    {
      titulo: 'Eric Legnini & Afrojazzbeat - LIVE 2014 @ Cabaret Sauvage SD',
      director: 'Anteprima Productions',
      duracion_min: 60,
      vibe_mood: 'Dinámico',
      eje_vertical: EjeVertical.STAGE,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=rTWYl0f-T2E',
    },
    {
      titulo: "Line Riders - Beethoven's 5th",
      director: 'DoodleChaos',
      duracion_min: 6,
      vibe_mood: 'Contemplativo',
      eje_vertical: EjeVertical.SHORT_LIST,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=vcBn04IyELc',
    },
    {
      titulo: 'Agent 327: Operation Barbershop',
      director: 'Blender Studio',
      duracion_min: 4,
      vibe_mood: 'Dinámico',
      eje_vertical: EjeVertical.SHORT_LIST,
      estado_acceso: EstadoAcceso.ABIERTO,
      plataforma_id: youtube.id,
      url_contenido: 'https://www.youtube.com/watch?v=mN0zPOpADL4',
    },
  ];

  for (const obra of obras) {
    await prisma.obra.upsert({
      where: { id: `seed-${obra.titulo.toLowerCase().replace(/ /g, '-')}` }, // Usando un ID estable para el seed
      update: { ...obra }, // Actualizamos todo para asegurar enlaces vigentes
      create: {
        id: `seed-${obra.titulo.toLowerCase().replace(/ /g, '-')}`,
        ...obra,
      },
    });
  }

  console.log('✅ Seeding completado con éxito. 20 obras cargadas.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
