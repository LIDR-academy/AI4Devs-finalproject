"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog"
import { format, isAfter, isBefore, addMonths, subMonths } from "date-fns"
import { es, enUS } from "date-fns/locale"

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
    <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
    <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
    <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
  </svg>
)

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" strokeWidth={2} />
  </svg>
)

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <polyline points="12,6 12,12 16,14" strokeWidth={2} />
  </svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth={2} />
    <polyline points="22,4 12,14.01 9,11.01" strokeWidth={2} />
  </svg>
)

const XCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <line x1="15" y1="9" x2="9" y2="15" strokeWidth={2} />
    <line x1="9" y1="9" x2="15" y2="15" strokeWidth={2} />
  </svg>
)

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <line x1="12" y1="8" x2="12" y2="12" strokeWidth={2} />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
)

interface MedicalFiltersProps {
  onFiltersChange?: (filters: FilterState) => void
}

interface FilterState {
  dateRange: string
  status: string
  timeSlot: string
}

const MedicalFilters: React.FC<MedicalFiltersProps> = ({ onFiltersChange }) => {
  const { t, i18n } = useTranslation()
  const [filters, setFilters] = useState<FilterState>({
    date: "",
    status: "",
  })
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Limitar fechas: 6 meses atrás y adelante
  const today = new Date()
  const minDate = subMonths(today, 6)
  const maxDate = addMonths(today, 6)
  const locale = i18n.language === "es" ? es : enUS

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return
    if (isBefore(date, minDate) || isAfter(date, maxDate)) return
    setSelectedDate(date)
    setFilters({ ...filters, date: format(date, "yyyy-MM-dd") })
    onFiltersChange?.({ ...filters, date: format(date, "yyyy-MM-dd"), status: filters.status })
    setCalendarOpen(false)
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearFilters = () => {
    setFilters({ date: "", status: "" })
    setSelectedDate(null)
    onFiltersChange?.({ date: "", status: "" })
  }

  // Opciones de estado con internacionalización
  const statusOptions = [
    { value: "pending", label: t("medicalAgenda.filters.status.pending") },
    { value: "confirmed", label: t("medicalAgenda.filters.status.confirmed") },
    { value: "rejected", label: t("medicalAgenda.filters.status.rejected") },
  ]

  // Opciones de rango de fecha con internacionalización
  const dateRangeOptions = [
    { value: "today", label: t("medicalAgenda.filters.dateRange.today") },
    { value: "tomorrow", label: t("medicalAgenda.filters.dateRange.tomorrow") },
    { value: "thisWeek", label: t("medicalAgenda.filters.dateRange.thisWeek") },
    { value: "nextWeek", label: t("medicalAgenda.filters.dateRange.nextWeek") },
    { value: "thisMonth", label: t("medicalAgenda.filters.dateRange.thisMonth") },
  ]

  // Opciones de franja horaria con internacionalización
  const timeSlotOptions = [
    { value: "morning", label: t("medicalAgenda.filters.timeSlot.morning") },
    { value: "afternoon", label: t("medicalAgenda.filters.timeSlot.afternoon") },
    { value: "evening", label: t("medicalAgenda.filters.timeSlot.evening") },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-federal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" strokeWidth={2} />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">{t("medicalAgenda.filters.title")}</h3>
        </div>
        <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-federal-blue transition-colors">
          {t("medicalAgenda.filters.clearAll")}
        </button>
      </div>

      <div className="space-y-6">
        {/* Date Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
            </svg>
            {t("medicalAgenda.filters.dateRange.label").replace("Rango de fecha", "Filtrar por fecha")}
          </label>
          <button
            type="button"
            onClick={() => setCalendarOpen(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-federal-blue focus:border-transparent transition-colors text-left"
          >
            {selectedDate
              ? format(selectedDate, "PPP", { locale })
              : t("medicalAgenda.filters.dateRange.all")}
          </button>
          <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
            <DialogContent
              className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-sm w-full flex flex-col items-center z-50"
            >
              <DialogTitle className="text-lg font-medium mb-4 text-gray-900 w-full text-center">
                {t("medicalAgenda.filters.dateRange.label").replace("Rango de fecha", "Filtrar por fecha")}
              </DialogTitle>
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={handleDateChange}
                locale={locale}
                fromDate={minDate}
                toDate={maxDate}
                showOutsideDays={false}
                disabled={{ before: minDate, after: maxDate }}
                className="mx-auto"
              />
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setCalendarOpen(false)}
                aria-label={t("common.cancel")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth={2} />
              <polyline points="22,4 12,14.01 9,11.01" strokeWidth={2} />
            </svg>
            {t("medicalAgenda.filters.status.label")}
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-federal-blue focus:border-transparent transition-colors"
          >
            <option value="">{t("medicalAgenda.filters.status.all")}</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default MedicalFilters
