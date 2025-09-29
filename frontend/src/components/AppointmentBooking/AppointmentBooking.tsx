"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog"
import { Calendar } from "../../../components/ui/calendar"
import { Button } from "../ui/Button"
import Input from "../ui/Input"
import { patientService } from "../../services/patientService"

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

interface AppointmentFormData {
  date: Date | undefined
  time: string
  reason: string
  patientName: string
  patientEmail: string
  patientPhone: string
  notes: string
}

interface FormErrors {
  date?: string
  time?: string
  reason?: string
  patientName?: string
  patientEmail?: string
  patientPhone?: string
  general?: string
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ isOpen, onClose, doctor, onSuccess }) => {
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
  const [step, setStep] = useState<"datetime" | "details" | "confirmation">("datetime")

  // Available time slots
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.date) newErrors.date = "Selecciona una fecha"
    if (!formData.time) newErrors.time = "Selecciona una hora"
    if (!formData.reason.trim()) newErrors.reason = "Describe el motivo de la consulta"
    if (!formData.patientName.trim()) newErrors.patientName = "Ingresa tu nombre completo"
    if (!formData.patientEmail.trim()) {
      newErrors.patientEmail = "Ingresa tu correo electrónico"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientEmail)) {
      newErrors.patientEmail = "Ingresa un correo válido"
    }
    if (!formData.patientPhone.trim()) {
      newErrors.patientPhone = "Ingresa tu teléfono"
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.patientPhone)) {
      newErrors.patientPhone = "Ingresa un teléfono válido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange =
    (field: keyof AppointmentFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }

  const handleDateSelect = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, date }))
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: undefined }))
    }
  }

  const handleTimeSelect = (time: string) => {
    setFormData((prev) => ({ ...prev, time }))
    if (errors.time) {
      setErrors((prev) => ({ ...prev, time: undefined }))
    }
  }

  const handleNextStep = () => {
    if (step === "datetime") {
      if (!formData.date || !formData.time) {
        setErrors({
          date: !formData.date ? "Selecciona una fecha" : undefined,
          time: !formData.time ? "Selecciona una hora" : undefined,
        })
        return
      }
      setStep("details")
    } else if (step === "details") {
      if (validateForm()) {
        setStep("confirmation")
      }
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const appointmentData = {
        doctorId: doctor.id,
        date: formData.date?.toISOString().split("T")[0],
        time: formData.time,
        reason: formData.reason,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        notes: formData.notes,
        status: "pending",
      }

      // Call the booking service
      await patientService.bookAppointment(appointmentData)

      onSuccess?.(appointmentData)
      onClose()

      // Reset form
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
    } catch (error) {
      console.error("Error booking appointment:", error)
      setErrors({ general: "Error al agendar la cita. Intenta nuevamente." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setStep("datetime")
    setErrors({})
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Agendar Cita con {doctor.name}</DialogTitle>
          <DialogDescription>
            {doctor.specialty} • ${doctor.price} por consulta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step === "datetime" ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "datetime" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <span className="ml-2 text-sm">Fecha y Hora</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center ${step === "details" ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "details" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <span className="ml-2 text-sm">Detalles</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center ${step === "confirmation" ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "confirmation" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                3
              </div>
              <span className="ml-2 text-sm">Confirmar</span>
            </div>
          </div>

          {/* Step 1: Date and Time Selection */}
          {step === "datetime" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Selecciona fecha y hora</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha</label>
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={handleDateSelect}
                      disabled={(date) => isPastDate(date) || isWeekend(date)}
                      className="rounded-md border"
                    />
                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                  </div>

                  {/* Time slots */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Hora disponible</label>
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleTimeSelect(time)}
                          className={`p-2 text-sm rounded-md border transition-colors ${
                            formData.time === time
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Patient Details */}
          {step === "details" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información del paciente</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre completo *</label>
                  <Input
                    value={formData.patientName}
                    onChange={handleInputChange("patientName")}
                    placeholder="Tu nombre completo"
                    error={errors.patientName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Correo electrónico *</label>
                  <Input
                    type="email"
                    value={formData.patientEmail}
                    onChange={handleInputChange("patientEmail")}
                    placeholder="tu@email.com"
                    error={errors.patientEmail}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teléfono *</label>
                <Input
                  value={formData.patientPhone}
                  onChange={handleInputChange("patientPhone")}
                  placeholder="+52 55 1234 5678"
                  error={errors.patientPhone}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Motivo de la consulta *</label>
                <textarea
                  value={formData.reason}
                  onChange={handleInputChange("reason")}
                  placeholder="Describe brevemente el motivo de tu consulta"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notas adicionales (opcional)</label>
                <textarea
                  value={formData.notes}
                  onChange={handleInputChange("notes")}
                  placeholder="Información adicional que consideres importante"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === "confirmation" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Confirmar cita</h3>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Doctor:</span>
                  <span>{doctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Especialidad:</span>
                  <span>{doctor.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Fecha:</span>
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
                  <span className="font-medium">Hora:</span>
                  <span>{formData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Paciente:</span>
                  <span>{formData.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Costo:</span>
                  <span className="text-lg font-bold">${doctor.price}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Motivo de la consulta:</h4>
                <p className="text-blue-800">{formData.reason}</p>
                {formData.notes && (
                  <>
                    <h4 className="font-medium text-blue-900 mt-3 mb-2">Notas adicionales:</h4>
                    <p className="text-blue-800">{formData.notes}</p>
                  </>
                )}
              </div>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div>
              {step !== "datetime" && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step === "confirmation" ? "details" : "datetime")}
                  disabled={isSubmitting}
                >
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>

              {step === "confirmation" ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Agendando..." : "Confirmar Cita"}
                </Button>
              ) : (
                <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Siguiente
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
