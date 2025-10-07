"use client"

import MainLayout from "../src/components/MainLayout"
import { useState } from "react"
import SearchBar from "../src/components/SearchBar/SearchBar"
import SearchFilters from "../src/components/SearchFilters/SearchFilters"
import DoctorCard from "../src/components/DoctorCard/DoctorCard"
import AppointmentBooking from "../src/components/AppointmentBooking/AppointmentBooking"
import NotificationToast from "../src/components/NotificationToast"
import { mockDoctors, searchDoctors } from "../src/data/mockDoctors"
import { filterDoctors } from "../src/services/patientService"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    specialty: "",
    state: "",
    municipality: "",
    priceRange: "",
    availability: "",
    gender: "",
    minRating: 0, // Nuevo campo
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<any>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")

  // Verificación de autenticación (sincrónica)
  // Si existe el token en localStorage, el usuario está autenticado y se habilitan filtros avanzados
  const isAuthenticated = typeof window !== "undefined" && !!localStorage.getItem("authToken")

  // Se utiliza patientService.filterDoctors para aplicar todos los filtros, incluyendo valoración mínima si corresponde
  const filteredDoctors = filterDoctors(searchDoctors(mockDoctors, searchQuery), filters)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const clearFilters = () => {
    setFilters({
      specialty: "",
      state: "",
      municipality: "",
      priceRange: "",
      availability: "",
      gender: "",
      minRating: 0, // Nuevo campo
    })
    setSearchQuery("")
  }

  const handleBookAppointment = (doctorId: string) => {
    const doctor = mockDoctors.find((d) => d.id.toString() === doctorId)
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

  return (
    <MainLayout>
      <section className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Encuentra tu especialista médico</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Conecta con los mejores doctores especializados en tu área
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchBar
              placeholder="Buscar especialista, nombre o especialidad..."
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
              <SearchFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
                isAuthenticated={isAuthenticated} // Prop para mostrar/ocultar filtros avanzados
              />
            </div>
          </aside>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Especialistas disponibles</h2>
                <p className="text-gray-600 mt-1">
                  {filteredDoctors.length} doctores encontrados
                  {searchQuery && ` para "${searchQuery}"`}
                </p>
              </div>
            </div>
            {filteredDoctors.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onViewProfile={(doctorId) => window.location.assign(`/doctor/${doctorId}`)}
                    onBookAppointment={() => handleBookAppointment(doctor.id.toString())}
                  />
                ))}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron especialistas</h3>
                <p className="text-gray-600 mb-4">Intenta ajustar tus filtros de búsqueda</p>
                <button onClick={clearFilters} className="text-blue-600 hover:text-blue-700 font-medium">
                  Limpiar filtros
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