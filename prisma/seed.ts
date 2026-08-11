/**
 * Semilla de datos (tarea 1.3 — pendiente).
 *
 * Aquí se cargará el catálogo semilla desde el dataset público de Rebrickable
 * (nombre, año, tema, nº piezas, foto) + edad/dificultad curadas a mano, junto con
 * usuarios de cada rol y copias de ejemplo. De momento es un stub para dejar el
 * pipeline (`prisma db seed`) cableado.
 */
async function main() {
  console.log("[seed] Stub — sin datos todavía (ver tarea 1.3).");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
