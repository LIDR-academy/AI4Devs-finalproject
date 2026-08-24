import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/Button";
import { PasswordInput } from "../components/PasswordInput";

export function LoginPage() {
   const { login } = useAuth();
   const navigate = useNavigate();
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState<string | null>(null);
   const [isSubmitting, setIsSubmitting] = useState(false);

   async function handleSubmit(event: FormEvent) {
      event.preventDefault();
      setError(null);
      setIsSubmitting(true);
      try {
         await login(email, password);
         navigate("/");
      } catch {
         setError("Credenciales invalidas.");
      } finally {
         setIsSubmitting(false);
      }
   }

   return (
      <div className="login-screen">
         <div className="login-card">
            <div className="login-brand">
               <span className="app-brand-mark">EM</span>
               <h1>EyeMaster V2</h1>
            </div>
            <p className="login-subtitle">Ingresa con tu cuenta para continuar.</p>
            <form onSubmit={handleSubmit}>
               <label>
                  Email
                  <input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     autoComplete="username"
                     required
                  />
               </label>
               <label>
                  Password
                  <PasswordInput
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     autoComplete="current-password"
                     required
                  />
               </label>
               {error && <p role="alert">{error}</p>}
               <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Ingresando..." : "Ingresar"}
               </Button>
            </form>
         </div>
      </div>
   );
}
