"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";
import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import Backdrop from "@/layout/Backdrop";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <AppSidebar />
          
          {/* Backdrop for mobile sidebar */}
          <Backdrop />
          
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {/* Header */}
            <AppHeader />
            
            {/* Main content */}
            <main className="p-4 md:p-6 2xl:p-10">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
