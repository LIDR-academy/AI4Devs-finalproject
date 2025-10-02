"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"


interface NavbarProps {
  currentLanguage?: string
  onLanguageChange?: (language: string) => void
}

const Navbar: React.FC<NavbarProps> = ({
  currentLanguage = "es",
  onLanguageChange
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useTranslation()

  const router = useRouter()

  const handleNavigateToHome = () => router.push("/")
  const handleNavigateToMedicalAgenda = () => router.push("/agenda")
  const handleNavigateToProfile = () => router.push("/") // Ajusta la ruta si es diferente
  const handleNavigateToFindSpecialist = () => router.push("/") // Ajusta la ruta si es diferente

  const handleLanguageToggle = () => {
    const newLanguage = currentLanguage === "es" ? "en" : "es"
    onLanguageChange?.(newLanguage)
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-federal-blue">Buscadoc</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={handleNavigateToHome}
              className="text-gray-700 hover:text-federal-blue font-medium transition-colors"
            >
              {t("nav.home")}
            </button>
            <button
              onClick={handleNavigateToMedicalAgenda}
              className="text-gray-700 hover:text-federal-blue font-medium transition-colors"
            >
              {t("nav.myAppointments")}
            </button>
            <button
              onClick={handleNavigateToFindSpecialist}
              className="text-gray-700 hover:text-federal-blue font-medium transition-colors"
            >
              {t("nav.findSpecialist")}
            </button>
            <button
              onClick={handleNavigateToProfile}
              className="text-gray-700 hover:text-federal-blue font-medium transition-colors"
            >
              {t("nav.myProfile")}
            </button>
          </nav>

          {/* Search Bar & Language Toggle */}
          <div className="flex items-center space-x-4">
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t("search.placeholder")}
                  className="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-federal-blue focus:border-federal-blue text-sm"
                />
              </div>
            </div>

            {/* Language Toggle */}
            <button
              onClick={handleLanguageToggle}
              className="bg-honolulu-blue hover:bg-federal-blue text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
            >
              {currentLanguage === "es" ? "English" : "Español"}
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden">
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
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {/* Mobile Search */}
              <div className="mb-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder={t("search.searchButton")}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-federal-blue focus:border-federal-blue text-sm"
                  />
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <button
                onClick={onNavigateToHome}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-federal-blue hover:bg-gray-50"
              >
                {t("nav.home")}
              </button>
              <button
                onClick={onNavigateToMedicalAgenda}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-federal-blue hover:bg-gray-50"
              >
                {t("nav.myAppointments")}
              </button>
              <button
                onClick={onNavigateToFindSpecialist}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-federal-blue hover:bg-gray-50"
              >
                {t("nav.findSpecialist")}
              </button>
              <button
                onClick={onNavigateToProfile}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-federal-blue hover:bg-gray-50"
              >
                {t("nav.myProfile")}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
