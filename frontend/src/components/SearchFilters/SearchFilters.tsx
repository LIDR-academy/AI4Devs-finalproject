"use client"

import type React from "react"
import { useState } from "react"
import DropdownFilter from "../DropdownFilter/DropdownFilter"
import Button from "../ui/Button"


interface SearchFiltersProps {
  onFiltersChange?: (filters: FilterState) => void
  className?: string
  isAuthenticated?: boolean // Nueva prop para controlar filtros visibles

}

interface FilterState {
  specialty: string
  state: string
  municipality: string
  gender: string
  minRating: number // Nuevo campo para el slider de valoración mínima
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
  "search.filters.minRating": "Valoración mínima", // Added rating filter translation
  "search.filters.minRatingDescription": "{rating}+ estrellas",
  "search.filters.allRatings": "Todas las valoraciones",
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

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFiltersChange, className = "", isAuthenticated = false }) => {
  const [filters, setFilters] = useState<FilterState>({
    specialty: "",
    state: "",
    municipality: "",
    minRating: 0, // Valor inicial del slider
    availability: "",
    gender: "",
  })

  const [hoveredRating, setHoveredRating] = useState<number>(0)


  //TODO: implementar Endpoint para consultar especialidades
  const specialties = [
    { value: "1", label: "Cardiología" },
    { value: "2", label: "Pediatría" },
    { value: "3", label: "Dermatología" },
  ]

  //TODO: implementar Endpoint para consultar Estadis
  const states = [
    { value: "1", label: "Ciudad de México" },
    { value: "2", label: "Jalisco" },
    { value: "3", label: "Nuevo León" },
    { value: "4", label: "Puebla" },
    { value: "5", label: "Veracruz" },
  ]

  //TODO: implementar Endpoint para consultar municipios
  const getMunicipalities = () => {
    if (!filters.state) return []
    const municipalitiesMap: Record<string, Array<{ value: string; label: string }>> = {
      cdmx: [
        { value: "1", label: "Coyoacán" },
        { value: "7", label: "Benito Juárez" },
        { value: "8", label: "Miguel Hidalgo" },
      ],
      jalisco: [
        { value: "2", label: "Guadalajara" },
        { value: "3", label: "Zapopan" },
        { value: "9", label: "Tlaquepaque" },
      ],
      "nuevo-leon": [
        { value: "10", label: "Monterrey" },
        { value: "11", label: "San Pedro Garza García" },
        { value: "12", label: "Santa Catarina" },
      ],
    }
    return municipalitiesMap[filters.state] || []
  }

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

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    const newFilters = { ...filters, [key]: value }

    // Reset municipality when state changes
    if (key === "state") {
      newFilters.municipality = ""
    }

    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleRatingClick = (rating: number) => {
    const newRating = filters.minRating === rating ? 0 : rating
    handleFilterChange("minRating", newRating)
  }

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      specialty: "",
      state: "",
      municipality: "",
      minRating: 0, // Changed from priceRange to minRating
      availability: "",
      gender: "",
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "" && value !== 0)

  const renderStar = (index: number) => {
    const starNumber = index + 1
    const isFilled = starNumber <= filters.minRating
    const isHovered = starNumber <= hoveredRating

    return (
      <button
        key={index}
        type="button"
        onClick={() => handleRatingClick(starNumber)}
        onMouseEnter={() => setHoveredRating(starNumber)}
        onMouseLeave={() => setHoveredRating(0)}
        className="focus:outline-none focus:ring-2 focus:ring-federal-blue focus:ring-offset-1 rounded transition-all"
        aria-label={`Seleccionar ${starNumber} estrellas`}
      >
        <svg
          className={`w-8 h-8 transition-colors ${isFilled || isHovered ? "text-yellow-400" : "text-gray-300"
            } hover:text-yellow-400`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    )
  }

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

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("search.filters.minRating")}</label>
          {isAuthenticated ? (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }, (_, index) => renderStar(index))}
              </div>
              <p className="text-center text-sm text-gray-600">
                {filters.minRating > 0
                  ? t("search.filters.minRatingDescription").replace("{rating}", filters.minRating.toString())
                  : t("search.filters.allRatings")}
              </p>
            </div>
          ) : (
            // Placeholder para visitantes
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center text-gray-400 text-sm">
              Inicia sesión para filtrar por valoración mínima
            </div>
          )}
        </div>

        {/* Availability Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("search.filters.availability")}</label>
          {isAuthenticated ? (
            <DropdownFilter
              options={availabilityOptions}
              value={filters.availability}
              onChange={(value) => handleFilterChange("availability", value)}
              placeholder={t("search.filters.selectAvailability")}
            />
          ) : (
            // Placeholder para visitantes
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center text-gray-400 text-sm">
              Inicia sesión para filtrar por disponibilidad
            </div>
          )}
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
            {Object.entries(filters).filter(([key, value]) => value !== "" && value !== 0).length}{" "}
            {t("search.filters.activeFilters")}          </span>
        </div>
      )}
    </div>
  )
}

export default SearchFilters
