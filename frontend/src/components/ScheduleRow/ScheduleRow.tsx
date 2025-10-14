"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/Button"

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
)

interface ScheduleRowProps {
  id?: string
  initialDay?: string
  initialStartTime?: string
  initialEndTime?: string
  onSave: (data: { day: string; startTime: string; endTime: string }) => void
  onDelete: (id?: string) => void
  isNew?: boolean
  usedDays?: number[]
  isProcessing?: boolean // Nueva prop para estado de procesamiento global
}

const ScheduleRow: React.FC<ScheduleRowProps> = ({
  id,
  initialDay = "",
  initialStartTime = "",
  initialEndTime = "",
  onSave,
  onDelete,
  isNew = false,
  usedDays = [],
  isProcessing = false // Valor por defecto
}) => {
  const { t } = useTranslation()
  const [day, setDay] = useState(initialDay)
  const [startTime, setStartTime] = useState(initialStartTime)
  const [endTime, setEndTime] = useState(initialEndTime)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [validationError, setValidationError] = useState("")

  // Generate time options (every 60 minutes from 6:00 AM to 10:00 PM)
  const generateTimeOptions = () => {
    const times = []
    for (let hour = 6; hour <= 22; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`
      // Mostrar el valor tal como viene de la API (ejemplo: "09:00", "13:00")
      times.push({ value: timeString, label: timeString })
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  // Validation: end time must be after start time
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`)
      const end = new Date(`2000-01-01T${endTime}`)

      if (end <= start) {
        setValidationError(t("scheduleEdit.validation.closingTimeAfterOpening"))
      } else {
        setValidationError("")
      }
    } else {
      setValidationError("")
    }
  }, [startTime, endTime, t])

  const handleSave = async () => {
    if (!day || !startTime || !endTime) {
      setValidationError(t("scheduleEdit.validation.dayRequired"))
      return
    }
    if (validationError) {
      return
    }
    setIsSaving(true)
    try {
      await onSave({ day, startTime, endTime })
    } catch (error) {
      console.error("Error saving schedule:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(id)
    } catch (error) {
      console.error("Error deleting schedule:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const isFormValid = day && startTime && endTime && !validationError

  const dayOfWeekOptions = [
    { value: 1, label: t("scheduleEdit.days.monday") },
    { value: 2, label: t("scheduleEdit.days.tuesday") },
    { value: 3, label: t("scheduleEdit.days.wednesday") },
    { value: 4, label: t("scheduleEdit.days.thursday") },
    { value: 5, label: t("scheduleEdit.days.friday") },
    { value: 6, label: t("scheduleEdit.days.saturday") },
    { value: 0, label: t("scheduleEdit.days.sunday") },
  ]

  // Filtra días ya usados, excepto el actual
  const availableDayOptions = dayOfWeekOptions.filter(
    option => !usedDays.includes(option.value) || option.value === Number(day)
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg bg-white">
      {/* Day Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 md:hidden">{t("scheduleEdit.table.dayOfWeek")}</label>
        <Select value={day.toString()} onValueChange={(v) => setDay(Number(v))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("scheduleEdit.placeholders.selectDay")} />
          </SelectTrigger>
          <SelectContent>
            {availableDayOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Start Time Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 md:hidden">{t("scheduleEdit.table.openingTime")}</label>
        <Select value={startTime} onValueChange={setStartTime}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("scheduleEdit.placeholders.selectOpeningTime")} />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((time) => (
              <SelectItem key={time.value} value={time.value}>
                {time.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* End Time Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 md:hidden">{t("scheduleEdit.table.closingTime")}</label>
        <Select value={endTime} onValueChange={setEndTime}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("scheduleEdit.placeholders.selectClosingTime")} />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((time) => (
              <SelectItem key={time.value} value={time.value}>
                {time.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={!isFormValid || isSaving || isDeleting || isProcessing} // Deshabilitar también durante el procesamiento global
          isLoading={isSaving || isProcessing} // Mostrar carga durante procesamiento local o global
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 flex justify-between items-center"
        >
          <span>{isSaving || isProcessing ? t("scheduleEdit.buttons.saving") : t("scheduleEdit.buttons.save")}</span>
          <SaveIcon />
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleDelete}
          disabled={isSaving || isDeleting || isProcessing} // Deshabilitar también durante el procesamiento global
          isLoading={isDeleting || isProcessing} // Mostrar carga durante procesamiento local o global
          className="bg-red-600 hover:bg-red-700 text-white flex-1 flex justify-between items-center"
        >
          <span>{isDeleting || isProcessing ? t("scheduleEdit.buttons.deleting") : t("scheduleEdit.buttons.delete")}</span>
          <TrashIcon />
        </Button>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="md:col-span-4 text-red-600 text-sm bg-red-50 p-2 rounded">{validationError}</div>
      )}
    </div>
  )
}

export default ScheduleRow
