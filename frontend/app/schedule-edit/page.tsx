"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import MainLayout from "../../src/components/MainLayout"
import ScheduleTable from "../../src/components/ScheduleTable/ScheduleTable"
import { decodeAuthToken } from "../../src/lib/utils"
import { doctorService } from "../../src/services/doctorService"
import NotificationToast from "../../src/components/NotificationToast"

/**
 * Página de edición de disponibilidad de horario para médicos.
 * - Solo accesible para usuarios autenticados con rol "doctor".
 * - Permite consultar, modificar y eliminar rangos de disponibilidad semanal.
 * - Consume la API REST definida en Swagger para obtener y actualizar disponibilidad.
 * - Muestra estados de carga, error y notificaciones internacionalizadas.
 * - Cumple con arquitectura hexagonal: la lógica de negocio está desacoplada en servicios.
 */
export default function EditSchedulePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [schedules, setSchedules] = useState([])
  const [toast, setToast] = useState({ message: "", isVisible: false })
  const [isProcessing, setIsProcessing] = useState(false) // Nuevo estado para bloqueo durante procesamiento


  useEffect(() => {
    // Validación de permisos: solo médicos pueden acceder
    // Redirige si el usuario no tiene el rol adecuado    
    const payload = decodeAuthToken()
    if (!payload || payload.role !== "doctor") {
      router.push("/")
      return
    }

    // Consulta la disponibilidad actual del médico desde la API
    const fetchAvailability = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const doctorId = payload.id
        const response = await doctorService.getDoctorAvailability(doctorId)
        // Mapear la respuesta a formato esperado por ScheduleTable
        const availability = response?.payload?.availability || []
        const mappedSchedules = availability.map((item, idx) => ({
          id: idx.toString(),
          dayOfWeek: item.dayOfWeek,
          openingTime: item.startTime,
          closingTime: item.endTime,
        }))
        setSchedules(mappedSchedules)
      } catch (err: any) {
        setError(err?.message || "Error al cargar disponibilidad")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailability()
  }, [router])

  /**
   * Actualiza la disponibilidad del médico en la API.
   * @param scheduleId - ID del horario a modificar
   * @param updatedData - Datos actualizados (día, hora inicio, hora fin)
   */  
  const handleSaveSchedule = async (scheduleId: string, updatedData: Partial<{ day: string; startTime: string; endTime: string }>) => {
    setIsProcessing(true) // Bloquear toda la interfaz
    setError(null)
    try {
      const payload = decodeAuthToken()
      if (!payload || payload.role !== "doctor") {
        router.push("/login")
        return
      }

      // Actualiza el arreglo local con los datos actualizados
      const updatedSchedules = schedules.map((s) =>
        s.id === scheduleId ? { 
          ...s, 
          dayOfWeek: updatedData.day || s.dayOfWeek, 
          openingTime: updatedData.startTime || s.openingTime, 
          closingTime: updatedData.endTime || s.closingTime 
        } : s
      )

      // Formatear para la API - enviando todos los horarios al endpoint
      const ranges = updatedSchedules.map((s) => ({
        dayOfWeek: parseInt(s.dayOfWeek),
        startTime: s.openingTime,
        endTime: s.closingTime,
        blocked: false,
      }))

      // Usar POST según Swagger y no enviar ID en la URL
      await doctorService.updateDoctorAvailability(payload.id, { ranges })
      setSchedules(updatedSchedules)
      setToast({ message: t("scheduleEdit.messages.scheduleUpdated"), isVisible: true })
    } catch (err: any) {
      setError(err?.message || t("scheduleEdit.messages.updateError"))
      setToast({ message: t("scheduleEdit.messages.updateError"), isVisible: true })
    } finally {
      setIsProcessing(false) // Desbloquear interfaz
    }
  }

  /**
   * Elimina un rango de disponibilidad del médico en la API.
   * @param scheduleId - ID del horario a eliminar
   */  
  const handleDeleteSchedule = async (scheduleId: string) => {
    setIsProcessing(true) // Bloquear toda la interfaz
    setError(null)
    try {
      const payload = decodeAuthToken()
      if (!payload || payload.role !== "doctor") {
        router.push("/login")
        return
      }

      // Filtrar el horario eliminado del array local
      const updatedSchedules = schedules.filter((s) => s.id !== scheduleId)
      
      // Formatear correctamente para la API
      // Es importante que esto incluya TODOS los rangos actualizados, sin el eliminado
      const ranges = updatedSchedules.map((s) => ({
        dayOfWeek: parseInt(s.dayOfWeek),
        startTime: s.openingTime,
        endTime: s.closingTime,
        blocked: false,
      }))

      // Enviar la actualización completa de disponibilidad al backend
      // Esto efectivamente "elimina" el horario al no incluirlo en el nuevo array de rangos
      await doctorService.updateDoctorAvailability(payload.id, { ranges })
      
      // Solo actualizar el estado local después de confirmar que la API ha sido actualizada
      setSchedules(updatedSchedules)
      setToast({ message: t("scheduleEdit.messages.scheduleDeleted"), isVisible: true })
    } catch (err: any) {
      // Si hay un error, mostrar notificación pero NO actualizar el estado local
      // para que la UI refleje correctamente lo que está en el backend
      setError(err?.message || t("scheduleEdit.messages.deleteError"))
      setToast({ message: t("scheduleEdit.messages.deleteError"), isVisible: true })
    } finally {
      setIsProcessing(false) // Desbloquear interfaz
    }
  }

  /**
   * Agrega un nuevo horario al estado local.
   * No realiza ninguna petición al backend hasta que el usuario guarde.
   */
  const handleAddNewSchedule = () => {
    // Crear un nuevo horario vacío con ID temporal
    const newSchedule = {
      id: `temp-${Date.now()}`, // ID temporal para identificar la fila
      dayOfWeek: "",            // Sin día seleccionado por defecto
      openingTime: "",          // Sin hora de apertura por defecto
      closingTime: "",          // Sin hora de cierre por defecto
    }
    
    // Simplemente añadir al estado local (sin petición al backend)
    setSchedules((prev) => [...prev, newSchedule])
  }

  const handleGoHome = () => {
    router.push("/")
  }

  const handleGoAgenda = () => {
    router.push("/agenda")
  }

  if (isLoading) {
    return (
      <MainLayout onNavigateToHome={handleGoHome} onNavigateToMedicalAgenda={handleGoAgenda}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="h-8 bg-gray-200 rounded w-80 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-96"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            {/* Table skeleton */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="grid grid-cols-4 gap-4 items-center">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="h-10 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout onNavigateToHome={handleGoHome} onNavigateToMedicalAgenda={handleGoAgenda}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">{t("scheduleEdit.error.title")}</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null)
                setIsLoading(true)
                setTimeout(() => setIsLoading(false), 800)
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t("scheduleEdit.error.retry")}
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout onNavigateToHome={handleGoHome} onNavigateToMedicalAgenda={handleGoAgenda}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("scheduleEdit.title")}</h1>
              <p className="text-gray-600">{t("scheduleEdit.subtitle")}</p>
            </div>
            <button
              onClick={handleGoAgenda}
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t("scheduleEdit.backToAgenda")}
            </button>
          </div>
        </div>
        {/* Renderizar la tabla con los horarios obtenidos de la API */}
        <ScheduleTable
          schedules={schedules}
          onSaveSchedule={handleSaveSchedule}
          onDeleteSchedule={handleDeleteSchedule}
          onAddNewSchedule={handleAddNewSchedule}
          isProcessing={isProcessing} // Pasar estado de procesamiento para bloquear botones
        />
      </div>
      <NotificationToast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </MainLayout>
  )
}