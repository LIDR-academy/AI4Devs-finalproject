import type { Metadata } from "next";

import { DashboardView } from "@/components/auth/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Account dashboard with API key status and usage insights.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
