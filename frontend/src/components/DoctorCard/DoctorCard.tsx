"use client"

import type React from "react"
import StarRating from "../StarRating/StarRating"

export interface Doctor {
  id: string
  name: string
  specialty: string
  rating: number
  reviewCount: number
  location: {
    state: string
    city: string
  }
  price: number
  image: string
  isAvailable: boolean
  nextAvailableDate?: string
}

interface DoctorCardProps {
  doctor: Doctor
  onBookAppointment?: (doctorId: string) => void
  onViewProfile?: (doctorId: string) => void
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBookAppointment, onViewProfile }) => {
  const handleBookAppointment = () => {
    onBookAppointment?.(doctor.id)
  }

  const handleViewProfile = () => {
    onViewProfile?.(doctor.id)
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      {/* Doctor Image */}
      <div className="relative h-48 bg-gradient-to-br from-federal-blue/10 to-pacific-cyan/10">
        <img
          src={doctor.image || "/placeholder.svg"}
          alt={doctor.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `/placeholder.svg?height=192&width=300&query=doctor+${doctor.specialty}`
          }}
        />
        {doctor.isAvailable && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Disponible
          </div>
        )}
      </div>

      {/* Doctor Info */}
      <div className="p-4">
        {/* Name and Specialty */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{doctor.name}</h3>
          <p className="text-federal-blue font-medium text-sm">{doctor.specialty}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={doctor.rating} size="sm" />
          <span className="text-sm text-gray-600">
            {doctor.rating.toFixed(1)} ({doctor.reviewCount} reseñas)
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mb-3">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm text-gray-600">
            {doctor.location.city}, {doctor.location.state}
          </span>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-xl font-bold text-gray-900">${doctor.price.toLocaleString()}</span>
          <span className="text-sm text-gray-500 ml-1">MXN</span>
        </div>

        {/* Next Available Date */}
        {doctor.nextAvailableDate && (
          <div className="mb-4 text-xs text-gray-500">Próxima cita: {doctor.nextAvailableDate}</div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleViewProfile}
            className="flex-1 px-3 py-2 text-sm font-medium text-federal-blue border border-federal-blue rounded-lg hover:bg-federal-blue hover:text-white transition-colors duration-200"
          >
            Ver perfil
          </button>
          <button
            onClick={handleBookAppointment}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-federal-blue rounded-lg hover:bg-federal-blue/90 transition-colors duration-200"
            disabled={!doctor.isAvailable}
          >
            {doctor.isAvailable ? "Agendar" : "No disponible"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DoctorCard
