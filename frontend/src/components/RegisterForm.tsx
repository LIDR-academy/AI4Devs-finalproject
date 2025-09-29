"use client"

import type React from "react"
import { useState } from "react"
import Input from "./ui/Input"
import Button from "./ui/Button"
import Toggle from "./ui/Toggle"

interface RegisterFormProps {
  onSubmit?: (data: RegisterFormData) => void
  onLoginClick?: () => void
  isLoading?: boolean
}

interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  professionalId: string
  password: string
  confirmPassword: string
  isDoctor: boolean
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  professionalId?: string
  password?: string
  confirmPassword?: string
  general?: string
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, onLoginClick, isLoading = false }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    professionalId: "",
    password: "",
    confirmPassword: "",
    isDoctor: true, // Activado por defecto según el diseño
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Traducciones estáticas (preparado para react-i18next)
  const t = {
    title: "Inicio de sesión",
    doctorToggle: "Registrarme como médico",
    firstName: "Nombre*",
    firstNamePlaceholder: "Ingresa tu nombre",
    lastName: "Apellido*",
    lastNamePlaceholder: "Ingresa tu apellido",
    email: "Correo Electrónico*",
    emailPlaceholder: "Ingresa tu correo electrónico",
    phone: "Teléfono*",
    phonePlaceholder: "Ingresa tu teléfono",
    professionalId: "Cédula profesional*",
    professionalIdPlaceholder: "Ingresa tu cédula profesional",
    password: "Contraseña*",
    passwordPlaceholder: "Ingresa tu contraseña",
    confirmPassword: "Confirmar contraseña*",
    confirmPasswordPlaceholder: "Confirma tu contraseña",
    registerButton: "Registrarme",
    loginLink: "¿Ya tienes cuenta? Inicia sesión",
    errors: {
      firstNameRequired: "El nombre es requerido",
      firstNameMinLength: "El nombre debe tener al menos 2 caracteres",
      lastNameRequired: "El apellido es requerido",
      lastNameMinLength: "El apellido debe tener al menos 2 caracteres",
      emailRequired: "El correo electrónico es requerido",
      emailInvalid: "Ingresa un correo electrónico válido",
      phoneRequired: "El teléfono es requerido",
      phoneInvalid: "El teléfono debe contener solo números",
      phoneLength: "El teléfono debe tener entre 7 y 15 dígitos",
      professionalIdRequired: "La cédula profesional es requerida",
      professionalIdInvalid: "La cédula debe contener solo números",
      professionalIdLength: "La cédula debe tener máximo 10 dígitos",
      passwordRequired: "La contraseña es requerida",
      passwordMinLength: "La contraseña debe tener al menos 6 caracteres",
      confirmPasswordRequired: "Debes confirmar tu contraseña",
      passwordMismatch: "Las contraseñas no coinciden",
    },
  }

  // Funciones de validación
  const validateFirstName = (firstName: string): string | undefined => {
    if (!firstName.trim()) {
      return t.errors.firstNameRequired
    }
    if (firstName.trim().length < 2) {
      return t.errors.firstNameMinLength
    }
    return undefined
  }

  const validateLastName = (lastName: string): string | undefined => {
    if (!lastName.trim()) {
      return t.errors.lastNameRequired
    }
    if (lastName.trim().length < 2) {
      return t.errors.lastNameMinLength
    }
    return undefined
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

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return t.errors.phoneRequired
    }
    const phoneRegex = /^\d+$/
    if (!phoneRegex.test(phone)) {
      return t.errors.phoneInvalid
    }
    if (phone.length < 7 || phone.length > 15) {
      return t.errors.phoneLength
    }
    return undefined
  }

  const validateProfessionalId = (professionalId: string): string | undefined => {
    if (!professionalId.trim()) {
      return t.errors.professionalIdRequired
    }
    const idRegex = /^\d+$/
    if (!idRegex.test(professionalId)) {
      return t.errors.professionalIdInvalid
    }
    if (professionalId.length > 10) {
      return t.errors.professionalIdLength
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

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) {
      return t.errors.confirmPasswordRequired
    }
    if (confirmPassword !== password) {
      return t.errors.passwordMismatch
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    const firstNameError = validateFirstName(formData.firstName)
    const lastNameError = validateLastName(formData.lastName)
    const emailError = validateEmail(formData.email)
    const phoneError = validatePhone(formData.phone)
    const professionalIdError = validateProfessionalId(formData.professionalId)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)

    if (firstNameError) newErrors.firstName = firstNameError
    if (lastNameError) newErrors.lastName = lastNameError
    if (emailError) newErrors.email = emailError
    if (phoneError) newErrors.phone = phoneError
    if (professionalIdError) newErrors.professionalId = professionalIdError
    if (passwordError) newErrors.password = passwordError
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validación en tiempo real para confirmPassword cuando cambia password
    if (field === "password" && formData.confirmPassword) {
      const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, value as string)
      setErrors((prev) => ({ ...prev, confirmPassword: confirmPasswordError }))
    }

    // Validación en tiempo real para confirmPassword field
    if (field === "confirmPassword") {
      const confirmPasswordError = validateConfirmPassword(value as string, formData.password)
      setErrors((prev) => ({ ...prev, confirmPassword: confirmPasswordError }))
    }
  }

  const handleToggleChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isDoctor: checked,
    }))
  }

  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }))

    // Validar campo individual al perder el foco
    switch (field) {
      case "firstName":
        const firstNameError = validateFirstName(formData.firstName)
        setErrors((prev) => ({ ...prev, firstName: firstNameError }))
        break
      case "lastName":
        const lastNameError = validateLastName(formData.lastName)
        setErrors((prev) => ({ ...prev, lastName: lastNameError }))
        break
      case "email":
        const emailError = validateEmail(formData.email)
        setErrors((prev) => ({ ...prev, email: emailError }))
        break
      case "phone":
        const phoneError = validatePhone(formData.phone)
        setErrors((prev) => ({ ...prev, phone: phoneError }))
        break
      case "professionalId":
        const professionalIdError = validateProfessionalId(formData.professionalId)
        setErrors((prev) => ({ ...prev, professionalId: professionalIdError }))
        break
      case "password":
        const passwordError = validatePassword(formData.password)
        setErrors((prev) => ({ ...prev, password: passwordError }))
        break
      case "confirmPassword":
        const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)
        setErrors((prev) => ({ ...prev, confirmPassword: confirmPasswordError }))
        break
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Marcar todos los campos como tocados
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      professionalId: true,
      password: true,
      confirmPassword: true,
    })

    if (validateForm()) {
      setIsSubmitting(true)
      onSubmit?.(formData)

      // Reset loading state after a delay (simulating API call)
      setTimeout(() => {
        setIsSubmitting(false)
      }, 2000)
    }
  }

  const isFormLoading = isLoading || isSubmitting

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">{t.title}</h2>

        {/* Toggle Registrarme como médico */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium">{t.doctorToggle}</span>
          <Toggle
            checked={formData.isDoctor}
            onChange={handleToggleChange}
            disabled={isFormLoading}
            label="Sí"
            aria-label={t.doctorToggle}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Campo Nombre */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              {t.firstName}
            </label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange("firstName")}
              onBlur={handleBlur("firstName")}
              placeholder={t.firstNamePlaceholder}
              error={touched.firstName ? errors.firstName : undefined}
              disabled={isFormLoading}
              className="w-full"
              aria-required="true"
              aria-invalid={touched.firstName && errors.firstName ? "true" : "false"}
              aria-describedby={touched.firstName && errors.firstName ? "firstName-error" : undefined}
            />
          </div>

          {/* Campo Apellido */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              {t.lastName}
            </label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange("lastName")}
              onBlur={handleBlur("lastName")}
              placeholder={t.lastNamePlaceholder}
              error={touched.lastName ? errors.lastName : undefined}
              disabled={isFormLoading}
              className="w-full"
              aria-required="true"
              aria-invalid={touched.lastName && errors.lastName ? "true" : "false"}
              aria-describedby={touched.lastName && errors.lastName ? "lastName-error" : undefined}
            />
          </div>

          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
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
              aria-required="true"
              aria-invalid={touched.email && errors.email ? "true" : "false"}
              aria-describedby={touched.email && errors.email ? "email-error" : undefined}
              autoComplete="email"
            />
          </div>

          {/* Campo Teléfono */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              {t.phone}
            </label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange("phone")}
              onBlur={handleBlur("phone")}
              placeholder={t.phonePlaceholder}
              error={touched.phone ? errors.phone : undefined}
              disabled={isFormLoading}
              className="w-full"
              aria-required="true"
              aria-invalid={touched.phone && errors.phone ? "true" : "false"}
              aria-describedby={touched.phone && errors.phone ? "phone-error" : undefined}
              autoComplete="tel"
            />
          </div>

          {/* Campo Cédula profesional */}
          <div>
            <label htmlFor="professionalId" className="block text-sm font-medium mb-1">
              {t.professionalId}
            </label>
            <Input
              id="professionalId"
              type="text"
              value={formData.professionalId}
              onChange={handleInputChange("professionalId")}
              onBlur={handleBlur("professionalId")}
              placeholder={t.professionalIdPlaceholder}
              error={touched.professionalId ? errors.professionalId : undefined}
              disabled={isFormLoading}
              className="w-full"
              maxLength={10}
              aria-required="true"
              aria-invalid={touched.professionalId && errors.professionalId ? "true" : "false"}
              aria-describedby={touched.professionalId && errors.professionalId ? "professionalId-error" : undefined}
              pattern="[0-9]*"
              inputMode="numeric"
            />
          </div>

          {/* Campos de Contraseña en una fila */}
          <div className="grid grid-cols-2 gap-3">
            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
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
                aria-required="true"
                aria-invalid={touched.password && errors.password ? "true" : "false"}
                aria-describedby={touched.password && errors.password ? "password-error" : undefined}
                autoComplete="new-password"
              />
            </div>

            {/* Campo Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                {t.confirmPassword}
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                placeholder={t.confirmPasswordPlaceholder}
                error={touched.confirmPassword ? errors.confirmPassword : undefined}
                disabled={isFormLoading}
                className="w-full"
                aria-required="true"
                aria-invalid={touched.confirmPassword && errors.confirmPassword ? "true" : "false"}
                aria-describedby={
                  touched.confirmPassword && errors.confirmPassword ? "confirmPassword-error" : undefined
                }
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Error general */}
          {errors.general && (
            <div className="text-red-200 text-sm text-center bg-red-500/20 p-3 rounded-lg">{errors.general}</div>
          )}

          {/* Botón Submit */}
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            isLoading={isFormLoading}
            disabled={isFormLoading}
            className="w-full mt-6"
          >
            {t.registerButton}
          </Button>

          {/* Enlace de login */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onLoginClick}
              className="text-white underline hover:text-yellow-200 transition-colors text-sm"
              disabled={isFormLoading}
            >
              {t.loginLink}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterForm
