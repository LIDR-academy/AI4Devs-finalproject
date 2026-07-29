import Link from "next/link";

export function Navigation() {
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        AuditCare
      </Link>
      <div className="nav-links">
        <Link href="/patients">Pacientes</Link>
        <Link href="/encounters">Encuentros</Link>
        <Link href="/timeline">Timeline</Link>
      </div>
    </nav>
  );
}
