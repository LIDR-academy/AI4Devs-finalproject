export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">AI4Devs Final Project</p>
        <h1>AuditCare Timeline</h1>
        <p>
          MVP para construir una línea temporal clínica auditada a partir de
          notas médicas, con IA, revisión humana y memoria contextual mediante
          Statewave.
        </p>
        <div className="cards">
          <article>
            <h2>Paciente</h2>
            <p>Registro de pacientes sintéticos para pruebas.</p>
          </article>
          <article>
            <h2>Encuentros</h2>
            <p>Ingesta de notas clínicas asociadas al paciente.</p>
          </article>
          <article>
            <h2>Timeline</h2>
            <p>Eventos clínicos estructurados y trazables.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
