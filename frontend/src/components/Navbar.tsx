"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import i18n from "../i18n"
import { decodeAuthToken } from "../lib/utils"
import { authService } from "../services/authService"



interface NavbarProps {
  currentLanguage?: string
  onLanguageChange?: (language: string) => void
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t, i18n: i18nextInstance } = useTranslation()
  const currentLanguage = i18nextInstance.language || "es"

  const router = useRouter()

  // Estado para autenticación y rol
  const [authState, setAuthState] = useState<{ isAuthenticated: boolean; role: string | null; id: string | null }>({
    isAuthenticated: false,
    role: null,
    id: null,
  })

  useEffect(() => {
    const payload = decodeAuthToken()
    if (payload && payload.id && payload.role) {
      setAuthState({
        isAuthenticated: true,
        role: payload.role,
        id: payload.id?.toString() || null,
      })
    } else {
      setAuthState({
        isAuthenticated: false,
        role: null,
        id: null,
      })
    }
  }, [])

  const handleNavigateToHome = () => router.push("/")
  const handleNavigateToMedicalAgenda = () => router.push("/agenda")
  const handleNavigateToProfile = () => router.push("/") // Ajusta la ruta si es diferente
  const handleNavigateToFindSpecialist = () => router.push("/") // Ajusta la ruta si es diferente

  const handleLanguageToggle = () => {
    const newLanguage = currentLanguage === "es" ? "en" : "es"
    i18n.changeLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  // Navegación dinámica según autenticación y rol
  const getNavOptions = () => {
    if (!authState.isAuthenticated) {
      return [
        { key: "home", label: t("nav.home"), onClick: handleNavigateToHome },
        { key: "findSpecialist", label: t("nav.findSpecialist"), onClick: handleNavigateToFindSpecialist },
        { key: "login", label: t("common.login"), onClick: () => router.push("/login") }, // Botón de inicio de sesión
        { key: "language", label: currentLanguage === "es" ? "English" : "Español", onClick: handleLanguageToggle },
      ]
    }
    if (authState.role === "patient") {
      return [
        { key: "home", label: t("nav.home"), onClick: handleNavigateToHome },
        /*{ key: "myAppointments", label: t("nav.myAppointments"), onClick: handleNavigateToMedicalAgenda },*/ /*Proximamente*/
        { key: "findSpecialist", label: t("nav.findSpecialist"), onClick: handleNavigateToFindSpecialist },
        {
          key: "logout",
          label: t("nav.logout"),
          onClick: async () => {
            await authService.logout();
            setAuthState({ isAuthenticated: false, role: null, id: null }); // <-- Actualiza el estado aquí
            router.push("/");
          }
        },
        { key: "language", label: currentLanguage === "es" ? "English" : "Español", onClick: handleLanguageToggle },
      ]
    }
    if (authState.role === "doctor") {
      return [
        { key: "home", label: t("nav.home"), onClick: handleNavigateToHome },
        { key: "myAppointments", label: t("nav.myAppointments"), onClick: handleNavigateToMedicalAgenda },
        { key: "findSpecialist", label: t("nav.findSpecialist"), onClick: handleNavigateToFindSpecialist },
        // Opción "Mi perfil" para médicos
        { key: "myProfile", label: t("nav.myProfile"), onClick: () => router.push(`/doctor/${authState.id}`) },
        {
          key: "logout",
          label: t("nav.logout"),
          onClick: async () => {
            await authService.logout();
            setAuthState({ isAuthenticated: false, role: null, id: null }); // <-- Actualiza el estado aquí
            router.push("/");
          }
        },
        { key: "language", label: currentLanguage === "es" ? "English" : "Español", onClick: handleLanguageToggle },
      ]
    }
    return []
  }

  const navOptions = getNavOptions()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-federal-blue">Buscadoc</h1>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 justify-between items-center ml-8">
            <div className="flex flex-1 justify-center gap-8">
              {navOptions
                .filter(option => option.key !== "language")
                .map(option => (
                  <button
                    key={option.key}
                    onClick={option.onClick}
                    className="text-gray-700 hover:text-federal-blue font-medium transition-colors whitespace-nowrap px-4 py-2 rounded-md"
                  >
                    {option.label}
                  </button>
                ))}
            </div>
            {/* Botón de cambio de idioma */}
            {navOptions.find(opt => opt.key === "language") && (
              <button
                onClick={navOptions.find(opt => opt.key === "language")!.onClick}
                className="bg-honolulu-blue hover:bg-federal-blue text-white font-medium py-2 px-4 rounded-md transition-colors text-sm ml-4"
              >
                {navOptions.find(opt => opt.key === "language")!.label}
              </button>
            )}
          </nav>
          {/* Mobile menu button */}
          <div className="md:hidden flex-1 flex justify-end">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-federal-blue"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navOptions.map(option => (
                <button
                  key={option.key}
                  onClick={option.onClick}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-federal-blue hover:bg-gray-50"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
