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
import AppointmentBooking from "../../../src/components/AppointmentBooking/AppointmentBooking"
import { decodeAuthToken } from "../../../src/lib/utils"
import NotificationToast from "../../../src/components/NotificationToast"


export default function DoctorProfilePage() {
  // Hooks de navegación y traducción
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  // Estados para el perfil del doctor y paginación de reseñas
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const reviewsPerPage = 3

  // Estado de autenticación del usuario
  const isAuthenticated = authService.isAuthenticated()


  /**
   * Efecto para obtener el perfil del doctor por ID.
   * Asigna los campos sensibles solo si el usuario está autenticado.
   */
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
            // Asignar los campos sensibles correctamente
            address: data.address,
            phone: data.phone,
            email: data.email,
            available: data.available,
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

  // Estados para la disponibilidad del médico
  const [doctorAvailability, setDoctorAvailability] = useState([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState("")

  /**
   * Efecto para consultar la disponibilidad del médico.
   * Solo se ejecuta si el usuario está autenticado y el ID cambia.
   * Filtra y muestra solo los horarios con available=true.
   */
  useEffect(() => {
    // Limpiar estados al cambiar de doctor
    setDoctorAvailability([])
    setAvailabilityError("")
    if (!isAuthenticated || !id) return

    setLoadingAvailability(true)
    doctorService.getDoctorAvailability(id)
      .then((response) => {
        // Filtrar solo horarios disponibles
        const availableSchedules = (response?.payload.availability || []).filter(
          (slot) => slot.available === true
        )
        setDoctorAvailability(availableSchedules)
      })
      .catch((error) => {
        // Internacionalizar errores conocidos
        let errorMsg = t("doctorProfile.notAvailable")
        if (error?.message === "Doctor not found") {
          errorMsg = t("search.noResults")
        } else if (error?.message === "No availability defined") {
          errorMsg = t("doctorProfile.notAvailable")
        }
        setAvailabilityError(errorMsg)
      })
      .finally(() => {
        setLoadingAvailability(false)
      })
  }, [id, isAuthenticated, t])

  // Estados para comentarios y paginación de reseñas
  const [doctorComments, setDoctorComments] = useState([])
  const [commentsPagination, setCommentsPagination] = useState({
    total: 0,
    page: 1,
    limit: 3,
    totalPages: 1,
  })
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentsError, setCommentsError] = useState("")

  /**
   * Efecto para consultar los comentarios del médico.
   * Solo se ejecuta si el usuario está autenticado y el ID o la página cambia.
   * Limpia los estados al cambiar de doctor.
   */
  useEffect(() => {
    setDoctorComments([])
    setCommentsError("")
    setCommentsPagination({
      total: 0,
      page: currentPage,
      limit: reviewsPerPage,
      totalPages: 1,
    })

    if (!isAuthenticated || !id) return

    setLoadingComments(true)
    doctorService.getDoctorComments(id, { page: currentPage, limit: reviewsPerPage })
      .then((response) => {
        const payload = response?.payload || {}
        setDoctorComments(payload.results || [])
        setCommentsPagination(payload.pagination || {
          total: 0,
          page: currentPage,
          limit: reviewsPerPage,
          totalPages: 1,
        })
      })
      .catch((error) => {
        // Internacionalizar errores conocidos
        let errorMsg = t("doctorProfile.notAvailable")
        if (error?.message === "Doctor not found") {
          errorMsg = t("search.noResults")
        } else if (error?.message === "Unauthorized") {
          errorMsg = t("doctorProfile.sensitiveInfoMsg")
        }
        setCommentsError(errorMsg)
      })
      .finally(() => {
        setLoadingComments(false)
      })
  }, [id, isAuthenticated, currentPage, t])


  // Estado para el modal de agendamiento y notificación
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState("")

  // Detectar query param book=1 y abrir modal automáticamente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("book") === "1") {
        const user = decodeAuthToken()
        if (user?.role === "patient") {
          setIsBookingOpen(true)
        } else {
          setToastMsg(t("doctorProfile.registerAsPatientMsg"))
          setShowToast(true)
        }
      }
    }
  }, [id])

  // Eliminar el query param book=1 al cerrar el modal
  const handleCloseBooking = () => {
    setIsBookingOpen(false)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("book") === "1") {
        params.delete("book")
        const newUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "")
        window.history.replaceState({}, "", newUrl)
      }
    }
  }

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
    if (typeof window !== "undefined") {
      const user = decodeAuthToken()
      if (user?.role === "patient") {
        const params = new URLSearchParams(window.location.search)
        params.set("book", "1")
        const newUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "")
        window.history.replaceState({}, "", newUrl)
        setIsBookingOpen(true)
      } else {
        setToastMsg(t("doctorProfile.registerAsPatientMsg"))
        setShowToast(true)
      }
    }
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
  
  const unavailableMsg = t("doctor.notAvailable")


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

            {/* Perfil Médico */}
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
            {/**
             * Renderizado condicional de la tarjeta "Reviews with Pagination":
             * - Si no hay sesión, muestra la leyenda internacionalizada y mock.
             * - Si está cargando, muestra spinner visual.
             * - Si hay error, muestra mensaje internacionalizado.
             * - Si no hay comentarios, muestra la leyenda de no resultados.
             * - Si hay comentarios, los muestra paginados, con nombre y fecha formateada.
             */}
            <div id="reviews-section" className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{t("doctorProfile.patientReviews")}</h2>
                {/* Ocultar label de paginación si no hay sesión */}
                {isAuthenticated && commentsPagination.total > 0 && (
                  <span className="text-sm text-gray-500">
                    {t("doctorProfile.pagination.showingReviews", {
                      start: commentsPagination.total === 0
                        ? 0
                        : (commentsPagination.page - 1) * commentsPagination.limit + 1,
                      end: commentsPagination.total === 0
                        ? 0
                        : Math.min(commentsPagination.page * commentsPagination.limit, commentsPagination.total),
                      total: commentsPagination.total,
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
              ) : loadingComments ? (
                // Estado de carga
                <span className="flex items-center gap-2 text-gray-500 py-8 justify-center">
                  <svg className="animate-spin w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                  {t("common.loading")}
                </span>
              ) : commentsError ? (
                // Estado de error
                <span className="text-red-500">{commentsError}</span>
              ) : doctorComments.length === 0 ? (
                // Sin comentarios disponibles
                <span className="text-gray-500">{t("search.noResults")}</span>
              ) : (
                // Mostrar comentarios paginados
                <>
                  <div className="space-y-4 mb-6">
                    {doctorComments.map((review, idx) => (
                      <div key={idx} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={review.score} />
                          <span className="font-medium text-gray-900">
                            {review.anonymous ? t("doctorProfile.anonymous", { defaultValue: "Anónimo" }) : review.patient_name}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {/* Formatear fecha en español */}
                            {review.created_at
                              ? new Date(review.created_at).toLocaleDateString("es-MX", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : ""}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>

                  {commentsPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handlePageChange(commentsPagination.page - 1)}
                          disabled={commentsPagination.page === 1}
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
                          {Array.from({ length: commentsPagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              variant={commentsPagination.page === page ? "default" : "outline"}
                              size="sm"
                              className="min-w-[40px]"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>

                        <Button
                          onClick={() => handlePageChange(commentsPagination.page + 1)}
                          disabled={commentsPagination.page === commentsPagination.totalPages}
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
              <div className="mb-4">
                {isAuthenticated ? (
                  doctor.available ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 gap-2">
                      {/* Icono de check */}
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t("doctorProfile.availableToday")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 gap-2">
                      {/* Icono de candado */}
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {unavailableMsg}
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 gap-2">
                    {/* Icono de candado */}
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V7a6 6 0 10-12 0v3a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-8-3a4 4 0 118 0v3" />
                    </svg>
                    {t("doctorProfile.bookingInfoMsg")}
                  </span>
                )}
              </div>
              <Button
                onClick={() => handleBookAppointment(doctor.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={!isAuthenticated || !doctor.available}
              >
                {t("doctorProfile.bookAppointment")}
              </Button>
            </div>
            
            {/* Schedule */}
            {/**
             * Renderizado condicional de la tarjeta "Schedule":
             * - Si no hay sesión, muestra la leyenda internacionalizada.
             * - Si está cargando, muestra spinner/texto de carga.
             * - Si hay error, muestra mensaje internacionalizado.
             * - Si no hay horarios, muestra leyenda de no disponible.
             * - Si hay horarios, los muestra agrupados por día.
             */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t("doctorProfile.officeHours")}</h3>
              <div className="space-y-2">
                {/* Si no hay sesión, mostrar leyenda */}
                {!isAuthenticated ? (
                  <span className="flex items-center gap-2 text-gray-500">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V7a6 6 0 10-12 0v3a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-8-3a4 4 0 118 0v3" />
                    </svg>
                    {t("doctorProfile.sensitiveInfoMsg")}
                  </span>
                ) : loadingAvailability ? (
                  // Estado de carga
                  <span className="flex items-center gap-2 text-gray-500">
                    <svg className="animate-spin w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                    {t("common.loading")}
                  </span>
                ) : availabilityError ? (
                  // Estado de error
                  <span className="text-red-500">{availabilityError}</span>
                ) : doctorAvailability.length === 0 ? (
                  // Sin horarios disponibles
                  <span className="text-gray-500">{t("doctorProfile.notAvailable")}</span>
                ) : (
                  // Mostrar horarios disponibles agrupados por día
                  doctorAvailability.map((slot, idx) => {
                    // Mapear el número de día a la clave internacionalizada
                    const dayNames = [
                      t("doctorProfile.schedule.sunday"),
                      t("doctorProfile.schedule.monday"),
                      t("doctorProfile.schedule.tuesday"),
                      t("doctorProfile.schedule.wednesday"),
                      t("doctorProfile.schedule.thursday"),
                      t("doctorProfile.schedule.friday"),
                      t("doctorProfile.schedule.saturday"),
                    ]
                    return (
                      <div key={idx} className="flex justify-between">
                        <span className="text-gray-600">{dayNames[slot.dayOfWeek]}</span>
                        <span className="text-gray-900">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t("doctorProfile.contactInfo")}</h3>
              <div className="space-y-3">
                {/* Ciudad, Estado y Dirección */}
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
                    <p className="text-gray-700 text-sm">{doctor.city}, {doctor.state}{isAuthenticated
                      ? `, ${doctor.address || unavailableMsg}` 
                      : ""}</p>
                  </div>
                </div>
                {/* Email */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-500 text-xs">
                    {isAuthenticated
                      ? doctor.email
                        ? <a href={`mailto:${doctor.email}`} className="underline text-blue-600">{doctor.email}</a>
                        : unavailableMsg
                      : t("doctorProfile.sensitiveInfoMsg")}
                  </p>
                </div>
                {/* Teléfono */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <p className="text-gray-500 text-xs">
                    {isAuthenticated
                      ? doctor.phone
                        ? <a href={`tel:${doctor.phone}`} className="underline text-blue-600">{doctor.phone}</a>
                        : unavailableMsg
                      : t("doctorProfile.sensitiveInfoMsg")}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      {/* Modal de agendamiento de cita */}
      <AppointmentBooking
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        doctor={doctor}
        onSuccess={() => {
          setToastMsg(t("appointment.bookSuccess"))
          setShowToast(true)
        }}
      />
      {/* Toast de notificación para usuarios no pacientes */}
      <NotificationToast
        message={toastMsg}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </MainLayout>
  )
}