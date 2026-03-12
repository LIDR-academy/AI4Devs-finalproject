import { ProtectedRoute } from "@/components/auth/protected-route";

export default function RetrievePage() {
  return (
    <ProtectedRoute>
      <div className="rounded-xl border border-slate-200 bg-white p-6">Retrieve page placeholder</div>
    </ProtectedRoute>
  );
}
