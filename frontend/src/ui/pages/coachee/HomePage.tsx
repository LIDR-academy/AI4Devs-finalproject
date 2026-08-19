import { useLevels } from "@/infrastructure/hooks/useLevels";
import { useMe } from "@/infrastructure/hooks/useMe";
import { CoacheeClassList } from "@/ui/components/CoacheeClassList";

export function CoacheeHomePage() {
  const { data: me } = useMe();
  const levelsQuery = useLevels();

  const levelName = me?.level
    ? (levelsQuery.data?.find((l) => l.id === me.level?.id)?.name ?? "Unknown")
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Home</h2>
        <p className="mt-1 text-gray-500">
          Your next class and available sessions will appear here.
        </p>
      </div>

      {levelName && (
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Your Level:</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {levelName}
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Next Class</h3>
        <p className="text-sm text-gray-500">You have no upcoming classes scheduled.</p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Joinable Classes</h3>
        <CoacheeClassList />
      </div>
    </div>
  );
}
