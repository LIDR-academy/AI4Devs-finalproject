import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Badge } from "../components/Badge";
import { Table, type TableColumn } from "../components/Table";
import { Button } from "../components/Button";
import { PasswordInput } from "../components/PasswordInput";
import { Select } from "../components/Select";
import { usersService, type UserRecord } from "../services/usersService";

const ROLE_OPTIONS = [
   { value: "administrador", label: "administrador" },
   { value: "operador", label: "operador" },
   { value: "ejecutivo", label: "ejecutivo" },
];

export function UsersPage() {
   const [users, setUsers] = useState<UserRecord[]>([]);
   const [email, setEmail] = useState("");
   const [nombre, setNombre] = useState("");
   const [password, setPassword] = useState("");
   const [rol, setRol] = useState("operador");
   const [error, setError] = useState<string | null>(null);

   function reload() {
      usersService.list().then(setUsers).catch(() => setError("No se pudo cargar la lista"));
   }

   useEffect(reload, []);

   async function handleCreate(event: FormEvent) {
      event.preventDefault();
      setError(null);
      try {
         await usersService.create({ email, nombre, password, rol });
         setEmail("");
         setNombre("");
         setPassword("");
         reload();
      } catch {
         setError("No se pudo crear el usuario");
      }
   }

   async function handleToggleActive(user: UserRecord) {
      setError(null);
      try {
         await usersService.setActive(user.id, !user.activo);
         reload();
      } catch {
         setError("No se pudo cambiar el estado (¿es el ultimo administrador activo?)");
      }
   }

   async function handleChangeRole(user: UserRecord, newRole: string) {
      setError(null);
      try {
         await usersService.setRole(user.id, newRole);
         reload();
      } catch {
         setError("No se pudo cambiar el rol");
      }
   }

   const columns: TableColumn<UserRecord>[] = [
      { key: "email", header: "Email", render: (u) => u.email },
      { key: "nombre", header: "Nombre", render: (u) => u.nombre },
      {
         key: "rol",
         header: "Rol",
         render: (u) => (
            <Select
               value={u.rol}
               onChange={(e) => handleChangeRole(u, e.target.value)}
               options={ROLE_OPTIONS}
            />
         ),
      },
      {
         key: "activo",
         header: "Estado",
         render: (u) => (
            <Badge tone={u.activo ? "success" : "danger"}>
               {u.activo ? "activo" : "inactivo"}
            </Badge>
         ),
      },
      {
         key: "acciones",
         header: "Acciones",
         render: (u) => (
            <Button variant="secondary" onClick={() => handleToggleActive(u)}>
               {u.activo ? "Desactivar" : "Activar"}
            </Button>
         ),
      },
   ];

   return (
      <main>
         <h1>Usuarios</h1>
         {error && <p role="alert">{error}</p>}

         <section>
            <h2>Usuarios registrados</h2>
            <Table
               columns={columns}
               rows={users}
               rowKey={(u) => String(u.id)}
               emptyMessage="Sin usuarios"
            />
         </section>

         <section>
            <h2>Nuevo usuario</h2>
            <form onSubmit={handleCreate}>
               <label>
                  Email
                  <input value={email} onChange={(e) => setEmail(e.target.value)} required />
               </label>
               <label>
                  Nombre
                  <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
               </label>
               <label>
                  Password
                  <PasswordInput
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                  />
               </label>
               <label>
                  Rol
                  <Select value={rol} onChange={(e) => setRol(e.target.value)} options={ROLE_OPTIONS} />
               </label>
               <Button type="submit">Crear</Button>
            </form>
         </section>
      </main>
   );
}
