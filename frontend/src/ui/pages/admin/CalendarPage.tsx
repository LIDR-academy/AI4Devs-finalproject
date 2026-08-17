import { useState } from "react";
import { CreateClassModal } from "@/ui/components/CreateClassModal";

export function AdminCalendarPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
          <p className="mt-2 text-gray-500">Manage your weekly class schedule here.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Add Class
        </button>
      </div>
      <CreateClassModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </div>
  );
}
