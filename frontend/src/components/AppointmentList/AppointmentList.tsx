"use client"

import type React from "react"
import { useTranslation } from "react-i18next"
import { AppointmentCard } from "../AppointmentCard/AppointmentCard"

interface Appointment {
  id: string
  patient: {
    name: string
    avatar: string
    isOnline: boolean
  }
  description: string
  date: string
  time: string
  status: "pending" | "confirmed" | "cancelled"
  type: string
}

interface AppointmentListProps {
  appointments?: Appointment[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
  onApprove?: (appointmentId: string) => void
  onReject?: (appointmentId: string) => void
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments = [],
  isLoading = false,
  error = null,
  onRetry,
  onLoadMore,
  hasMore = true,
  isLoadingMore = false,
  onApprove,
  onReject,
}) => {
  const { t } = useTranslation()

  const displayAppointments = appointments

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded-md w-32 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-md w-24 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        {/* Usar clave internacionalizada para el título y botón */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("medicalAgenda.error.title")}</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-federal-blue text-white rounded-lg hover:bg-honolulu-blue transition-colors"
          >
            {t("medicalAgenda.error.retry")}
          </button>
        )}
      </div>
    )
  }

  // Empty state
  if (displayAppointments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6"
            />
          </svg>
        </div>
        {/* Usar clave internacionalizada para el título y descripción */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("medicalAgenda.results.empty.title")}</h3>
        <p className="text-gray-600">{t("medicalAgenda.results.empty.description")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with results count */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t("medicalAgenda.results.title")}</h2>
        <span className="text-sm text-gray-500">
          {t("medicalAgenda.results.count", { count: displayAppointments.length })}
        </span>
      </div>

      {/* Appointments grid */}
      <div className="space-y-4">
        {displayAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 bg-white border-2 border-federal-blue text-federal-blue rounded-lg hover:bg-federal-blue hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoadingMore ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>{t("medicalAgenda.results.loadingMore")}</span>
              </div>
            ) : (
              t("medicalAgenda.results.loadMore")
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default AppointmentList
