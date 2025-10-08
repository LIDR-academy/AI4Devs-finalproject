"use client"

import React from "react"
import { useTranslation } from "react-i18next"


interface NotificationToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  isVisible,
  onClose,
}) => {
    const { t } = useTranslation()

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-federal-blue text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 animate-fade-in">
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 px-2 py-1 bg-honolulu-blue rounded hover:bg-pacific-cyan transition-colors"
          aria-label={t("common.closeNotification")}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default NotificationToast