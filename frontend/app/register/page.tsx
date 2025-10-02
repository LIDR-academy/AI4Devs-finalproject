"use client"

import MainLayout from "../../src/components/MainLayout"
import RegisterForm from "../../src/components/RegisterForm"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { authService } from "../../src/services/authService"
import NotificationToast from "../../src/components/NotificationToast"
import { useTranslation } from "react-i18next"

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [toast, setToast] = useState({ message: "", isVisible: false })
  const [formResetKey, setFormResetKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)


  // Maneja el envío del formulario de registro para paciente y médico especialista
  // Construye el payload según el tipo de usuario y consume el endpoint correspondiente
  // Muestra notificaciones internacionalizadas y redirige tras éxito
  const handleRegisterSubmit = async (data: any) => {
    console.log("Formulario enviado:", data);  // Depuración
    console.log("¿Es doctor?", data.isDoctor);  // Depuración

    setIsLoading(true)
    try {
      console.log("Preparando payload para enviar"); // Depuración
      // Construcción dinámica del payload según los campos requeridos por el API
      const payload: any = {
        firstName: data.firstName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }
      // Agregar opcionales si existen
      if (data.lastName && data.lastName.trim() !== "") payload.lastName = data.lastName
      if (data.phone && data.phone.trim() !== "") payload.phone = data.phone

      // Selecciona el endpoint según el tipo de usuario
      if (data.isDoctor) {
        // Si es doctor, incluir la cédula profesional y enviar al endpoint de doctores
        payload.licenseNumber = data.professionalId
        await authService.registerDoctor(payload);
      } else {
        // Si es paciente, enviar al endpoint de pacientes
        await authService.registerPatient(payload);
      }
      
      // Notificación de éxito y limpieza/redirección
      setToast({ message: t("auth.registerSuccess"), isVisible: true })
      setFormResetKey((prev) => prev + 1)
      setTimeout(() => {
        setToast({ message: "", isVisible: false })
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      // Mostrar mensaje de error internacionalizado
      console.error("Error en registro:", error); // Depuración del error
      let errorMsg = t("auth.registerError")
      if (error?.payload?.error?.length) {
        errorMsg = error.payload.error
          .map((err: string) => t(`auth.${err}`, err))
          .join(", ")
      } else if (error?.message) {
        errorMsg = t(`auth.${error.message}`, error.message)
      }
      setToast({ message: errorMsg, isVisible: true })
      setTimeout(() => setToast({ message: "", isVisible: false }), 3000)
    }
    finally {
      setIsLoading(false)
    }
  }

  const handleLoginClick = () => {
    router.push("/login")
  }

  return (
    <MainLayout>
      <NotificationToast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ message: "", isVisible: false })}
      />
      <div className="min-h-screen bg-gradient-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-primary rounded-2xl p-8 lg:p-12 shadow-custom">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Registro</h1>
                    <p className="text-non-photo-blue">Crea tu cuenta en Buscadoc</p>
                  </div>
                  <RegisterForm
                    key={formResetKey}
                    onSubmit={handleRegisterSubmit}
                    onLoginClick={handleLoginClick}
                    isLoading={isLoading}
                  />
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