import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { rolesService, type Permission, type Role } from "../services/rolesService";

export function RolesPage() {
   const [roles, setRoles] = useState<Role[]>([]);
   const [permissions, setPermissions] = useState<Permission[]>([]);
   const [draft, setDraft] = useState<Record<number, string[]>>({});
   const [error, setError] = useState<string | null>(null);
   const [savedRoleId, setSavedRoleId] = useState<number | null>(null);

   function reload() {
      Promise.all([rolesService.listRoles(), rolesService.listPermissions()])
         .then(([roleList, permissionList]) => {
            setRoles(roleList);
            setPermissions(permissionList);
            setDraft(Object.fromEntries(roleList.map((r) => [r.id, r.permissions])));
         })
         .catch(() => setError("No se pudo cargar roles y permisos"));
   }

   useEffect(reload, []);

   function togglePermission(roleId: number, codigo: string) {
      setDraft((prev) => {
         const current = prev[roleId] ?? [];
         const next = current.includes(codigo)
            ? current.filter((c) => c !== codigo)
            : [...current, codigo];
         return { ...prev, [roleId]: next };
      });
   }

   async function handleSave(roleId: number) {
      setError(null);
      setSavedRoleId(null);
      try {
         await rolesService.updateRolePermissions(roleId, draft[roleId] ?? []);
         setSavedRoleId(roleId);
         reload();
      } catch {
         setError("No se pudo guardar el rol");
      }
   }

   return (
      <main>
         <h1>Roles y permisos</h1>
         {error && <p role="alert">{error}</p>}

         {roles.map((role) => (
            <section key={role.id}>
               <h2>{role.nombre}</h2>
               <div
                  style={{
                     display: "grid",
                     gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                     gap: 8,
                     marginBottom: 14,
                  }}
               >
                  {permissions.map((permission) => (
                     <label
                        key={permission.codigo}
                        style={{ flexDirection: "row", alignItems: "center", fontWeight: 400 }}
                     >
                        <input
                           type="checkbox"
                           checked={(draft[role.id] ?? []).includes(permission.codigo)}
                           onChange={() => togglePermission(role.id, permission.codigo)}
                        />
                        {permission.codigo}
                     </label>
                  ))}
               </div>
               <Button onClick={() => handleSave(role.id)}>Guardar</Button>
               {savedRoleId === role.id && (
                  <span style={{ marginLeft: 10, color: "var(--success)" }}>Guardado</span>
               )}
            </section>
         ))}
      </main>
   );
}
