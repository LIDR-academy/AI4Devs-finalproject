"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react" // Añadir useMemo
import DropdownFilter from "../DropdownFilter/DropdownFilter"
import Button from "../ui/Button"
import { useTranslation } from "react-i18next"

interface SearchFiltersProps {
  onFiltersChange?: (filters: FilterState) => void
  className?: string
  isAuthenticated?: boolean
  onClearFilters?: () => void
}

interface FilterState {
  specialty: string
  state: string
  municipality: string
  gender: string
  minRating: number
  availability: string
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  onFiltersChange,
  onClearFilters,
  className = "",
  isAuthenticated = false
}) => {
  const { t, i18n: i18nInstance } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState(i18nInstance.language)

  // Actualizar el estado local cuando cambie el idioma globalmente
  useEffect(() => {
    const handleLanguageChanged = () => {
      setCurrentLanguage(i18nInstance.language);
    };

    // Suscribirse al evento de cambio de idioma
    i18nInstance.on('languageChanged', handleLanguageChanged);

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      i18nInstance.off('languageChanged', handleLanguageChanged);
    };
  }, [i18nInstance]);

  //console.log("Current language:", currentLanguage)
  //console.log("Translation test:", t("search.filters.title"))
  //console.log("Translation object:", i18nInstance.getResource(currentLanguage, 'translation', 'search.filters'))

  const [filters, setFilters] = useState<FilterState>({
    specialty: "",
    state: "",
    municipality: "",
    minRating: 0,
    availability: "",
    gender: "",
  })

  const [hoveredRating, setHoveredRating] = useState<number>(0)

  // Usar useMemo para recrear las opciones cuando cambie el idioma
  const specialties = useMemo(() => [
    { value: "1", label: t("specialties.cardiology") },
    { value: "2", label: t("specialties.pediatrics") },
    { value: "3", label: t("specialties.dermatology") },
  ], [currentLanguage, t]);

  const states = useMemo(() => [
    { value: "1", label: t("locations.states.cdmx") },
    { value: "2", label: t("locations.states.jalisco") },
    { value: "3", label: t("locations.states.nuevoLeon") },
    { value: "4", label: t("locations.states.puebla") },
    { value: "5", label: t("locations.states.veracruz") },
  ], [currentLanguage, t]);

  // Mapeo entre value y clave del catálogo
  const stateKeyMap: Record<string, string> = {
    "1": "cdmx",
    "2": "jalisco",
    "3": "nuevoLeon", // Actualizar para que coincida con las claves de los archivos de traducción
    "4": "puebla",
    "5": "veracruz",
  }

  // Usar useMemo para las opciones de municipios
  const getMunicipalities = useMemo(() => {
    if (!filters.state) return [];
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
      nuevoLeon: [
        { value: "10", label: "Monterrey" },
        { value: "11", label: "San Pedro Garza García" },
        { value: "12", label: "Santa Catarina" },
      ],
      puebla: [
        { value: "13", label: "Puebla" },
        { value: "14", label: "Tehuacán" },
        { value: "15", label: "Atlixco" },
      ],
      veracruz: [
        { value: "16", label: "Veracruz" },
        { value: "17", label: "Xalapa" },
        { value: "18", label: "Coatzacoalcos" },
      ],
    }
    const key = stateKeyMap[filters.state]
    return municipalitiesMap[key] || []
  }, [filters.state]);


  const availabilityOptions = useMemo(() => [
    { value: "", label: t("search.filters.selectAvailability") }, // "Todos" por defecto
    { value: "available", label: t("search.filters.availableNow") }, // "Disponible ahora"
  ], [currentLanguage, t]);

  const genderOptions = useMemo(() => [
    { value: "male", label: t("search.filters.male") },
    { value: "female", label: t("search.filters.female") },
  ], [currentLanguage, t]);

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    const newFilters = { ...filters, [key]: value }

    // Reset municipality when state changes
    if (key === "state") {
      newFilters.municipality = ""
    }

    setFilters(newFilters)
    // No llamamos a onFiltersChange aquí para que solo se aplique al hacer clic en el botón
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
      minRating: 0,
      availability: "",
      gender: "",
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
    onClearFilters?.()
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
        aria-label={`${t("common.rating")} ${starNumber}`} // Cambiado a una clave que existe
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
              options={getMunicipalities}
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
                  ? t("search.filters.minRatingDescription", { rating: filters.minRating })
                  : t("search.filters.allRatings")}
              </p>
            </div>
          ) : (
            // Placeholder para visitantes
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center text-gray-400 text-sm">
              {t("search.filters.loginForMinRating")}
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
              {t("search.filters.loginForAvailability")}
            </div>
          )}
        </div>

        {/* Gender Filter ha sido ocultado según requerimiento */}
      </div>

      {/* Apply Filters Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={() => onFiltersChange?.(filters)} // Solo aquí se dispara la búsqueda
        >
          {t("search.filters.applyFilters")}
        </Button>
      </div>

      {/* Active Filters Count */}
      {hasActiveFilters && (
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-600">
            {Object.entries(filters).filter(([key, value]) => value !== "" && value !== 0).length}{" "}
            {t("search.filters.activeFilters")}
          </span>
        </div>
      )}
    </div>
  )
}

export default SearchFilters