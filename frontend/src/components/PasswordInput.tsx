import { useState } from "react";
import type { InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput(props: PasswordInputProps) {
   const [visible, setVisible] = useState(false);

   return (
      <div className="password-field">
         <input type={visible ? "text" : "password"} {...props} />
         <button
            type="button"
            className="password-toggle"
            aria-label={visible ? "Ocultar contrasena" : "Mostrar contrasena"}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
            tabIndex={-1}
         >
            {visible ? "🙈" : "👁️"}
         </button>
      </div>
   );
}
