"use client"

import MainLayout from "../../src/components/MainLayout"
import LoginForm from "../../src/components/LoginForm"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const handleLoginSubmit = (data: any) => {
    console.log("[v0] Login attempt:", data)
    setTimeout(() => {
      router.push("/")
    }, 1000)
  }

  const handleRegisterClick = () => {
    router.push("/register")
  }

  return (
    <MainLayout>
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
            <div className="order-1 lg:order-2">
              <div className="bg-gradient-to-br from-pacific-cyan to-non-photo-blue rounded-2xl overflow-hidden shadow-custom">
                <div className="relative h-full min-h-[400px] lg:min-h-[600px]">
                  <img
                    src="/images/login-hero.jpg"
                    alt="Profesional médico usando la aplicación Buscadoc en su teléfono móvil"
                    className="w-full h-full object-cover"
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