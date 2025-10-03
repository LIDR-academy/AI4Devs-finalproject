"use client"

import MainLayout from "../../src/components/MainLayout"
import LoginForm from "../../src/components/LoginForm"
import { useRouter } from "next/navigation"
import { authService } from "../../src/services/authService"
import AuthRedirect from "../../src/components/AuthRedirect" // Importar el componente



export default function LoginPage() {
  const router = useRouter()

  const handleLoginSubmit = async (data: any) => {
    try {
      // Envía los datos al servicio de login (incluye isDoctor, email y password)
      await authService.login(data)
      // Aquí podrías validar el rol si lo necesitas para la redirección
      // Ejemplo: if (data.isDoctor) { ... }
      // Pero por ahora solo redirige si es paciente
      if (!data.isDoctor) {
        // Mostrar mensaje de éxito antes de redirigir (esto se implementa en el formulario)
        // Redirige al portal de inicio
        router.push("/")
      }
      // Si data.isDoctor es true, no se hace nada por ahora
    } catch (error) {
      throw error // Propaga el error para que LoginForm lo maneje y muestre el toast
    }
  }

  const handleRegisterClick = () => {
    router.push("/register")
  }

  return (
    <MainLayout>
      {/* Componente que verifica si hay una sesión activa y redirige */}
      <AuthRedirect />
      <div className="min-h-screen bg-gradient-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-primary rounded-2xl p-8 lg:p-12 shadow-custom">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Inicio de sesión</h1>
                    <p className="text-non-photo-blue">Accede a tu cuenta de Buscadoc</p>
                  </div>
                  <LoginForm onSubmit={handleLoginSubmit} onRegisterClick={handleRegisterClick} />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex items-center justify-center">
              <div className="bg-gradient-to-br from-pacific-cyan to-non-photo-blue rounded-2xl overflow-hidden shadow-custom flex items-center justify-center w-full h-full min-h-[400px] lg:min-h-[600px]">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src="/images/login-hero.jpg"
                    alt="Profesional médico usando la aplicación Buscadoc en su teléfono móvil"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-federal-blue/20 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}