"use client"

import type React from "react"
import { useState } from "react"
import Input from "./ui/Input"
import Button from "./ui/Button"
import Toggle from "./ui/Toggle"

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
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    isDoctor: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Traducciones estáticas (preparado para react-i18next)
  const t = {
    title: "Inicio de sesión",
    email: "Correo Electrónico*",
    emailPlaceholder: "Ingresa tu correo electrónico",
    password: "Contraseña*",
    passwordPlaceholder: "Ingresa tu contraseña",
    doctorToggle: "Soy un médico",
    loginButton: "Iniciar Sesión",
    registerLink: "¿aún no tienes cuenta? Ingresa Aquí",
    errors: {
      emailRequired: "El correo electrónico es requerido",
      emailInvalid: "Ingresa un correo electrónico válido",
      passwordRequired: "La contraseña es requerida",
      passwordMinLength: "La contraseña debe tener al menos 6 caracteres",
    },
  }

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return t.errors.emailRequired
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return t.errors.emailInvalid
    }
    return undefined
  }

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return t.errors.passwordRequired
    }
    if (password.length < 6) {
      return t.errors.passwordMinLength
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)

    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Marcar todos los campos como tocados
    setTouched({ email: true, password: true })

    if (validateForm()) {
      setIsSubmitting(true)
      onSubmit?.(formData)

      // Reset loading state after a delay (simulating API call)
      setTimeout(() => {
        setIsSubmitting(false)
      }, 1500)
    }
  }

  const isFormLoading = isLoading || isSubmitting

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-8 text-center">{t.title}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t.email}
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              onBlur={handleBlur("email")}
              placeholder={t.emailPlaceholder}
              error={touched.email ? errors.email : undefined}
              disabled={isFormLoading}
              className="w-full"
            />
          </div>

          {/* Campo Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              {t.password}
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange("password")}
              onBlur={handleBlur("password")}
              placeholder={t.passwordPlaceholder}
              error={touched.password ? errors.password : undefined}
              disabled={isFormLoading}
              className="w-full"
            />
          </div>

          {/* Toggle Soy un médico */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t.doctorToggle}</span>
            <Toggle
              checked={formData.isDoctor}
              onChange={handleInputChange("isDoctor")}
              disabled={isFormLoading}
              label="Sí"
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
            disabled={isFormLoading}
            className="w-full"
          >
            {t.loginButton}
          </Button>

          {/* Enlace de registro */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-white underline hover:text-yellow-200 transition-colors text-sm"
              disabled={isFormLoading}
            >
              {t.registerLink}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm
