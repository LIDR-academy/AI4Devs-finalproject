import { useEffect, useState } from "react";
import {
  type PushAffordance,
  resetNavigationGuard,
  runPushRegistration,
} from "@/infrastructure/notifications/pushManager";

const INITIAL: PushAffordance = {
  visible: false,
  onAccept: () => {},
  onDismiss: () => {},
};

export function usePushRegistration() {
  const [affordance, setAffordance] = useState<PushAffordance>(INITIAL);

  useEffect(() => {
    let cancelled = false;

    runPushRegistration().then((result) => {
      if (!cancelled) setAffordance(result);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return affordance;
}

export function usePushResetOnLogout() {
  useEffect(() => {
    resetNavigationGuard();
  }, []);
}
