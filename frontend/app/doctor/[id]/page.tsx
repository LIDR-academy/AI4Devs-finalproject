"use client"

import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import MainLayout from "../../../src/components/MainLayout"
import { Button } from "../../../src/components/ui/Button"
import { StarRating } from "../../../src/components/StarRating/StarRating"
import { doctorService } from "../../../src/services/doctorService"
import { authService } from "../../../src/services/authService"


export default function DoctorProfilePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const reviewsPerPage = 3
  const isAuthenticated = authService.isAuthenticated()

  // Efecto para obtener datos del doctor por ID
  useEffect(() => {
    async function fetchDoctor() {
      setLoading(true)
      setError("")
      try {
        const response = await doctorService.getDoctorProfile(id)
        const data = response?.payload
        if (data) {
          setDoctor({
            id: data.id,
            name: data.name,
            specialty: data.specialty,
            biography: data.biography,
            photo: data.photo,
            licenseNumber: data.licenseNumber,
            title: data.title,
            city: data.city,
            state: data.state,
            avgRating: data.avgRating ?? 0,
            // Campos sensibles (siempre ocultos para visitante)
            address: null,
            phone: null,
            email: null,
            // Mock de reviews y otros campos si se requieren en el futuro
            reviews: [],
            experience: "",
            languages: [],
            about: data.biography,
            schedule: {},
            price: 0,
            availability: "",
            location: `${data.city}, ${data.state}`,
          })
        } else {
          setDoctor(null)
        }
      } catch (err) {
        setError(
          err?.message ||
            t("common.error") ||
            "Error al cargar el perfil del especialista"
        )
        setDoctor(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchDoctor()
  }, [id, t])

  const totalReviews = doctor?.reviews?.length || 0
  const totalPages = Math.ceil(totalReviews / reviewsPerPage)
  const startIndex = (currentPage - 1) * reviewsPerPage
  const endIndex = startIndex + reviewsPerPage
  const currentReviews = doctor?.reviews?.slice(startIndex, endIndex) || []

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const reviewsSection = document.getElementById("reviews-section")
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleBack = () => {
    router.push("/")
  }

  const handleBookAppointment = (doctorId: string) => {
    router.push(`/appointment-booking?doctorId=${doctorId}`)
  }

  // Leyenda para campos sensibles
  const sensitiveInfoMsg = t("doctorProfile.sensitiveInfoMsg", {
    defaultValue: "Para ver esta información inicia sesión o registrate",
  })

  // Renderizado de estados de carga, error y datos vacíos
  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <span className="text-lg text-gray-600">{t("common.loading")}</span>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center h-96">
          <span className="text-lg text-red-600">{error}</span>
          <Button onClick={handleBack} className="mt-4">
            {t("doctorProfile.backToResults")}
          </Button>
        </div>
      </MainLayout>
    )
  }

  if (!doctor) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center h-96">
          <span className="text-lg text-gray-600">
            {t("search.noResults")}
          </span>
          <Button onClick={handleBack} className="mt-4">
            {t("doctorProfile.backToResults")}
          </Button>
        </div>
      </MainLayout>
    )
  }

  // Procesar especialidades como lista
  const specialtiesList = doctor.specialty
    ? doctor.specialty.split(",").map((s) => s.trim())
    : []

  // Imagen del médico especialista
  const image =
    doctor.image && doctor.image.trim()
      ? doctor.image
      : doctor.photo && doctor.photo.trim()
        ? doctor.photo
        : "/images/login-hero.jpg"  

  return (
    <MainLayout>
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={handleBack} className="flex items-center text-blue-600 hover:text-blue-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("doctorProfile.backToResults")}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Doctor Info Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <img
                  src={image}
                  alt={doctor.name}
                  className="w-32 h-32 rounded-lg object-cover mx-auto sm:mx-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                  <p className="text-xl text-blue-600 mb-2">{doctor.title}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <StarRating rating={doctor.avgRating} />
                    <span className="text-gray-600">
                      {doctor.avgRating ? `${doctor.avgRating} ${t("doctorProfile.stars")}` : `0 ${t("doctorProfile.stars")}`}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{doctor.location}</p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("doctorProfile.aboutDoctor")}</h2>
              <p className="text-gray-700 leading-relaxed">{doctor.biography}</p>
            </div>

            {/* Educación y Especialidades */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("doctorProfile.medicalProfile")}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{t("doctorProfile.licenseNumber")}</h3>
                  <p className="text-gray-700">{doctor.licenseNumber || "-"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t("doctorProfile.specialty")}</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {specialtiesList.length > 0 ? (
                      specialtiesList.map((spec, idx) => <li key={idx}>{spec}</li>)
                    ) : (
                      <li>-</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Reviews with Pagination */}
            <div id="reviews-section" className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{t("doctorProfile.patientReviews")}</h2>
                {/* Ocultar label de paginación si no hay sesión */}
                {isAuthenticated && (
                  <span className="text-sm text-gray-500">
                    {t("doctorProfile.pagination.showingReviews", {
                      start: startIndex + 1,
                      end: Math.min(endIndex, totalReviews),
                      total: totalReviews,
                    })}
                  </span>
                )}
              </div>

              {/* Contenido de reseñas */}
              {!isAuthenticated ? (
                <div className="flex items-center gap-2 text-gray-500 py-8 justify-center">
                  {/* Icono de candado */}
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V7a6 6 0 10-12 0v3a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-8-3a4 4 0 118 0v3" />
                  </svg>
                  <span>{t("doctorProfile.sensitiveInfoMsg")}</span>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {currentReviews.length === 0 && (
                      <p className="text-gray-500">{t("search.noResults")}</p>
                    )}
                    {currentReviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={review.rating} />
                          <span className="font-medium text-gray-900">{review.patientName}</span>
                          <span className="text-gray-500 text-sm">{review.date}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          {t("doctorProfile.pagination.previousPage")}
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              className="min-w-[40px]"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>

                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          {t("doctorProfile.pagination.nextPage")}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              {/* Quitar precio por consulta */}
              {/* Badge con leyenda si no hay sesión */}
              <div className="mb-4">
                {!isAuthenticated ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 gap-2">
                    {/* Icono de candado */}
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V7a6 6 0 10-12 0v3a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-8-3a4 4 0 118 0v3" />
                    </svg>
                    {t("doctorProfile.bookingInfoMsg")}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {doctor.availability}
                  </span>
                )}
              </div>
              <Button
                onClick={() => handleBookAppointment(doctor.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={!isAuthenticated}
              >
                {t("doctorProfile.bookAppointment")}
              </Button>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t("doctorProfile.officeHours")}</h3>
              <div className="space-y-2">
                {!isAuthenticated ? (
                  <span className="flex items-center gap-2 text-gray-500">
                    {/* Icono de candado */}
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V7a6 6 0 10-12 0v3a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-8-3a4 4 0 118 0v3" />
                    </svg>
                    {t("doctorProfile.sensitiveInfoMsg")}
                  </span>
                ) : Object.entries(doctor.schedule).length === 0 ? (
                  <span className="text-gray-500">{t("doctorProfile.notAvailable")}</span>
                ) : (
                  Object.entries(doctor.schedule).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-gray-600">{day}</span>
                      <span className="text-gray-900">{hours}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t("doctorProfile.contactInfo")}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-gray-700 text-sm">{doctor.city}, {doctor.state}</p>
                    <p className="text-gray-500 text-xs">{sensitiveInfoMsg}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <p className="text-gray-500 text-xs">{sensitiveInfoMsg}</p>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-500 text-xs">{sensitiveInfoMsg}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}