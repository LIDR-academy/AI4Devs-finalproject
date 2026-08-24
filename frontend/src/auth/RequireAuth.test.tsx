import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RequireAuth } from "./RequireAuth";
import * as AuthContext from "./AuthContext";

function renderWithRoute() {
   return render(
      <MemoryRouter initialEntries={["/"]}>
         <Routes>
            <Route path="/login" element={<p>Login screen</p>} />
            <Route
               path="/"
               element={
                  <RequireAuth>
                     <p>Protected content</p>
                  </RequireAuth>
               }
            />
         </Routes>
      </MemoryRouter>,
   );
}

describe("RequireAuth", () => {
   it("redirects unauthenticated users to /login", () => {
      vi.spyOn(AuthContext, "useAuth").mockReturnValue({
         user: null,
         isLoading: false,
         isAuthenticated: false,
         login: vi.fn(),
         logout: vi.fn(),
      });

      renderWithRoute();

      expect(screen.getByText("Login screen")).toBeInTheDocument();
   });

   it("renders protected content for authenticated users", () => {
      vi.spyOn(AuthContext, "useAuth").mockReturnValue({
         user: { id: 1, email: "a@b.com", nombre: "A", rol: "operador", permissions: [] },
         isLoading: false,
         isAuthenticated: true,
         login: vi.fn(),
         logout: vi.fn(),
      });

      renderWithRoute();

      expect(screen.getByText("Protected content")).toBeInTheDocument();
   });
});
