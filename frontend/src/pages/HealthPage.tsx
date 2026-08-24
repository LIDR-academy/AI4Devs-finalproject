import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { useAuth } from "../auth/AuthContext";
import { httpClient } from "../services/httpClient";

type HealthResponse = {
   service: string;
   database: "ok" | "unreachable";
};

const SHORTCUTS = [
   { to: "/empresas", icon: "🏢", label: "Empresas", desc: "Buscar y recuperar empresas del ERP" },
   { to: "/clientes", icon: "👤", label: "Clientes", desc: "Registrar y consultar clientes" },
   { to: "/reportes", icon: "📊", label: "Reportes", desc: "Adeudo, pagos y catalogo de reportes" },
   { to: "/users", icon: "🔑", label: "Usuarios", desc: "Administrar usuarios y roles" },
   { to: "/auditoria", icon: "🗒️", label: "Auditoria", desc: "Bitacora de acciones sensibles" },
];

export function HealthPage() {
   const { user } = useAuth();
   const [health, setHealth] = useState<HealthResponse | null>(null);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      httpClient
         .get<HealthResponse>("/api/health")
         .then(setHealth)
         .catch((err: Error) => setError(err.message));
   }, []);

   return (
      <main>
         <h1>Hola{user ? `, ${user.nombre || user.email}` : ""}</h1>
         <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
            Panel de EyeMaster V2 — centraliza la operacion comercial y financiera de ADMIN y
            PEOPLE.
         </p>

         <section style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 600 }}>Estado del sistema:</span>
            {error && <Badge tone="danger">Backend inalcanzable</Badge>}
            {health && (
               <Badge tone={health.database === "ok" ? "success" : "danger"}>
                  base de datos {health.database}
               </Badge>
            )}
         </section>

         <section>
            <h2>Accesos rapidos</h2>
            <div
               style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 14,
               }}
            >
               {SHORTCUTS.map((shortcut) => (
                  <Link
                     key={shortcut.to}
                     to={shortcut.to}
                     style={{
                        display: "block",
                        padding: 16,
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        textDecoration: "none",
                        color: "var(--text)",
                     }}
                  >
                     <div style={{ fontSize: 22, marginBottom: 6 }}>{shortcut.icon}</div>
                     <div style={{ fontWeight: 600, color: "var(--text-h)" }}>
                        {shortcut.label}
                     </div>
                     <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {shortcut.desc}
                     </div>
                  </Link>
               ))}
            </div>
         </section>
      </main>
   );
}
