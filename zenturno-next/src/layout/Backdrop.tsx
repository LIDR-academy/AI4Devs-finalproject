"use client";

import { useSidebar } from "@/context/SidebarContext";

export default function Backdrop() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={toggleMobileSidebar}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}
    </>
  );
}
