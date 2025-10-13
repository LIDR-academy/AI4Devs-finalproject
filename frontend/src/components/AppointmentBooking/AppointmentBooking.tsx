"use client"

// Componente principal para agendar citas médicas.
// Implementa accesibilidad, internacionalización y validaciones.
// Utiliza el sistema de pasos para guiar al usuario en el flujo de reserva.
import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog"
import { Calendar } from "../../../components/ui/calendar"
import { Button } from "../ui/Button"
import Input from "../ui/Input"
import { patientService } from "../../services/patientService"
import { useTranslation } from "react-i18next"
import { doctorService } from "../../services/doctorService"

// Props del componente: controla apertura, cierre y datos del doctor.
interface AppointmentBookingProps {
  isOpen: boolean
  onClose: () => void
  doctor: {
    id: string
    name: string
    specialty: string
    price: number
    photo?: string
  }
  onSuccess?: (appointmentData: any) => void
}

// Estructura de datos del formulario de cita.
interface AppointmentFormData {
  date: Date | undefined
  time: string
  reason: string
  patientName: string
  patientEmail: string
  patientPhone: string
  notes: string
}

// Estructura para errores de validación.
interface FormErrors {
  date?: string
  time?: string
  reason?: string
  patientName?: string
  patientEmail?: string
  patientPhone?: string
  general?: string
}

// Tipos para la nueva estructura de la API
interface DoctorAvailability {
  dayOfWeek: number
  startTime: string // "09:00"
  endTime: string   // "13:00"
  available: boolean
}

interface OccupiedSlot {
  id: number
  appointmentDate: string // ISO string
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ isOpen, onClose, doctor, onSuccess }) => {
  const { t } = useTranslation()

  // Estado del formulario y errores.
  const [formData, setFormData] = useState<AppointmentFormData>({
    date: undefined,
    time: "",
    reason: "",
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    notes: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Controla el paso actual del flujo (fecha/hora, datos, confirmación).
  const [step, setStep] = useState<"datetime" | "confirmation">("datetime")

  // Estado para los horarios disponibles del doctor.
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState("")

  // Nuevo estado para la disponibilidad y slots ocupados
  const [doctorSchedule, setDoctorSchedule] = useState<DoctorAvailability[]>([])
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([])

  // Calcula los horarios disponibles localmente al seleccionar fecha
  useEffect(() => {
    if (!formData.date) {
      setAvailableSlots([])
      return
    }
    setLoadingSlots(true)
    setSlotsError("")

    // Día de la semana seleccionado (0=domingo, 6=sábado)
    const selectedDay = formData.date.getDay()
    // Busca el rango de horario disponible para ese día
    const dayAvailability = doctorSchedule.find(
      (slot) => slot.available && slot.dayOfWeek === selectedDay
    )

    if (!dayAvailability) {
      setAvailableSlots([])
      setLoadingSlots(false)
      setSlotsError(t("doctorProfile.notAvailable"))
      return
    }

    // Construye la lista de horas en punto dentro del rango, considerando duración de 1 hora
    const startHour = parseInt(dayAvailability.startTime.split(":")[0], 10)
    const endHour = parseInt(dayAvailability.endTime.split(":")[0], 10)
    const slots: string[] = []
    for (let hour = startHour; hour < endHour; hour++) {
      const timeStr = hour.toString().padStart(2, "0") + ":00"
      slots.push(timeStr)
    }

    // Filtra los horarios ocupados para la fecha seleccionada
    const selectedDateStr = formData.date.toISOString().split("T")[0]
    const occupiedTimes = occupiedSlots
      .filter((slot) => slot.appointmentDate.startsWith(selectedDateStr))
      .map((slot) => slot.appointmentDate.substring(11, 16)) // "HH:MM"

    // Excluye los horarios ocupados de la lista de horas disponibles
    const availableFiltered = slots.filter((time) => !occupiedTimes.includes(time))

    setAvailableSlots(availableFiltered)
    setLoadingSlots(false)
  }, [formData.date, doctorSchedule, occupiedSlots, t])

  // Consulta la disponibilidad del médico solo una vez al abrir el modal
  useEffect(() => {
    if (!doctor?.id || !isOpen) return
    doctorService.getDoctorAvailability(doctor.id)
      .then((response) => {
        const payload = response?.payload || {}
        setDoctorSchedule(payload.availability || [])
        setOccupiedSlots(payload.occupiedSlots || [])
      })
      .catch(() => {
        setDoctorSchedule([])
        setOccupiedSlots([])
      })
  }, [doctor?.id, isOpen])

  // Validación de campos del formulario.
  // Todos los textos y mensajes usan internacionalización.
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.date) {
      newErrors.date = t("appointment.validation.dateRequired", { defaultValue: "Selecciona una fecha" })
    } else if (isPastDate(formData.date)) {
      newErrors.date = t("appointment.validation.datePast", { defaultValue: "La fecha no puede ser pasada" })
    }

    if (!formData.time) {
      newErrors.time = t("appointment.validation.timeRequired", { defaultValue: "Selecciona una hora" })
    } else if (!/^\d{2}:00$/.test(formData.time)) {
      newErrors.time = t("appointment.validation.timeOnHour", { defaultValue: "La cita debe ser en punto (ej. 10:00, 11:00)" })
    }

    if (!formData.reason.trim()) {
      newErrors.reason = t("appointment.validation.reasonRequired", { defaultValue: "Describe el motivo de la consulta" })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejadores de cambio para los campos del formulario.
  const handleInputChange =
    (field: keyof AppointmentFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }
  
  // Selección de fecha en el calendario.
  const handleDateSelect = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, date }))
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: undefined }))
    }
  }
  
  // Selección de horario disponible.
  const handleTimeSelect = (time: string) => {
    setFormData((prev) => ({ ...prev, time }))
    if (errors.time) {
      setErrors((prev) => ({ ...prev, time: undefined }))
    }
  }
  
  // Avanza al siguiente paso del flujo.
  const handleNextStep = () => {
    if (step === "datetime") {
      if (!formData.date || !formData.time || !formData.reason.trim()) {
        setErrors({
          date: !formData.date ? t("appointment.validation.dateRequired", { defaultValue: "Selecciona una fecha" }) : undefined,
          time: !formData.time ? t("appointment.validation.timeRequired", { defaultValue: "Selecciona una hora" }) : undefined,
          reason: !formData.reason.trim() ? t("appointment.validation.reasonRequired", { defaultValue: "Describe el motivo de la consulta" }) : undefined,
        })
        return
      }
      setStep("confirmation")
    }
  }

  // Envía los datos al backend para agendar la cita.
  // Maneja respuestas y errores según el formato estándar de la API.
  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors({})
    try {
      // Construye el objeto de cita según la documentación del API.
      const appointmentData = {
        doctor_id: doctor.id,
        appointment_date: new Date(
          formData.date?.toISOString().split("T")[0] + "T" + formData.time + ":00.000Z"
        ).toISOString(),
        reason: formData.reason,
      }

      // Llama al servicio de paciente para agendar la cita.
      const response = await patientService.bookAppointment(appointmentData)

      // Si la cita fue agendada exitosamente (código 201).
      if (response?.code === 201) {
        onSuccess?.(response.payload)
        onClose()
        setFormData({
          date: undefined,
          time: "",
          reason: "",
          patientName: "",
          patientEmail: "",
          patientPhone: "",
          notes: "",
        })
        setStep("datetime")
      } else {
        setErrors({
          general: t("appointment.validation.submitError"),
        })
      }
    } catch (error: any) {
      let errorMsg = t("appointment.validation.submitError")
      if (error?.code === 400 && error?.payload?.error?.[0]) {
        errorMsg = error.payload.error[0]
      } else if (error?.code === 403) {
        errorMsg = t("doctorProfile.registerAsPatientMsg")
      } else if (error?.code === 409 && error?.payload?.error?.[0]) {
        errorMsg = error.payload.error[0]
      }
      setErrors({ general: errorMsg })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cierra el modal y reinicia el estado.
  const handleClose = () => {
    onClose()
    setStep("datetime")
    setErrors({})
    setFormData({
      date: undefined,
      time: "",
      reason: "",
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      notes: "",
    })
  }

  // Deshabilitar fin de semana???
  const isWeekend = (date: Date) => {
    const day = date.getDay()
    //return day === 0 || day === 6
    return false //No importa si es fin de semana
  }

  // Utilidad para deshabilitar fechas pasadas y mayores a 3 meses
  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isBeyondThreeMonths = (date: Date) => {
    const today = new Date()
    const maxDate = new Date(today)
    maxDate.setMonth(today.getMonth() + 3)
    maxDate.setHours(23, 59, 59, 999)
    return date > maxDate
  }

  // Renderizado del modal de agendamiento de cita.
  // Incluye accesibilidad, internacionalización y estructura de pasos.
  return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-2xl font-bold">
            {t("appointment.bookTitle")} {doctor.name}
          </DialogTitle>
          <DialogDescription>
            {doctor.specialty}
          </DialogDescription>

        <div className="space-y-6">
          {/* Progress indicator */}
          <nav aria-label={t("appointment.bookTitle")}>
            <ol className="flex items-center justify-center space-x-4">
              <li className={`flex items-center ${step === "datetime" ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "datetime" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  aria-current={step === "datetime" ? "step" : undefined}
                >
                  1
                </div>
                <span className="ml-2 text-sm">{t("appointment.selectDateTime")}</span>
              </li>
              <li className="w-8 h-px bg-gray-300"></li>
              <li className={`flex items-center ${step === "confirmation" ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "confirmation" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  aria-current={step === "confirmation" ? "step" : undefined}
                >
                  2
                </div>
                  <span className="ml-2 text-sm">{t("common.confirmAppointment")}</span>
              </li>
            </ol>
          </nav>

          {/* Step 1: Date and Time Selection */}
          {step === "datetime" && (
            <section aria-labelledby="select-date-time">
              <h3 id="select-date-time" className="text-lg font-semibold mb-4">{t("appointment.selectDateTime")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                  <label htmlFor="appointment-date" className="block text-sm font-medium mb-2">{t("appointment.date")}</label>
                  <Calendar
                    id="appointment-date"
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateSelect}
                    disabled={(date) => isPastDate(date) || isWeekend(date) || isBeyondThreeMonths(date)}
                    className="rounded-md border"
                    aria-label={t("appointment.date")}
                  />
                  {errors.date && <p className="text-red-500 text-sm mt-1" role="alert">{errors.date}</p>}
                </div>

                {/* Time slots dinámicos */}
                <div>
                  <label htmlFor="appointment-time" className="block text-sm font-medium mb-2">{t("appointment.time")}</label>
                  {loadingSlots ? (
                    <span className="text-gray-500">{t("common.loading")}</span>
                  ) : slotsError ? (
                    <span className="text-red-500">{slotsError}</span>
                  ) : availableSlots.length === 0 ? (
                    <span className="text-gray-500">{t("doctorProfile.notAvailable")}</span>
                  ) : (
                    <div id="appointment-time" role="radiogroup" aria-label={t("appointment.time")}>
                      {availableSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleTimeSelect(time)}
                          className={`p-2 text-sm rounded-md border transition-colors ${formData.time === time
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                          aria-checked={formData.time === time}
                          aria-label={time}
                          role="radio"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.time && <p className="text-red-500 text-sm mt-1" role="alert">{errors.time}</p>}
                </div>
              </div>

              {/* Motivo de la consulta: ancho completo, margen superior */}
              <div className="mt-6">
                <label htmlFor="appointment-reason" className="block text-sm font-medium mb-2">{t("appointment.reason")}</label>
                <textarea
                  id="appointment-reason"
                  value={formData.reason}
                  onChange={handleInputChange("reason")}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm resize-none focus:ring-blue-600 focus:border-blue-600"
                  rows={3}
                  placeholder={t("appointment.validation.reasonRequired")}
                  aria-required="true"
                  aria-invalid={!!errors.reason}
                />
                {errors.reason && <p className="text-red-500 text-sm mt-1" role="alert">{errors.reason}</p>}
              </div>
            </section>
          )}

          {/* Step 2: Confirmation */}
          {step === "confirmation" && (
            <section aria-labelledby="confirm-appointment">
              <h3 id="confirm-appointment" className="text-lg font-semibold">{t("common.confirmationAppointment")}</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">{t("doctor.profileTitle")}:</span>
                  <span>{doctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t("doctor.specialty")}:</span>
                  <span>{doctor.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t("appointment.date")}:</span>
                  <span>
                    {formData.date?.toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t("appointment.time")}:</span>
                  <span>{formData.time}</span>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-blue-900 mb-2">{t("appointment.reason")}:</h4>
                <p className="text-blue-800">{formData.reason}</p>
              </div>
              {errors.general && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg mt-4" role="alert">
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              )}
            </section>
          )}

          {/* Action buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-3">
              {step === "confirmation" && (
                <Button
                  variant="outline"
                  onClick={() => setStep("datetime")}
                  disabled={isSubmitting}
                  aria-label={t("common.back")}
                  className="bg-white border border-blue-700 text-blue-700 hover:bg-blue-500 hover:text-white"
                >
                  {t("common.back")}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label={t("common.cancel")}
                className="bg-white border border-blue-700 text-blue-700 hover:bg-blue-500 hover:text-white"
              >
                {t("common.cancel")}
              </Button>
            </div>
            <div>
              {step === "confirmation" ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  aria-label={t("appointment.bookTitle")}
                >
                  {isSubmitting ? t("common.loading") : t("appointment.bookTitle")}
                </Button>
              ) : (
                <Button
                  onClick={handleNextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  aria-label={t("common.next")}
                >
                  {t("common.next")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AppointmentBooking