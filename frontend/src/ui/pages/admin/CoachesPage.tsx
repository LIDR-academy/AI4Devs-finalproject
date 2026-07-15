import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CoachFormData } from "@/domain/types/coach";
import { useCreateCoach } from "@/infrastructure/hooks/useCreateCoach";
import { useFindCoaches } from "@/infrastructure/hooks/useFindCoaches";
import { useUpdateCoachStatus } from "@/infrastructure/hooks/useUpdateCoachStatus";

function AddCoachModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const createMutation = useCreateCoach();

  const [form, setForm] = useState<CoachFormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialities: "",
    bankAccount: "",
    ssn: "",
    dni: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CoachFormData, string>>>({});
  const [apiError, setApiError] = useState("");

  const validate = useCallback(() => {
    const errs: Partial<Record<keyof CoachFormData, string>> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (!form.password.trim()) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (!form.bankAccount.trim()) errs.bankAccount = "Bank account is required";
    if (!form.ssn.trim()) errs.ssn = "SSN is required";
    if (!form.dni.trim()) errs.dni = "DNI is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    try {
      await createMutation.mutateAsync(form);
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        specialities: "",
        bankAccount: "",
        ssn: "",
        dni: "",
      });
      onSuccess();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setApiError(axiosErr.response?.data?.error?.message || "Failed to create coach");
      } else {
        setApiError("Failed to create coach");
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="fixed inset-0 bg-black/50 cursor-default"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Coach</h3>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="add-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              id="add-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="add-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              id="add-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="add-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              id="add-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="add-phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              id="add-phone"
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="add-specialities"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Specialities
            </label>
            <input
              id="add-specialities"
              type="text"
              value={form.specialities}
              onChange={(e) => setForm({ ...form, specialities: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <hr className="border-gray-200" />
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Financial Data
          </p>

          <div>
            <label htmlFor="add-bank" className="block text-sm font-medium text-gray-700 mb-1">
              Bank Account *
            </label>
            <input
              id="add-bank"
              type="text"
              value={form.bankAccount}
              onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.bankAccount ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.bankAccount && (
              <p className="mt-1 text-xs text-red-600">{errors.bankAccount}</p>
            )}
          </div>

          <div>
            <label htmlFor="add-ssn" className="block text-sm font-medium text-gray-700 mb-1">
              SSN *
            </label>
            <input
              id="add-ssn"
              type="text"
              value={form.ssn}
              onChange={(e) => setForm({ ...form, ssn: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ssn ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.ssn && <p className="mt-1 text-xs text-red-600">{errors.ssn}</p>}
          </div>

          <div>
            <label htmlFor="add-dni" className="block text-sm font-medium text-gray-700 mb-1">
              DNI *
            </label>
            <input
              id="add-dni"
              type="text"
              value={form.dni}
              onChange={(e) => setForm({ ...form, dni: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dni ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.dni && <p className="mt-1 text-xs text-red-600">{errors.dni}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {createMutation.isPending ? "Creating..." : "Create Coach"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActionMenu({
  coachId,
  currentStatus,
  onViewDetail,
}: {
  coachId: string;
  currentStatus: string;
  onViewDetail: () => void;
}) {
  const [open, setOpen] = useState(false);
  const statusMutation = useUpdateCoachStatus();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1 text-gray-400 hover:text-gray-600 rounded"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-label="Actions"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01"
          />
        </svg>
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            aria-label="Close"
          />
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border z-20 py-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onViewDetail();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              View Detail
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                statusMutation.mutate({
                  id: coachId,
                  status: currentStatus === "active" ? "inactive" : "active",
                });
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {currentStatus === "active" ? "Deactivate" : "Activate"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function AdminCoachesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data: coachesData, isLoading } = useFindCoaches(statusFilter || undefined, page);

  const totalPages = coachesData?.meta?.totalPages ?? 0;
  const total = coachesData?.meta?.total ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coaches</h2>
          <p className="text-sm text-gray-500 mt-1">{total} total coaches</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add Coach
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-visible">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialities
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-10" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : coachesData?.data?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                  No coaches found
                </td>
              </tr>
            ) : (
              coachesData?.data?.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/admin/coaches/${c.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(`/admin/coaches/${c.id}`);
                  }}
                  tabIndex={0}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.specialities || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ActionMenu
                      coachId={c.id}
                      currentStatus={c.status}
                      onViewDetail={() => navigate(`/admin/coaches/${c.id}`)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm font-medium border rounded-lg disabled:opacity-40 enabled:hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm font-medium border rounded-lg disabled:opacity-40 enabled:hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <AddCoachModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </div>
  );
}
