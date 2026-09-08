import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCoach } from "@/infrastructure/hooks/useCoach";
import { useCoachFinancialData } from "@/infrastructure/hooks/useCoachFinancialData";
import { useUpdateCoach } from "@/infrastructure/hooks/useUpdateCoach";
import { useUpdateCoachStatus } from "@/infrastructure/hooks/useUpdateCoachStatus";

function FinancialDataSection({ coachId }: { coachId: string }) {
  const [visible, setVisible] = useState(false);
  const { data, isLoading } = useCoachFinancialData(coachId);

  return (
    <div className="bg-white rounded-xl border p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Financial Data</h3>
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            visible
              ? "text-gray-600 border border-gray-200 hover:bg-gray-50"
              : "text-white bg-amber-600 hover:bg-amber-700"
          }`}
        >
          {visible ? "Hide" : "View Financial Data"}
        </button>
      </div>

      {!visible && (
        <p className="text-sm text-gray-400 italic">
          Click the button above to view sensitive financial information. Access is audited.
        </p>
      )}

      {visible && isLoading && <p className="text-sm text-gray-400">Loading...</p>}

      {visible && data && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Bank Account
            </p>
            <p className="text-sm font-mono text-gray-900">{data.bankAccount}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">SSN</p>
            <p className="text-sm font-mono text-gray-900">{data.ssn}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">DNI</p>
            <p className="text-sm font-mono text-gray-900">{data.dni}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminCoachDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const coachId = id ?? "";
  const { data: coach, isLoading } = useCoach(coachId);
  const updateMutation = useUpdateCoach(coachId);
  const statusMutation = useUpdateCoachStatus();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSpecialities, setEditSpecialities] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Coach not found</p>
        <button
          type="button"
          onClick={() => navigate("/admin/coaches")}
          className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Back to Coaches
        </button>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    await updateMutation.mutateAsync({
      name: editName,
      email: editEmail,
      phone: editPhone,
      specialities: editSpecialities,
    });
    setEditing(false);
  };

  const handleToggleStatus = () => {
    statusMutation.mutate({
      id: coach.id,
      status: coach.status === "active" ? "inactive" : "active",
    });
  };

  const startEditing = () => {
    setEditName(coach.name);
    setEditEmail(coach.email);
    setEditPhone(coach.phone || "");
    setEditSpecialities(coach.specialities || "");
    setEditing(true);
  };

  return (
    <div className="max-w-2xl">
      <button
        type="button"
        onClick={() => navigate("/admin/coaches")}
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
        Back to Coaches
      </button>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{coach.name}</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={statusMutation.isPending}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                coach.status === "active"
                  ? "text-red-600 border border-red-200 hover:bg-red-50"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {statusMutation.isPending
                ? "..."
                : coach.status === "active"
                  ? "Deactivate"
                  : "Activate"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {editing ? (
            <div className="col-span-2 space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone
                </label>
                <input
                  id="edit-phone"
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-specialities"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Specialities
                </label>
                <input
                  id="edit-specialities"
                  type="text"
                  value={editSpecialities}
                  onChange={(e) => setEditSpecialities(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Email
                </p>
                <p className="text-sm text-gray-900">{coach.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Phone
                </p>
                <p className="text-sm text-gray-900">{coach.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Specialities
                </p>
                <p className="text-sm text-gray-900">{coach.specialities || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Status
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    coach.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {coach.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Created
                </p>
                <p className="text-sm text-gray-900">
                  {new Date(coach.createdAt).toLocaleDateString()}
                </p>
              </div>
            </>
          )}
        </div>

        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            Edit Profile
          </button>
        )}
      </div>

      <FinancialDataSection coachId={coachId} />
    </div>
  );
}
