import { ProtectedRoute } from "@/components/auth/protected-route";

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <div className="rounded-xl border border-slate-200 bg-white p-6">Upload page placeholder</div>
    </ProtectedRoute>
  );
}
