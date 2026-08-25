import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCoachee } from "@/infrastructure/hooks/useCoachee";
import { useLevels } from "@/infrastructure/hooks/useLevels";
import { useUpdateCoacheeLevel } from "@/infrastructure/hooks/useUpdateCoacheeLevel";

export function CoachCoacheeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const coacheeId = id ?? "";
  const { data: coachee, isLoading } = useCoachee(coacheeId);
  const levelsQuery = useLevels();
  const levelMutation = useUpdateCoacheeLevel();

  const [selectedLevelId, setSelectedLevelId] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!coachee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Coachee not found</p>
        <button
          type="button"
          onClick={() => navigate("/coach/coachees")}
          className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Back to Coachees
        </button>
      </div>
    );
  }

  const levelName = coachee.level
    ? levelsQuery.data?.find((l) => l.id === coachee.level?.id)?.name || "Unknown"
    : "None";

  const handleLevelChange = async () => {
    if (!selectedLevelId || selectedLevelId === coachee.level?.id) return;
    await levelMutation.mutateAsync({ id: coachee.id, levelId: selectedLevelId });
    setSelectedLevelId("");
  };

  return (
    <div className="max-w-2xl">
      <button
        type="button"
        onClick={() => navigate("/coach/coachees")}
        className="mb-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Coachees
      </button>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Coachee Profile</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Name</p>
            <p className="text-sm text-gray-900">{coachee.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm text-gray-900">{coachee.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Phone</p>
            <p className="text-sm text-gray-900">{coachee.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Status
            </p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                coachee.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {coachee.status === "ACTIVE" ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Class Preference
            </p>
            <p className="text-sm text-gray-900">{coachee.classTypePreference || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Created
            </p>
            <p className="text-sm text-gray-900">
              {new Date(coachee.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Level</h3>
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-700">
            Current level: <span className="font-medium">{levelName}</span>
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={selectedLevelId}
              onChange={(e) => setSelectedLevelId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select level</option>
              {levelsQuery.data?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleLevelChange}
              disabled={!selectedLevelId || levelMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {levelMutation.isPending ? "Updating..." : "Change Level"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
