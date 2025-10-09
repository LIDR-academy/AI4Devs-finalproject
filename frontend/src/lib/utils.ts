import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { jwtDecode } from "jwt-decode"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Decodifica el JWT y retorna el payload con id y role
export function decodeAuthToken() {
  if (typeof window === "undefined") return null
  const token = localStorage.getItem("authToken")
  if (!token) return null
  try {
    const payload = jwtDecode(token)    // Espera campos: id, role, email, etc.
    return payload
  } catch (err) {
    return null
  }
}