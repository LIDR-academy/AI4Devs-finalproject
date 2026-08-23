import { usePushRegistration } from "@/infrastructure/hooks/usePushRegistration";
import { PushAffordanceBanner } from "@/ui/components/PushAffordanceBanner";

export function PushNotificationPrompt() {
  const { visible, onAccept, onDismiss } = usePushRegistration();

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-20 max-w-lg mx-auto sm:left-auto sm:right-4">
      <PushAffordanceBanner onAccept={onAccept} onDismiss={onDismiss} />
    </div>
  );
}
