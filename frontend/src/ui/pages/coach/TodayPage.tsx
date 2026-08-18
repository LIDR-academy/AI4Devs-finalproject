import { TodayScheduleList } from "@/ui/components/TodayScheduleList";

export function CoachTodayPage() {
  return (
    <div>
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold text-gray-900">Today&apos;s Schedule</h2>
        <p className="mt-2 text-gray-500">Your classes and sessions for today will appear here.</p>
      </div>
      <TodayScheduleList />
    </div>
  );
}
