import { useState } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "./Button";

const NAV_ITEMS = [
   { to: "/", label: "Inicio", icon: "🏠" },
   { to: "/empresas", label: "Empresas", icon: "🏢" },
   { to: "/clientes", label: "Clientes", icon: "👤" },
   { to: "/grupos", label: "Grupos y distribuidores", icon: "🧩" },
   { to: "/planes", label: "Catalogo de planes", icon: "📦" },
   { to: "/reportes", label: "Reportes", icon: "📊" },
   { to: "/users", label: "Usuarios", icon: "🔑" },
   { to: "/roles", label: "Roles y permisos", icon: "🛡️" },
   { to: "/auditoria", label: "Auditoria", icon: "🗒️" },
];

export function AppLayout({ children }: { children: ReactNode }) {
   const { user, logout } = useAuth();
   const [mobileOpen, setMobileOpen] = useState(false);

   return (
      <div className="app-layout">
         <div className="app-topbar">
            <button
               type="button"
               aria-label="Abrir menu"
               onClick={() => setMobileOpen((open) => !open)}
            >
               ☰
            </button>
            <strong>EyeMaster V2</strong>
            <span />
         </div>

         <aside className={mobileOpen ? "app-sidebar open" : "app-sidebar"}>
            <div className="app-brand">
               <span className="app-brand-mark">EM</span>
               EyeMaster V2
            </div>
            <nav className="app-nav">
               {NAV_ITEMS.map((item) => (
                  <NavLink
                     key={item.to}
                     to={item.to}
                     end={item.to === "/"}
                     className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                     onClick={() => setMobileOpen(false)}
                  >
                     <span aria-hidden="true">{item.icon}</span>
                     {item.label}
                  </NavLink>
               ))}
            </nav>
            <div className="app-sidebar-footer">
               {user && <span className="app-user-email">{user.email}</span>}
               <Button variant="secondary" onClick={logout}>
                  Cerrar sesion
               </Button>
            </div>
         </aside>
         <div className="app-sidebar-backdrop" onClick={() => setMobileOpen(false)} />

         <div className="app-main">
            <div className="app-content">{children}</div>
         </div>
      </div>
   );
}
