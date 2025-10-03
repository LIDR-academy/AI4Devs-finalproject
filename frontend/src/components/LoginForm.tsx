"use client"

// Importación de dependencias y componentes UI
import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import Input from "./ui/Input"
import Button from "./ui/Button"
import Toggle from "./ui/Toggle"
import NotificationToast from "./NotificationToast"


interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void
  onRegisterClick?: () => void
  isLoading?: boolean
}

interface LoginFormData {
  email: string
  password: string
  isDoctor: boolean
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onRegisterClick, isLoading = false }) => {
  // Hook de internacionalización (i18n) y navegación
  const { t } = useTranslation() // ← Usar hook de traducción
  const router = useRouter() // ← Agrega el hook de navegación


  // Estado del formulario y errores
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    isDoctor: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado para mostrar notificaciones de error (NotificationToast)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState("")


  // Validación de email usando claves de traducción (i18n)
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return t("auth.emailRequired")
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return t("auth.emailInvalid")
    }
    return undefined
  }

  // Validación de contraseña usando claves de traducción (i18n)
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return t("auth.passwordRequired")
    }
    if (password.length < 6) {
      return t("auth.passwordMinLength")
    }
    return undefined
  }

  // Validación global del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)

    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejo de cambios en los campos del formulario
  const handleInputChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === "isDoctor" ? e.target.checked : e.target.value

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  // Manejo de blur para mostrar errores al perder el foco
  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }))

    // Validar campo individual al perder el foco
    if (field === "email") {
      const emailError = validateEmail(formData.email)
      setErrors((prev) => ({ ...prev, email: emailError }))
    } else if (field === "password") {
      const passwordError = validatePassword(formData.password)
      setErrors((prev) => ({ ...prev, password: passwordError }))
    }
  }

  // Manejo del toggle "Soy un médico" siguiendo el patrón de RegisterForm
  const handleToggleChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isDoctor: checked,// Actualiza el tipo de usuario para condicionar el endpoint

    }))
  }

  // Manejo del submit y errores del backend usando NotificationToast
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })

    if (validateForm()) {
      setIsSubmitting(true)
      try {
        // Envía los datos al servicio de login y espera la respuesta
        const result = await onSubmit?.(formData)
        // Mostrar mensaje de éxito y redirigir según el tipo de usuario
        setToastMessage(t("auth.loginSuccess"))
        setToastVisible(true)
        setTimeout(() => {
          setToastVisible(false)
          if (formData.isDoctor) {
            router.push("/agenda") // Redirección para médicos
          } else {
            router.push("/") // Redirección para pacientes
          }
        }, 2000) // Espera 2 segundos antes de redirigir
      } catch (error: any) {
        // Muestra mensaje de error internacionalizado

        let message = t("auth.loginError")
        if (error?.message) {
          message = t(`auth.${error.message}`, error.message)
        }
        setToastMessage(message)
        setToastVisible(true)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Estado de carga y validación para habilitar/deshabilitar el botón de login
  const isFormLoading = isLoading || isSubmitting

  const isFormValid =
    validateEmail(formData.email) === undefined &&
    validatePassword(formData.password) === undefined

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Toast de error */}
      <NotificationToast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-8 text-center">{t("auth.loginFormSubtitle")}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t("auth.emailLabel")}
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              onBlur={handleBlur("email")}
              placeholder={t("auth.emailPlaceholder")}
              error={touched.email ? errors.email : undefined}
              disabled={isFormLoading}
              className="w-full"
            />
          </div>

          {/* Campo Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              {t("auth.passwordLabel")}
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange("password")}
              onBlur={handleBlur("password")}
              placeholder={t("auth.passwordPlaceholder")}
              error={touched.password ? errors.password : undefined}
              disabled={isFormLoading}
              className="w-full"
            />
          </div>

          {/* Toggle Soy un médico */}
          <div className="flex items-center justify-between mb-6">
            <label
              htmlFor="login-as-doctor-toggle"
              className="text-sm font-medium mr-4 flex-1 text-left"
            >
              {t("auth.isDoctorLabel")}
            </label>
            <Toggle
              id="login-as-doctor-toggle"
              checked={formData.isDoctor}
              onChange={handleToggleChange}
              disabled={isFormLoading}
              aria-label={t("auth.isDoctorLabel")}
            />
          </div>

          {/* Error general */}
          {errors.general && (
            <div className="text-red-200 text-sm text-center bg-red-500/20 p-3 rounded-lg">{errors.general}</div>
          )}

          {/* Botón Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isFormLoading}
            disabled={isFormLoading || !isFormValid}
            className="w-full"
          >
            {t("auth.loginButton")}
          </Button>

          {/* Enlace de registro */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-white underline hover:text-yellow-200 transition-colors text-sm"
              disabled={isFormLoading}
            >
              {t("auth.noAccountText")} <span className="font-bold">{t("auth.registerLink")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm