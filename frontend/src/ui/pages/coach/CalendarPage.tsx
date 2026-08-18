import { useState } from "react";
import { ClassCalendar } from "@/ui/components/ClassCalendar";
import { CreateBlockModal } from "@/ui/components/CreateBlockModal";
import { CreateClassModal } from "@/ui/components/CreateClassModal";

export function CoachCalendarPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);

  return (
    <div>
      <div className="hidden items-center justify-between md:flex">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
          <p className="mt-2 text-gray-500">Manage your weekly class schedule here.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setBlockModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800"
          >
            Add Block
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Add Class
          </button>
        </div>
      </div>
      <ClassCalendar onAddClass={() => setModalOpen(true)} />
      <CreateClassModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
      <CreateBlockModal
        open={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onSuccess={() => setBlockModalOpen(false)}
      />
    </div>
  );
}
