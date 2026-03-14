"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "@/lib/toast";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);

    const onOffline = () => {
      setOffline(true);
      toast.warning("You are offline. Some actions may be unavailable.");
    };

    const onOnline = () => {
      setOffline(false);
      toast.info("Connection restored.");
    };

    sync();
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-2 text-amber-900">
      <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm">
        <WifiOff className="h-4 w-4" />
        <span>You&apos;re offline. Showing cached data when available.</span>
      </div>
    </div>
  );
}
