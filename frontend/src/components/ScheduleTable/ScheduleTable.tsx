"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import ScheduleRow from "../ScheduleRow/ScheduleRow"
import Button from "../ui/Button"

// Tipos para los horarios
export interface ScheduleData {
  id: string
  dayOfWeek: string
  openingTime: string
  closingTime: string
}

interface ScheduleTableProps {
  schedules: ScheduleData[]
  onSaveSchedule: (scheduleId: string, updatedData: Partial<ScheduleData>) => Promise<void>
  onDeleteSchedule: (scheduleId: string) => Promise<void>
  onAddNewSchedule: () => void
  isProcessing: boolean // Nueva prop para indicar procesamiento
  className?: string
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
    schedules,
    onSaveSchedule,
    onDeleteSchedule,
    onAddNewSchedule,
    isProcessing, // Recibir prop de procesamiento
    className = "",
  }) => {
  const { t } = useTranslation()
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Obtén los días ya usados para filtrar en cada fila
  const usedDays = schedules.map(s => s.dayOfWeek)

  // Función para agregar nuevo horario
  const handleAddNewSchedule = () => {
    const newSchedule: ScheduleData = {
      id: Date.now().toString(),
      dayOfWeek: "monday",
      openingTime: "09:00",
      closingTime: "18:00",
    }
    setSchedules((prev) => [...prev, newSchedule])
    setIsAddingNew(false)
  }

  // Función para guardar horario
  const handleSaveSchedule = async (scheduleId: string, updatedData: Partial<ScheduleData>) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setSchedules((prev) =>
          prev.map((schedule) => (schedule.id === scheduleId ? { ...schedule, ...updatedData } : schedule)),
        )
        resolve()
      }, 1000)
    })
  }

  // Función para eliminar horario
  const handleDeleteSchedule = async (scheduleId: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setSchedules((prev) => prev.filter((schedule) => schedule.id !== scheduleId))
        resolve()
      }, 500)
    })
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">{t("scheduleEdit.table.title")}</h3>
        <p className="text-sm text-gray-600 mt-1">{t("scheduleEdit.table.subtitle")}</p>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {/* Desktop Table Headers */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
          <div className="col-span-3">{t("scheduleEdit.table.dayOfWeek")}</div>
          <div className="col-span-3">{t("scheduleEdit.table.openingTime")}</div>
          <div className="col-span-3">{t("scheduleEdit.table.closingTime")}</div>
          <div className="col-span-3">{t("scheduleEdit.table.actions")}</div>
        </div>


        {/* Schedule Rows */}
        <div className="divide-y divide-gray-200">
          {schedules.length === 0 ? (
            // Empty state
            <div className="px-6 py-12 text-center">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 className="text-lg font-medium text-gray-900 mb-2">{t("scheduleEdit.messages.noSchedulesFound")}</h4>
              <p className="text-gray-600 mb-4">{t("scheduleEdit.messages.loadingSchedules")}</p>
            </div>
          ) : (
            schedules.map((schedule) => (
              <ScheduleRow
                key={schedule.id}
                id={schedule.id}
                initialDay={schedule.dayOfWeek}
                initialStartTime={schedule.openingTime}
                initialEndTime={schedule.closingTime}
                onSave={(updated) => onSaveSchedule(schedule.id, updated)}
                onDelete={() => onDeleteSchedule(schedule.id)}
                usedDays={usedDays.filter(d => d !== schedule.dayOfWeek)}
                isProcessing={isProcessing} // Pasar el estado de procesamiento
              />
            ))
          )}
        </div>
      </div>

      {/* Add New Schedule Button */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <Button
          onClick={onAddNewSchedule}
          disabled={isProcessing || isAddingNew} // Deshabilitar durante procesamiento
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-federal-blue hover:bg-honolulu-blue text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t("scheduleEdit.buttons.addNewSchedule")}
        </Button>
      </div>
    </div>
  )
}

export default ScheduleTable
