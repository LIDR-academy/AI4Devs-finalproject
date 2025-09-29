"use client"

import { useState } from "react"
import MainLayout from "./components/MainLayout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import DoctorProfile from "./pages/DoctorProfile"
import SearchBar from "./components/SearchBar/SearchBar"
import SearchFilters from "./components/SearchFilters/SearchFilters"
import DoctorCard from "./components/DoctorCard/DoctorCard"
import AppointmentBooking from "./components/AppointmentBooking/AppointmentBooking"
import { mockDoctors, filterDoctors, searchDoctors } from "./data/mockDoctors"
import MedicalAgenda from "./pages/MedicalAgenda"
import EditSchedule from "./pages/EditSchedule"

type ViewType = "home" | "login" | "register" | "doctorProfile" | "medicalAgenda" | "editSchedule"

function NotificationToast({
  message,
  isVisible,
  onClose,
}: {
  message: string
  isVisible: boolean
  onClose: () => void
}) {
  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function HomePage({
  onNavigateToLogin,
  onNavigateToProfile,
  onBookAppointment,
  onNavigateToMedicalAgenda,
}: {
  onNavigateToLogin: () => void
  onNavigateToProfile: (doctorId: string) => void
  onBookAppointment: (doctorId: string) => void
  onNavigateToMedicalAgenda: () => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    specialty: "",
    state: "",
    municipality: "",
    priceRange: "",
    availability: "",
    gender: "",
  })
  const [showFilters, setShowFilters] = useState(false)

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
    })
    setSearchQuery("")
  }

  return (
    <MainLayout
      onNavigateToMedicalAgenda={onNavigateToMedicalAgenda}
      onNavigateToHome={() => {}} // Will be handled by parent
    >
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
              <SearchFilters filters={filters} onFiltersChange={handleFiltersChange} onClearFilters={clearFilters} />
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

              <button
                onClick={onNavigateToLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Iniciar Sesión
              </button>
            </div>

            {filteredDoctors.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onViewProfile={(doctorId) => onNavigateToProfile(doctorId)}
                    onBookAppointment={() => onBookAppointment(doctor.id.toString())}
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
    </MainLayout>
  )
}

function App() {
  const [currentView, setCurrentView] = useState<ViewType>("home")
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("")
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<any>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")

  const navigateToLogin = () => setCurrentView("login")
  const navigateToRegister = () => setCurrentView("register")
  const navigateToHome = () => setCurrentView("home")
  const navigateToMedicalAgenda = () => setCurrentView("medicalAgenda")
  const navigateToEditSchedule = () => setCurrentView("editSchedule")

  const navigateToProfile = (doctorId: string) => {
    setSelectedDoctorId(doctorId)
    setCurrentView("doctorProfile")
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

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false)
    }, 5000)
  }

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false)
    setSelectedDoctorForBooking(null)
  }

  switch (currentView) {
    case "login":
      return <Login onNavigateToRegister={navigateToRegister} onNavigateToHome={navigateToHome} />
    case "register":
      return <Register onNavigateToLogin={navigateToLogin} onNavigateToHome={navigateToHome} />
    case "doctorProfile":
      return (
        <>
          <DoctorProfile
            doctorId={selectedDoctorId}
            onBack={navigateToHome}
            onBookAppointment={handleBookAppointment}
          />
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
        </>
      )
    case "medicalAgenda":
      return <MedicalAgenda onNavigateToHome={navigateToHome} onNavigateToEditSchedule={navigateToEditSchedule} />
    case "editSchedule":
      return <EditSchedule onNavigateToMedicalAgenda={navigateToMedicalAgenda} />
    default:
      return (
        <>
          <HomePage
            onNavigateToLogin={navigateToLogin}
            onNavigateToProfile={navigateToProfile}
            onBookAppointment={handleBookAppointment}
            onNavigateToMedicalAgenda={navigateToMedicalAgenda}
          />
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
        </>
      )
  }
}

export default App
