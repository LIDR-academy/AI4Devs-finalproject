import { ProtectedRoute } from "@/components/auth/protected-route";

export default function FilesPage() {
  return (
    <ProtectedRoute>
      <div className="rounded-xl border border-slate-200 bg-white p-6">Files page placeholder</div>
    </ProtectedRoute>
  );
}
