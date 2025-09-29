"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import MainLayout from "../components/MainLayout"
import MedicalFilters from "../components/MedicalFilters/MedicalFilters"
import AppointmentList from "../components/AppointmentList/AppointmentList"

interface MedicalAgendaProps {
  onNavigateToHome: () => void
  onNavigateToEditSchedule?: () => void
}

const MedicalAgenda: React.FC<MedicalAgendaProps> = ({ onNavigateToHome, onNavigateToEditSchedule }) => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    dateRange: { start: "", end: "" },
    status: "",
    timeSlot: "",
  })

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      dateRange: { start: "", end: "" },
      status: "",
      timeSlot: "",
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <MainLayout onNavigateToHome={onNavigateToHome} onNavigateToMedicalAgenda={() => {}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <MainLayout onNavigateToHome={onNavigateToHome} onNavigateToMedicalAgenda={() => {}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">{t("medicalAgenda.error.title")}</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null)
                setIsLoading(true)
                setTimeout(() => setIsLoading(false), 1000)
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t("medicalAgenda.error.retry")}
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Main content
  return (
    <MainLayout onNavigateToHome={onNavigateToHome} onNavigateToMedicalAgenda={() => {}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("medicalAgenda.title")}</h1>
              <p className="text-gray-600">{t("medicalAgenda.subtitle")}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onNavigateToEditSchedule}
                className="inline-flex items-center px-4 py-2 bg-federal-blue hover:bg-honolulu-blue text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t("scheduleEdit.title")}
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <MedicalFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          <div className="lg:col-span-3">
            <AppointmentList filters={filters} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default MedicalAgenda
