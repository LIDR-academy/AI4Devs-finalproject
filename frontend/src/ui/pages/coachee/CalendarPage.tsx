import { currentGymWeekBounds } from "@/domain/utils/classCalendarEvents";
import { CoacheeCalendarView } from "@/ui/components/coachee/CoacheeCalendarView";

export function CoacheeCalendarPage() {
  const week = currentGymWeekBounds();
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
      <p className="mt-2 text-gray-500">Your class schedule for the week.</p>
      <div className="mt-4">
        <CoacheeCalendarView week={week} />
      </div>
    </div>
  );
}
