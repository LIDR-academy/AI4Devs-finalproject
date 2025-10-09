"use client"

import MainLayout from "../src/components/MainLayout"
import { useState, useEffect } from "react" // Importar useEffect
import SearchBar from "../src/components/SearchBar/SearchBar"
import SearchFilters from "../src/components/SearchFilters/SearchFilters"
import DoctorCard from "../src/components/DoctorCard/DoctorCard"
import AppointmentBooking from "../src/components/AppointmentBooking/AppointmentBooking"
import NotificationToast from "../src/components/NotificationToast"
import { doctorService } from "../src/services/doctorService"
import { useTranslation } from "react-i18next"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    specialty: "",
    state: "",
    municipality: "",
    priceRange: "",
    availability: "",
    gender: "",
    minRating: 0,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<any>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")

  const { t } = useTranslation()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })

  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const [isClientReady, setIsClientReady] = useState(false);

  // Verificación de autenticación (sincrónica)
  const isAuthenticated = typeof window !== "undefined" && !!localStorage.getItem("authToken")

  // Efecto para cargar datos iniciales cuando el componente se monta
  useEffect(() => {
    // Carga inicial de doctores con parámetros por defecto
    fetchDoctors("", filters, 1);
    setIsClientReady(true);
  }, []); // Array de dependencias vacío para que se ejecute solo al montar

  // Maneja la búsqueda de doctores usando filtros y consulta a la API.
  // Ejecuta la búsqueda solo al presionar el botón de búsqueda.
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    await fetchDoctors(query, filters, 1)
  }

  // Aplica los filtros seleccionados y consulta la API.
  // Ejecuta la búsqueda solo al aplicar los filtros.
  const handleFiltersChange = async (newFilters: typeof filters) => {
    setFilters(newFilters)
    await fetchDoctors(searchQuery, newFilters, 1)
  }

  // Paginación tipo "Ver más": carga la siguiente página y agrega los resultados a la lista actual.
  // El botón se desactiva si no hay más páginas.
  const handleSeeMoreDoctors = async () => {
    if (loading || pagination.page >= pagination.totalPages) return
    setLoading(true)
    setError("")
    try {
      const params: any = {
        doctor_name: searchQuery.length >= 3 ? searchQuery : undefined,
        specialty_id: filters.specialty || undefined,
        state_id: filters.state || undefined,
        city_id: filters.municipality || undefined,
        page: pagination.page + 1,
        limit: 10,
      }
      const response = await doctorService.searchDoctors(params)
      setDoctors((prev) => [...prev, ...(response.payload.results || [])])
      setPagination(response.payload.pagination || pagination)
    } catch (err: any) {
      setError(t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  // Consulta la API para obtener doctores según los filtros y la página.
  // Maneja estados de carga, error y resultados vacíos.
  const fetchDoctors = async (query: string, filters: typeof filters, page: number) => {
    setLoading(true)
    setError("")
    try {
      const params: any = {
        doctor_name: query.length >= 3 ? query : undefined,
        specialty_id: filters.specialty || undefined,
        state_id: filters.state || undefined,
        city_id: filters.municipality || undefined,
        page,
        limit: 10,
        // Enviar min_rating solo si es mayor a 0
        min_rating: filters.minRating > 0 ? filters.minRating : undefined,
        // Enviar available solo si el filtro es "Disponible ahora"
        available: filters.availability === "available" ? true : undefined,
      }
      const response = await doctorService.searchDoctors(params)
      setDoctors(response.payload.results || [])
      setPagination(response.payload.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 })
      setIsInitialLoad(false) // Ya no es carga inicial después de la primera consulta
    } catch (err: any) {
      setError(t("common.error"))
      setDoctors([])
      setPagination({ total: 0, page: 1, limit: 10, totalPages: 1 })
      setIsInitialLoad(false) // Actualizar incluso si hay error
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      specialty: "",
      state: "",
      municipality: "",
      priceRange: "",
      availability: "",
      gender: "",
      minRating: 0,
    })
    setSearchQuery("")
  }

  const handleBookAppointment = (doctorId: string) => {
    // Aquí deberías obtener el doctor desde la lista actual de resultados
    const doctor = doctors.find((d: any) => d.id.toString() === doctorId)
    if (doctor) {
      setSelectedDoctorForBooking({
        id: doctor.id.toString(),
        name: doctor.name,
        specialty: doctor.specialty,
        price: doctor.price,
        photo: doctor.image,
      })
      setIsBookingModalOpen(true)
    }
  }

  const handleAppointmentSuccess = (appointmentData: any) => {
    setNotificationMessage(`¡Cita agendada exitosamente con ${selectedDoctorForBooking?.name}!`)
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 5000)
  }

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false)
    setSelectedDoctorForBooking(null)
  }

  // Renderizado principal: muestra spinner de carga, error, resultados vacíos y paginación.
  // Los textos y mensajes están internacionalizados con react-i18next.
  return (
    <MainLayout>
      <section className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("search.heroTitle")}</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {t("search.heroSubtitle")}            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchBar
              placeholder={t("search.placeholder")}
              onSearch={handleSearch}
              value={searchQuery}
              size="lg"
              showSearchButton={true}
            />
          </div>
        </div>
      </section>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-80">
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50"
              >
                <span className="font-medium">Filtros</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${showFilters ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
              {isClientReady ? (
                <SearchFilters
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={clearFilters}
                  isAuthenticated={!!localStorage.getItem("authToken")}
                />
              ) : (
                <SearchFilters
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={clearFilters}
                  isAuthenticated={false}
                />
              )}
            </div>
          </aside>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t("search.resultsTitle")}</h2>
                <p className="text-gray-600 mt-1">
                  {loading
                    ? t("common.loading")
                    : `${pagination.total} ${t("search.doctorsFound")}${searchQuery ? ` para "${searchQuery}"` : ""}`}
                </p>
              </div>
            </div>
            {/* Estado de carga */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-10 w-10 text-federal-blue" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                <span className="ml-4 text-federal-blue font-medium">{t("common.loading")}</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-1.414 1.414M6.343 17.657l-1.414-1.414M12 8v4m0 4h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-700 mb-2">{t("common.error")}</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button onClick={clearFilters} className="text-blue-600 hover:text-blue-700 font-medium">
                  {t("search.searchButton")}
                </button>
              </div>
            ) : doctors.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {doctors.map((doctor: any) => (
                    <DoctorCard
                      key={doctor.id}
                      doctor={doctor}
                      onViewProfile={(doctorId) => window.location.assign(`/doctor/${doctorId}`)}
                      onBookAppointment={() => setSelectedDoctorForBooking(doctor)}
                    />
                  ))}
                </div>
                {/* Botón "Ver más" para paginación */}
                {pagination.page < pagination.totalPages && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleSeeMoreDoctors}
                      disabled={loading}
                      className={`px-6 py-3 bg-federal-blue text-white rounded-lg font-medium shadow hover:bg-honolulu-blue transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      {loading ? t("common.loading") : t("search.seeMoreDoctors")}
                    </button>
                  </div>
                )}
              </>
            ) : isInitialLoad ? (
              // Estado inicial - primera carga
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("search.welcome") || "Bienvenido a la búsqueda"}</h3>
                <p className="text-gray-600 mb-4">{t("search.initialLoadMessage") || "Cargando especialistas destacados..."}</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("search.noResults")}</h3>
                <p className="text-gray-600 mb-4">{t("search.placeholder")}</p>
                <button onClick={clearFilters} className="text-blue-600 hover:text-blue-700 font-medium">
                  {t("search.clearFilters") || "Limpiar filtros"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      {selectedDoctorForBooking && (
        <AppointmentBooking
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          doctor={selectedDoctorForBooking}
          onSuccess={handleAppointmentSuccess}
        />
      )}
      <NotificationToast
        message={notificationMessage}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </MainLayout>
  )
}