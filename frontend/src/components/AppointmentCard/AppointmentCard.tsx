"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

interface AppointmentCardProps {
  appointment: {
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
  onApprove?: (appointmentId: string) => void
  onReject?: (appointmentId: string) => void
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onApprove, onReject }) => {
  const { t } = useTranslation()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      await onApprove?.(appointment.id)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      await onReject?.(appointment.id)
    } finally {
      setIsRejecting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-50"
      case "cancelled":
        return "text-red-600 bg-red-50"
      default:
        return "text-yellow-600 bg-yellow-50"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return t("medicalAgenda.status.confirmed")
      case "cancelled":
        return t("medicalAgenda.status.cancelled")
      default:
        return t("medicalAgenda.status.pending")
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header with patient info and status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={appointment.patient.avatar || "/placeholder.svg"}
              alt={appointment.patient.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
            />
            {appointment.patient.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{appointment.patient.name}</h3>
            <p className="text-sm text-gray-500">{appointment.type}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {getStatusText(appointment.status)}
        </span>
      </div>

      {/* Appointment description */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed">{appointment.description}</p>
      </div>

      {/* Date and time */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{appointment.date}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{appointment.time}</span>
        </div>
      </div>

      {/* Action buttons - only show for pending appointments */}
      {appointment.status === "pending" && (
        <div className="flex space-x-3">
          <button
            onClick={handleReject}
            disabled={isRejecting || isApproving}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isRejecting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{t("medicalAgenda.card.rejecting")}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{t("medicalAgenda.card.reject")}</span>
              </>
            )}
          </button>

          <button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isApproving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{t("medicalAgenda.card.approving")}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("medicalAgenda.card.approve")}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Confirmed/Cancelled state message */}
      {appointment.status !== "pending" && (
        <div
          className={`text-center py-2 px-4 rounded-lg text-sm font-medium ${
            appointment.status === "confirmed" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {appointment.status === "confirmed"
            ? t("medicalAgenda.card.confirmedMessage")
            : t("medicalAgenda.card.cancelledMessage")}
        </div>
      )}
    </div>
  )
}

export { AppointmentCard }
export default AppointmentCard
