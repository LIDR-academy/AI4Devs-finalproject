"use client"

import type React from "react"
import { useState } from "react"
import DropdownFilter from "../DropdownFilter/DropdownFilter"
import Button from "../ui/Button"

interface SearchFiltersProps {
  onFiltersChange?: (filters: FilterState) => void
  className?: string
}

interface FilterState {
  specialty: string
  state: string
  municipality: string
  priceRange: string
  availability: string
  gender: string
}

const translations = {
  "search.filters.title": "Filtros de búsqueda",
  "search.filters.clearAll": "Limpiar todo",
  "search.filters.specialty": "Especialidad",
  "search.filters.selectSpecialty": "Seleccionar especialidad",
  "search.filters.state": "Estado",
  "search.filters.selectState": "Seleccionar estado",
  "search.filters.municipality": "Municipio",
  "search.filters.selectMunicipality": "Seleccionar municipio",
  "search.filters.priceRange": "Rango de precio",
  "search.filters.selectPriceRange": "Seleccionar rango",
  "search.filters.availability": "Disponibilidad",
  "search.filters.selectAvailability": "Seleccionar disponibilidad",
  "search.filters.gender": "Género",
  "search.filters.selectGender": "Seleccionar género",
  "search.filters.applyFilters": "Aplicar filtros",
  "search.filters.activeFilters": "filtros activos",
  "search.filters.today": "Hoy",
  "search.filters.tomorrow": "Mañana",
  "search.filters.thisWeek": "Esta semana",
  "search.filters.nextWeek": "Próxima semana",
  "search.filters.male": "Masculino",
  "search.filters.female": "Femenino",
}

const t = (key: string) => translations[key as keyof typeof translations] || key

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFiltersChange, className = "" }) => {
  const [filters, setFilters] = useState<FilterState>({
    specialty: "",
    state: "",
    municipality: "",
    priceRange: "",
    availability: "",
    gender: "",
  })

  const specialties = [
    { value: "cardiology", label: "Cardiología" },
    { value: "dermatology", label: "Dermatología" },
    { value: "neurology", label: "Neurología" },
    { value: "pediatrics", label: "Pediatría" },
    { value: "psychiatry", label: "Psiquiatría" },
    { value: "orthopedics", label: "Ortopedia" },
  ]

  const states = [
    { value: "cdmx", label: "Ciudad de México" },
    { value: "jalisco", label: "Jalisco" },
    { value: "nuevo-leon", label: "Nuevo León" },
    { value: "puebla", label: "Puebla" },
    { value: "veracruz", label: "Veracruz" },
  ]

  const getMunicipalities = () => {
    if (!filters.state) return []
    const municipalitiesMap: Record<string, Array<{ value: string; label: string }>> = {
      cdmx: [
        { value: "benito-juarez", label: "Benito Juárez" },
        { value: "coyoacan", label: "Coyoacán" },
        { value: "miguel-hidalgo", label: "Miguel Hidalgo" },
      ],
      jalisco: [
        { value: "guadalajara", label: "Guadalajara" },
        { value: "zapopan", label: "Zapopan" },
        { value: "tlaquepaque", label: "Tlaquepaque" },
      ],
      "nuevo-leon": [
        { value: "monterrey", label: "Monterrey" },
        { value: "san-pedro", label: "San Pedro Garza García" },
        { value: "santa-catarina", label: "Santa Catarina" },
      ],
    }
    return municipalitiesMap[filters.state] || []
  }

  const priceRanges = [
    { value: "0-500", label: "$0 - $500" },
    { value: "500-1000", label: "$500 - $1,000" },
    { value: "1000-2000", label: "$1,000 - $2,000" },
    { value: "2000-5000", label: "$2,000 - $5,000" },
    { value: "5000+", label: "$5,000+" },
  ]

  const availabilityOptions = [
    { value: "today", label: t("search.filters.today") },
    { value: "tomorrow", label: t("search.filters.tomorrow") },
    { value: "thisWeek", label: t("search.filters.thisWeek") },
    { value: "nextWeek", label: t("search.filters.nextWeek") },
  ]

  const genderOptions = [
    { value: "male", label: t("search.filters.male") },
    { value: "female", label: t("search.filters.female") },
  ]

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }

    // Reset municipality when state changes
    if (key === "state") {
      newFilters.municipality = ""
    }

    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      specialty: "",
      state: "",
      municipality: "",
      priceRange: "",
      availability: "",
      gender: "",
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "")

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{t("search.filters.title")}</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-federal-blue hover:text-honolulu-blue transition-colors"
          >
            {t("search.filters.clearAll")}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Specialty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("search.filters.specialty")}</label>
          <DropdownFilter
            options={specialties}
            value={filters.specialty}
            onChange={(value) => handleFilterChange("specialty", value)}
            placeholder={t("search.filters.selectSpecialty")}
          />
        </div>

        {/* Location Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("search.filters.state")}</label>
          <DropdownFilter
            options={states}
            value={filters.state}
            onChange={(value) => handleFilterChange("state", value)}
            placeholder={t("search.filters.selectState")}
          />
        </div>

        {filters.state && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("search.filters.municipality")}</label>
            <DropdownFilter
              options={getMunicipalities()}
              value={filters.municipality}
              onChange={(value) => handleFilterChange("municipality", value)}
              placeholder={t("search.filters.selectMunicipality")}
            />
          </div>
        )}

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("search.filters.priceRange")}</label>
          <DropdownFilter
            options={priceRanges}
            value={filters.priceRange}
            onChange={(value) => handleFilterChange("priceRange", value)}
            placeholder={t("search.filters.selectPriceRange")}
          />
        </div>

        {/* Availability Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("search.filters.availability")}</label>
          <DropdownFilter
            options={availabilityOptions}
            value={filters.availability}
            onChange={(value) => handleFilterChange("availability", value)}
            placeholder={t("search.filters.selectAvailability")}
          />
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("search.filters.gender")}</label>
          <DropdownFilter
            options={genderOptions}
            value={filters.gender}
            onChange={(value) => handleFilterChange("gender", value)}
            placeholder={t("search.filters.selectGender")}
          />
        </div>
      </div>

      {/* Apply Filters Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Button variant="primary" size="md" className="w-full" onClick={() => onFiltersChange?.(filters)}>
          {t("search.filters.applyFilters")}
        </Button>
      </div>

      {/* Active Filters Count */}
      {hasActiveFilters && (
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-600">
            {Object.values(filters).filter((value) => value !== "").length} {t("search.filters.activeFilters")}
          </span>
        </div>
      )}
    </div>
  )
}

export default SearchFilters
