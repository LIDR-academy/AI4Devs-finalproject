"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()

  const [filters, setFilters] = useState<FilterState>({
    dateRange: "",
    status: "",
    timeSlot: "",
  })

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = { dateRange: "", status: "", timeSlot: "" }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  const statusOptions = [
    {
      value: "pending",
      label: t("medicalAgenda.filters.status.pending"),
      icon: AlertCircleIcon,
      color: "text-yellow-600",
    },
    {
      value: "confirmed",
      label: t("medicalAgenda.filters.status.confirmed"),
      icon: CheckCircleIcon,
      color: "text-green-600",
    },
    {
      value: "cancelled",
      label: t("medicalAgenda.filters.status.cancelled"),
      icon: XCircleIcon,
      color: "text-red-600",
    },
  ]

  const dateRangeOptions = [
    { value: "today", label: t("medicalAgenda.filters.dateRange.today") },
    { value: "tomorrow", label: t("medicalAgenda.filters.dateRange.tomorrow") },
    { value: "thisWeek", label: t("medicalAgenda.filters.dateRange.thisWeek") },
    { value: "nextWeek", label: t("medicalAgenda.filters.dateRange.nextWeek") },
    { value: "thisMonth", label: t("medicalAgenda.filters.dateRange.thisMonth") },
  ]

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
          <FilterIcon className="w-5 h-5 text-federal-blue" />
          <h3 className="text-lg font-semibold text-gray-900">{t("medicalAgenda.filters.title")}</h3>
        </div>
        <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-federal-blue transition-colors">
          {t("medicalAgenda.filters.clearAll")}
        </button>
      </div>

      <div className="space-y-6">
        {/* Date Range Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <CalendarIcon className="w-4 h-4" />
            {t("medicalAgenda.filters.dateRange.label")}
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange("dateRange", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-federal-blue focus:border-transparent transition-colors"
          >
            <option value="">{t("medicalAgenda.filters.dateRange.all")}</option>
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <CheckCircleIcon className="w-4 h-4" />
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

        {/* Time Slot Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <ClockIcon className="w-4 h-4" />
            {t("medicalAgenda.filters.timeSlot.label")}
          </label>
          <select
            value={filters.timeSlot}
            onChange={(e) => handleFilterChange("timeSlot", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-federal-blue focus:border-transparent transition-colors"
          >
            <option value="">{t("medicalAgenda.filters.timeSlot.all")}</option>
            {timeSlotOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters Summary */}
        {(filters.dateRange || filters.status || filters.timeSlot) && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">{t("medicalAgenda.filters.activeFilters")}:</p>
            <div className="flex flex-wrap gap-2">
              {filters.dateRange && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-federal-blue/10 text-federal-blue">
                  {dateRangeOptions.find((opt) => opt.value === filters.dateRange)?.label}
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-honolulu-blue/10 text-honolulu-blue">
                  {statusOptions.find((opt) => opt.value === filters.status)?.label}
                </span>
              )}
              {filters.timeSlot && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-600">
                  {timeSlotOptions.find((opt) => opt.value === filters.timeSlot)?.label}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicalFilters
