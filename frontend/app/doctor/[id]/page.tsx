"use client"

import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import MainLayout from "../../../src/components/MainLayout"
import { Button } from "../../../src/components/ui/Button"
import { StarRating } from "../../../src/components/StarRating/StarRating"

export default function DoctorProfilePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const reviewsPerPage = 3

  // Aquí deberías obtener el doctor por ID desde tu servicio o mock
  const mockDoctors = [
    {
      id: "1",
      name: t("doctorProfile.mockData.name"),
      specialty: t("doctorProfile.mockData.specialty"),
      location: t("doctorProfile.mockData.location"),
      rating: 4.8,
      reviewCount: 127,
      price: 800,
      availability: t("doctorProfile.mockData.availability"),
      photo: "/professional-mexican-female-doctor.jpg",
      experience: t("doctorProfile.mockData.experience"),
      education: t("doctorProfile.mockData.education"),
      certifications: [
        t("doctorProfile.mockData.certifications.0"),
        t("doctorProfile.mockData.certifications.1"),
        t("doctorProfile.mockData.certifications.2"),
      ],
      languages: [t("doctorProfile.mockData.languages.0"), t("doctorProfile.mockData.languages.1")],
      about: t("doctorProfile.mockData.about"),
      schedule: {
        [t("doctorProfile.schedule.monday")]: "9:00 AM - 6:00 PM",
        [t("doctorProfile.schedule.tuesday")]: "9:00 AM - 6:00 PM",
        [t("doctorProfile.schedule.wednesday")]: "9:00 AM - 6:00 PM",
        [t("doctorProfile.schedule.thursday")]: "9:00 AM - 6:00 PM",
        [t("doctorProfile.schedule.friday")]: "9:00 AM - 4:00 PM",
        [t("doctorProfile.schedule.saturday")]: "9:00 AM - 2:00 PM",
        [t("doctorProfile.schedule.sunday")]: t("doctorProfile.schedule.closed"),
      },
      address: t("doctorProfile.mockData.address"),
      phone: "+52 55 1234 5678",
      email: "dra.gonzalez@hospital.com",
      reviews: [
        {
          id: 1,
          patientName: t("doctorProfile.mockData.reviews.0.patientName"),
          rating: 5,
          comment: t("doctorProfile.mockData.reviews.0.comment"),
          date: "2024-01-15",
        },
        {
          id: 2,
          patientName: t("doctorProfile.mockData.reviews.1.patientName"),
          rating: 5,
          comment: t("doctorProfile.mockData.reviews.1.comment"),
          date: "2024-01-10",
        },
        {
          id: 3,
          patientName: t("doctorProfile.mockData.reviews.2.patientName"),
          rating: 4,
          comment: t("doctorProfile.mockData.reviews.2.comment"),
          date: "2024-01-05",
        },
        {
          id: 4,
          patientName: "Roberto Silva",
          rating: 5,
          comment: "Excelente profesional, muy atenta y dedicada. Resolvió todas mis dudas.",
          date: "2024-01-02",
        },
        {
          id: 5,
          patientName: "Patricia Morales",
          rating: 4,
          comment: "Muy buena doctora, el diagnóstico fue acertado y el tratamiento efectivo.",
          date: "2023-12-28",
        },
        {
          id: 6,
          patientName: "Miguel Torres",
          rating: 5,
          comment: "Recomiendo ampliamente a la Dra. González. Muy profesional y empática.",
          date: "2023-12-20",
        },
        {
          id: 7,
          patientName: "Elena Vargas",
          rating: 4,
          comment: "Buena atención médica, instalaciones limpias y personal amable.",
          date: "2023-12-15",
        },
      ],
    },
  ]

  const doctor = mockDoctors.find((d) => d.id === id) || mockDoctors[0]

  const totalReviews = doctor.reviews.length
  const totalPages = Math.ceil(totalReviews / reviewsPerPage)
  const startIndex = (currentPage - 1) * reviewsPerPage
  const endIndex = startIndex + reviewsPerPage
  const currentReviews = doctor.reviews.slice(startIndex, endIndex)

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
    // Aquí podrías navegar a la página de reserva o abrir un modal
    router.push(`/appointment-booking?doctorId=${doctorId}`)
  }

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
                  src={doctor.photo || "/placeholder.svg"}
                  alt={doctor.name}
                  className="w-32 h-32 rounded-lg object-cover mx-auto sm:mx-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                  <p className="text-xl text-blue-600 mb-2">{doctor.specialty}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <StarRating rating={doctor.rating} />
                    <span className="text-gray-600">
                      ({doctor.reviewCount} {t("doctorProfile.reviews")})
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{doctor.experience}</p>
                  <p className="text-gray-600">{doctor.location}</p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("doctorProfile.aboutDoctor")}</h2>
              <p className="text-gray-700 leading-relaxed">{doctor.about}</p>
            </div>

            {/* Education & Certifications */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("doctorProfile.educationCertifications")}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{t("doctorProfile.education")}</h3>
                  <p className="text-gray-700">{doctor.education}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t("doctorProfile.certifications")}</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {doctor.certifications.map((cert, index) => (
                      <li key={index}>{cert}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t("doctorProfile.languages")}</h3>
                  <p className="text-gray-700">{doctor.languages.join(", ")}</p>
                </div>
              </div>
            </div>

            {/* Reviews with Pagination */}
            <div id="reviews-section" className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{t("doctorProfile.patientReviews")}</h2>
                <span className="text-sm text-gray-500">
                  {t("doctorProfile.pagination.showingReviews", {
                    start: startIndex + 1,
                    end: Math.min(endIndex, totalReviews),
                    total: totalReviews,
                  })}
                </span>
              </div>

              {/* Reviews List */}
              <div className="space-y-4 mb-6">
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-gray-900">${doctor.price}</p>
                <p className="text-gray-600">{t("doctorProfile.perConsultation")}</p>
              </div>
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {doctor.availability}
                </span>
              </div>
              <Button
                onClick={() => handleBookAppointment(doctor.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                {t("doctorProfile.bookAppointment")}
              </Button>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t("doctorProfile.officeHours")}</h3>
              <div className="space-y-2">
                {Object.entries(doctor.schedule).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-gray-600">{day}</span>
                    <span className="text-gray-900">{hours}</span>
                  </div>
                ))}
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
                  <p className="text-gray-700 text-sm">{doctor.address}</p>
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
                  <p className="text-gray-700 text-sm">{doctor.phone}</p>
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
                  <p className="text-gray-700 text-sm">{doctor.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}