/** Índice del día en la semana mostrada: 0 = lunes … 6 = domingo. Si no es la semana actual, -1. */
export function getCurrentDayIndexForWeek(weekOffset: number, now: Date = new Date()): number {
  if (weekOffset !== 0) return -1
  const currentDay = now.getDay()
  return currentDay === 0 ? 6 : currentDay - 1
}

export interface WeekDayLabel {
  day: string
  date: number
}

export interface WeekData {
  dates: WeekDayLabel[]
  range: string
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export function buildWeekData(weekOffset: number, now: Date = new Date()): WeekData {
  const currentDay = now.getDay()
  const diff = currentDay === 0 ? -6 : 1 - currentDay

  const monday = new Date(now)
  monday.setDate(now.getDate() + diff + weekOffset * 7)

  const dates: WeekDayLabel[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    dates.push({
      day: DAY_LABELS[i],
      date: date.getDate(),
    })
  }

  const startDate = dates[0].date
  const endDate = dates[6].date
  const monthName = MONTH_NAMES[monday.getMonth()]

  return {
    dates,
    range: `${startDate} – ${endDate} De ${monthName}`,
  }
}
