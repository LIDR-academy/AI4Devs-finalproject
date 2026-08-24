import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
   variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
   return <button className={`btn btn-${variant} ${className ?? ""}`.trim()} {...props} />;
}
