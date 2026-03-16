import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { operatingRoomService } from '@/services/operating-room.service';
import type { Surgery } from '@/services/planning.service';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const getWeekRange = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
};

/** Fecha de referencia para agrupar una cirugía por día: startTime, o scheduledDate si no hay ventana horaria */
const getSurgeryDayKey = (s: Surgery): string | null => {
  if (s.startTime) return format(parseISO(s.startTime), 'yyyy-MM-dd');
  if (s.scheduledDate) return format(parseISO(s.scheduledDate), 'yyyy-MM-dd');
  return null;
};

const getSurgerySortTime = (s: Surgery): number => {
  if (s.startTime) return new Date(s.startTime).getTime();
  if (s.scheduledDate) return new Date(s.scheduledDate).getTime();
  return 0;
};

const groupSurgeriesByDay = (surgeries: Surgery[]) => {
  const byDay: Record<string, Surgery[]> = {};
  for (const s of surgeries) {
    const key = getSurgeryDayKey(s);
    if (!key) continue;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(s);
  }
  for (const arr of Object.values(byDay)) {
    arr.sort((a, b) => getSurgerySortTime(a) - getSurgerySortTime(b));
  }
  return byDay;
};

const formatTime = (iso: string) =>
  format(parseISO(iso), 'HH:mm', { locale: es });
const formatRange = (start: string, end: string) =>
  `${formatTime(start)} – ${formatTime(end)}`;

/** Texto de horario para una cirugía: ventana start–end o hora de scheduled_date o "Programada" */
const getSurgeryTimeLabel = (s: Surgery): string => {
  if (s.startTime && s.endTime) return formatRange(s.startTime, s.endTime);
  if (s.scheduledDate) {
    const d = parseISO(s.scheduledDate);
    return format(d, 'HH:mm', { locale: es }) || 'Programada';
  }
  return 'Programada';
};

const OperatingRoomCalendarPage = () => {
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const { start: weekStart, end: weekEnd } = useMemo(
    () => getWeekRange(weekAnchor),
    [weekAnchor],
  );
  const weekStartISO = weekStart.toISOString();
  const weekEndISO = weekEnd.toISOString();

  const { data: rooms, isLoading: loadingRooms } = useQuery({
    queryKey: ['operating-rooms', true],
    queryFn: () => operatingRoomService.getOperatingRooms(true),
  });

  const { data: surgeries = [], isLoading: loadingAvailability } = useQuery({
    queryKey: ['operating-rooms-availability', selectedRoomId, weekStartISO, weekEndISO],
    queryFn: () =>
      selectedRoomId
        ? operatingRoomService.getRoomAvailability(
            selectedRoomId,
            weekStartISO,
            weekEndISO,
          )
        : Promise.resolve([]),
    enabled: !!selectedRoomId,
  });

  const daysOfWeek = useMemo(() => {
    const days: Date[] = [];
    const d = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [weekStart]);

  const byDay = useMemo(() => groupSurgeriesByDay(surgeries), [surgeries]);
  const selectedRoom = rooms?.find((r) => r.id === selectedRoomId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-medical-gray-900">
            Calendario de quirófanos
          </h1>
          <p className="text-medical-gray-600 mt-2">
            Ocupación y disponibilidad por sala
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/planning/surgeries"
            className="btn btn-outline"
          >
            Cirugías
          </Link>
          <Link
            to="/planning/operating-rooms"
            className="btn btn-outline flex items-center gap-2"
          >
            <BuildingOfficeIcon className="w-5 h-5" />
            Quirófanos
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-medical-gray-700">
              Quirófano
            </label>
            <select
              value={selectedRoomId ?? ''}
              onChange={(e) =>
                setSelectedRoomId(e.target.value || null)
              }
              className="input w-auto min-w-[200px]"
            >
              <option value="">Seleccionar quirófano</option>
              {rooms?.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                  {room.code ? ` (${room.code})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekAnchor((d) => subWeeks(d, 1))}
              className="btn btn-outline p-2"
              aria-label="Semana anterior"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-medical-gray-700 font-medium min-w-[220px] text-center">
              {format(weekStart, "d 'de' MMM", { locale: es })} –{' '}
              {format(weekEnd, "d 'de' MMM yyyy", { locale: es })}
            </span>
            <button
              type="button"
              onClick={() => setWeekAnchor((d) => addWeeks(d, 1))}
              className="btn btn-outline p-2"
              aria-label="Semana siguiente"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setWeekAnchor(new Date())}
            className="btn btn-outline text-sm"
          >
            Hoy
          </button>
        </div>

        {loadingRooms ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4" />
            <p className="text-medical-gray-500">Cargando quirófanos...</p>
          </div>
        ) : !selectedRoomId ? (
          <div className="text-center py-12 text-medical-gray-500">
            <CalendarDaysIcon className="w-16 h-16 mx-auto mb-4 text-medical-gray-300" />
            <p>Seleccione un quirófano para ver la ocupación de la semana.</p>
          </div>
        ) : loadingAvailability ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4" />
            <p className="text-medical-gray-500">Cargando ocupación...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-w-[600px]">
              {daysOfWeek.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const daySurgeries = byDay[key] ?? [];
                const isToday =
                  format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                return (
                  <div
                    key={key}
                    className={`rounded-lg border p-3 ${
                      isToday
                        ? 'border-medical-primary bg-medical-primary/5'
                        : 'border-medical-gray-200 bg-medical-gray-50/50'
                    }`}
                  >
                    <div className="text-sm font-semibold text-medical-gray-900 mb-2">
                      {format(day, 'EEE d', { locale: es })}
                    </div>
                    <div className="space-y-2">
                      {daySurgeries.length === 0 ? (
                        <p className="text-xs text-medical-gray-400 italic">
                          Sin cirugías
                        </p>
                      ) : (
                        daySurgeries.map((s) => (
                          <Link
                            key={s.id}
                            to={`/planning/surgeries/${s.id}`}
                            className="block rounded-lg border border-medical-gray-200 bg-white p-2 hover:border-medical-primary hover:shadow transition-all text-left"
                          >
                            <div className="flex items-center gap-1 text-xs text-medical-gray-500 mb-0.5">
                              <ClockIcon className="w-3.5 h-3.5" />
                              {getSurgeryTimeLabel(s)}
                            </div>
                            <p className="text-sm font-medium text-medical-gray-900 truncate">
                              {s.procedure}
                            </p>
                            {s.patient && (
                              <p className="text-xs text-medical-gray-600 flex items-center gap-1 truncate">
                                <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                {s.patient.firstName} {s.patient.lastName}
                              </p>
                            )}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedRoom && surgeries.length === 0 && !loadingAvailability && (
          <p className="text-center text-medical-gray-500 mt-4">
            No hay cirugías programadas con horario en esta semana para{' '}
            <strong>{selectedRoom.name}</strong>.
          </p>
        )}
      </div>
    </div>
  );
};

export default OperatingRoomCalendarPage;
