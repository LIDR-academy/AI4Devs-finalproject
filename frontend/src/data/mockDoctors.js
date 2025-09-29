// Mock data for doctors with realistic Mexican names, specialties, and locations
export const mockDoctors = [
  {
    id: 1,
    name: "Dr. María Elena Rodríguez",
    specialty: "Cardiología",
    rating: 4.8,
    reviewCount: 127,
    location: {
      state: "Ciudad de México",
      municipality: "Miguel Hidalgo",
      address: "Av. Polanco 245, Col. Polanco",
    },
    price: 1200,
    currency: "MXN",
    isAvailable: true,
    gender: "female",
    experience: 15,
    education: "UNAM - Facultad de Medicina",
    languages: ["Español", "Inglés"],
    consultationTypes: ["Presencial", "Videollamada"],
    nextAvailableSlot: "2024-01-15T10:00:00Z",
    image: "/doctora-mexicana-cardi-loga-profesional.jpg",
  },
  {
    id: 2,
    name: "Dr. Carlos Alberto Mendoza",
    specialty: "Dermatología",
    rating: 4.9,
    reviewCount: 89,
    location: {
      state: "Jalisco",
      municipality: "Guadalajara",
      address: "Av. Américas 1500, Col. Providencia",
    },
    price: 950,
    currency: "MXN",
    isAvailable: true,
    gender: "male",
    experience: 12,
    education: "Universidad de Guadalajara",
    languages: ["Español"],
    consultationTypes: ["Presencial"],
    nextAvailableSlot: "2024-01-16T14:30:00Z",
    image: "/doctor-mexicano-dermat-logo-profesional.jpg",
  },
  {
    id: 3,
    name: "Dra. Ana Sofía Herrera",
    specialty: "Pediatría",
    rating: 4.7,
    reviewCount: 156,
    location: {
      state: "Nuevo León",
      municipality: "Monterrey",
      address: "Av. Constitución 2000, Col. Centro",
    },
    price: 800,
    currency: "MXN",
    isAvailable: false,
    gender: "female",
    experience: 18,
    education: "Tecnológico de Monterrey",
    languages: ["Español", "Inglés"],
    consultationTypes: ["Presencial", "Videollamada"],
    nextAvailableSlot: "2024-01-18T09:00:00Z",
    image: "/doctora-mexicana-pediatra-profesional.jpg",
  },
  {
    id: 4,
    name: "Dr. Roberto Jiménez",
    specialty: "Neurología",
    rating: 4.6,
    reviewCount: 73,
    location: {
      state: "Puebla",
      municipality: "Puebla",
      address: "Blvd. 5 de Mayo 1234, Col. Centro",
    },
    price: 1500,
    currency: "MXN",
    isAvailable: true,
    gender: "male",
    experience: 20,
    education: "BUAP - Benemérita Universidad Autónoma de Puebla",
    languages: ["Español", "Francés"],
    consultationTypes: ["Presencial"],
    nextAvailableSlot: "2024-01-17T11:00:00Z",
    image: "/doctor-mexicano-neur-logo-profesional.jpg",
  },
  {
    id: 5,
    name: "Dra. Gabriela Torres",
    specialty: "Ginecología",
    rating: 4.9,
    reviewCount: 201,
    location: {
      state: "Yucatán",
      municipality: "Mérida",
      address: "Calle 60 #450, Col. Centro Histórico",
    },
    price: 1100,
    currency: "MXN",
    isAvailable: true,
    gender: "female",
    experience: 14,
    education: "Universidad Autónoma de Yucatán",
    languages: ["Español", "Maya"],
    consultationTypes: ["Presencial", "Videollamada"],
    nextAvailableSlot: "2024-01-15T16:00:00Z",
    image: "/doctora-mexicana-ginec-loga-profesional.jpg",
  },
  {
    id: 6,
    name: "Dr. Fernando López",
    specialty: "Ortopedia",
    rating: 4.5,
    reviewCount: 94,
    location: {
      state: "Baja California",
      municipality: "Tijuana",
      address: "Av. Revolución 1500, Zona Centro",
    },
    price: 1300,
    currency: "MXN",
    isAvailable: true,
    gender: "male",
    experience: 16,
    education: "UABC - Universidad Autónoma de Baja California",
    languages: ["Español", "Inglés"],
    consultationTypes: ["Presencial"],
    nextAvailableSlot: "2024-01-16T08:30:00Z",
    image: "/doctor-mexicano-ortopedista-profesional.jpg",
  },
  {
    id: 7,
    name: "Dra. Patricia Morales",
    specialty: "Psiquiatría",
    rating: 4.8,
    reviewCount: 112,
    location: {
      state: "Veracruz",
      municipality: "Veracruz",
      address: "Av. Independencia 800, Col. Centro",
    },
    price: 900,
    currency: "MXN",
    isAvailable: true,
    gender: "female",
    experience: 13,
    education: "Universidad Veracruzana",
    languages: ["Español"],
    consultationTypes: ["Presencial", "Videollamada"],
    nextAvailableSlot: "2024-01-17T15:00:00Z",
    image: "/doctora-mexicana-psiquiatra-profesional.jpg",
  },
  {
    id: 8,
    name: "Dr. Miguel Ángel Ruiz",
    specialty: "Oftalmología",
    rating: 4.7,
    reviewCount: 68,
    location: {
      state: "Guanajuato",
      municipality: "León",
      address: "Blvd. López Mateos 2500, Col. Jardines del Moral",
    },
    price: 1000,
    currency: "MXN",
    isAvailable: false,
    gender: "male",
    experience: 11,
    education: "Universidad de Guanajuato",
    languages: ["Español", "Inglés"],
    consultationTypes: ["Presencial"],
    nextAvailableSlot: "2024-01-19T10:30:00Z",
    image: "/doctor-mexicano-oftalm-logo-profesional.jpg",
  },
  {
    id: 9,
    name: "Dra. Lucía Ramírez",
    specialty: "Endocrinología",
    rating: 4.6,
    reviewCount: 85,
    location: {
      state: "Sonora",
      municipality: "Hermosillo",
      address: "Blvd. Luis Encinas 1200, Col. San Benito",
    },
    price: 1150,
    currency: "MXN",
    isAvailable: true,
    gender: "female",
    experience: 17,
    education: "Universidad de Sonora",
    languages: ["Español", "Inglés"],
    consultationTypes: ["Presencial", "Videollamada"],
    nextAvailableSlot: "2024-01-16T13:00:00Z",
    image: "/doctora-mexicana-endocrin-loga-profesional.jpg",
  },
  {
    id: 10,
    name: "Dr. Alejandro Castro",
    specialty: "Urología",
    rating: 4.4,
    reviewCount: 57,
    location: {
      state: "Chihuahua",
      municipality: "Chihuahua",
      address: "Av. Universidad 3000, Col. Magisterial",
    },
    price: 1250,
    currency: "MXN",
    isAvailable: true,
    gender: "male",
    experience: 19,
    education: "Universidad Autónoma de Chihuahua",
    languages: ["Español"],
    consultationTypes: ["Presencial"],
    nextAvailableSlot: "2024-01-18T12:00:00Z",
    image: "/doctor-mexicano-ur-logo-profesional.jpg",
  },
  {
    id: 11,
    name: "Dra. Carmen Delgado",
    specialty: "Reumatología",
    rating: 4.8,
    reviewCount: 91,
    location: {
      state: "Oaxaca",
      municipality: "Oaxaca de Juárez",
      address: "Av. Independencia 700, Col. Centro",
    },
    price: 850,
    currency: "MXN",
    isAvailable: true,
    gender: "female",
    experience: 15,
    education: "Universidad Autónoma Benito Juárez de Oaxaca",
    languages: ["Español", "Zapoteco"],
    consultationTypes: ["Presencial"],
    nextAvailableSlot: "2024-01-17T09:30:00Z",
    image: "/doctora-mexicana-reumat-loga-profesional.jpg",
  },
  {
    id: 12,
    name: "Dr. Raúl Vázquez",
    specialty: "Gastroenterología",
    rating: 4.7,
    reviewCount: 103,
    location: {
      state: "Tamaulipas",
      municipality: "Tampico",
      address: "Av. Hidalgo 1800, Col. Centro",
    },
    price: 1050,
    currency: "MXN",
    isAvailable: false,
    gender: "male",
    experience: 14,
    education: "Universidad Autónoma de Tamaulipas",
    languages: ["Español", "Inglés"],
    consultationTypes: ["Presencial", "Videollamada"],
    nextAvailableSlot: "2024-01-20T14:00:00Z",
    image: "/doctor-mexicano-gastroenter-logo-profesional.jpg",
  },
]

// Helper functions for filtering and searching
export const filterDoctors = (doctors, filters) => {
  return doctors.filter((doctor) => {
    // Specialty filter
    if (filters.specialty && doctor.specialty !== filters.specialty) {
      return false
    }

    // State filter
    if (filters.state && doctor.location.state !== filters.state) {
      return false
    }

    // Municipality filter
    if (filters.municipality && doctor.location.municipality !== filters.municipality) {
      return false
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange
      if (doctor.price < min || doctor.price > max) {
        return false
      }
    }

    // Availability filter
    if (filters.availability === "available" && !doctor.isAvailable) {
      return false
    }

    // Gender filter
    if (filters.gender && doctor.gender !== filters.gender) {
      return false
    }

    return true
  })
}

export const searchDoctors = (doctors, searchTerm) => {
  if (!searchTerm) return doctors

  const term = searchTerm.toLowerCase()
  return doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(term) ||
      doctor.specialty.toLowerCase().includes(term) ||
      doctor.location.state.toLowerCase().includes(term) ||
      doctor.location.municipality.toLowerCase().includes(term),
  )
}

// Get unique values for filter options
export const getUniqueSpecialties = (doctors) => {
  return [...new Set(doctors.map((doctor) => doctor.specialty))].sort()
}

export const getUniqueStates = (doctors) => {
  return [...new Set(doctors.map((doctor) => doctor.location.state))].sort()
}

export const getMunicipalitiesByState = (doctors, state) => {
  return [
    ...new Set(
      doctors.filter((doctor) => doctor.location.state === state).map((doctor) => doctor.location.municipality),
    ),
  ].sort()
}
