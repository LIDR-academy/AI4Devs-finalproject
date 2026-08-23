import { GYM_TIMEZONE, toGymIsoDateTime } from "@/domain/utils/gymDateTime";
import { sortClassesByGymTime } from "@/domain/utils/todaySchedule";
import { useListClasses } from "@/infrastructure/hooks/useListClasses";
import { CoacheeClassCard } from "@/ui/components/CoacheeClassCard";

function todayGymDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: GYM_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts;
}

function addDaysGym(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const WINDOW_DAYS = 30;

export function CoacheeClassList() {
  const start = toGymIsoDateTime(todayGymDate(), "00:00");
  const end = toGymIsoDateTime(addDaysGym(todayGymDate(), WINDOW_DAYS), "23:59");

  const classesQuery = useListClasses({ start, end, page: 1, limit: 50 });
  const classes = sortClassesByGymTime(classesQuery.data?.data ?? []);

  if (classesQuery.isLoading) {
    return <p className="text-sm text-gray-500">Loading classes...</p>;
  }

  if (classesQuery.isError) {
    return <p className="text-sm text-red-600">Could not load classes.</p>;
  }

  if (classes.length === 0) {
    return <p className="text-sm text-gray-500">No available classes in the next month.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {classes.map((trainingClass) => (
        <CoacheeClassCard key={trainingClass.id} trainingClass={trainingClass} />
      ))}
    </div>
  );
}
