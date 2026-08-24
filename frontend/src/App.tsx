import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { AuditLogPage } from "./pages/AuditLogPage";
import { ClientsPage } from "./pages/ClientsPage";
import { CompaniesPage } from "./pages/CompaniesPage";
import { CompanyDetailPage } from "./pages/CompanyDetailPage";
import { GroupsPage } from "./pages/GroupsPage";
import { HealthPage } from "./pages/HealthPage";
import { LoginPage } from "./pages/LoginPage";
import { PlanCatalogPage } from "./pages/PlanCatalogPage";
import { ReportsPage } from "./pages/ReportsPage";
import { RolesPage } from "./pages/RolesPage";
import { UsersPage } from "./pages/UsersPage";

function App() {
   return (
      <BrowserRouter>
         <AuthProvider>
            <Routes>
               <Route path="/login" element={<LoginPage />} />
               <Route
                  path="/"
                  element={
                     <RequireAuth>
                        <HealthPage />
                     </RequireAuth>
                  }
               />
               <Route
                  path="/users"
                  element={
                     <RequireAuth>
                        <UsersPage />
                     </RequireAuth>
                  }
               />
               <Route
                  path="/roles"
                  element={
                     <RequireAuth>
                        <RolesPage />
                     </RequireAuth>
                  }
               />
               <Route
                  path="/auditoria"
                  element={
                     <RequireAuth>
                        <AuditLogPage />
                     </RequireAuth>
                  }
               />
               <Route
                  path="/clientes"
                  element={
                     <RequireAuth>
                        <ClientsPage />
                     </RequireAuth>
                  }
               />
               <Route
                  path="/empresas"
                  element={
                     <RequireAuth>
                        <CompaniesPage />
                     </RequireAuth>
                  }
               />
               <Route
                  path="/empresas/:id"
                  element={
                     <RequireAuth>
                        <CompanyDetailPage />
                     </RequireAuth>
                  }
               />
               <Route
                  path="/grupos"
                  element={
                     <RequireAuth>
                        <GroupsPage />
                     </RequireAuth>
                  }
               />
               <Route
                  path="/planes"
                  element={
                     <RequireAuth>
                        <PlanCatalogPage />
                     </RequireAuth>
                  }
               />
               <Route
                  path="/reportes"
                  element={
                     <RequireAuth>
                        <ReportsPage />
                     </RequireAuth>
                  }
               />
            </Routes>
         </AuthProvider>
      </BrowserRouter>
   );
}

export default App;
